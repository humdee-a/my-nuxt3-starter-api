import { defineEventHandler, readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'
import prisma from '~~/server/utils/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

/**
 * Helper function: คำนวณวันหมดอายุของ refresh token จาก JWT_REFRESH_EXPIRES_IN
 * สมมติว่า format ที่ใช้คือ 'Nd' โดย N คือจำนวนวัน
 */
function getRefreshExpiryDate() {
  const match = JWT_REFRESH_EXPIRES_IN.match(/(\d+)d/)
  if (match) {
    const days = parseInt(match[1], 10)
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  }
  // ถ้าไม่ match ให้ default 7 วัน
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { refresh_token } = body

  if (!refresh_token) {
    throw createError({ statusCode: 400, statusMessage: 'Refresh token is required' })
  }

  try {
    // ตรวจสอบความถูกต้องของ refresh token ด้วย JWT
    const payload = jwt.verify(refresh_token, JWT_SECRET)
    // payload ควรมีข้อมูล userId, username, email เป็นต้น

    // ตรวจสอบว่า refresh token นี้มีอยู่ในฐานข้อมูลหรือไม่
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refresh_token }
    })

    if (!tokenRecord) {
      throw createError({ statusCode: 401, statusMessage: 'Refresh token not found' })
    }

    // ตรวจสอบว่า refresh token นี้ยังไม่ถูก revoke
    if (tokenRecord.revokedAt) {
      throw createError({ statusCode: 401, statusMessage: 'Refresh token has been revoked' })
    }

    // บันทึก log: revoke token เก่าโดยอัปเดต revokedAt เป็นเวลาปัจจุบัน
    await prisma.refreshToken.update({
      where: { token: refresh_token },
      data: { revokedAt: new Date() }
    })

    // สร้าง access token ใหม่
    const newAccessToken = jwt.sign(
      { 
        userId: (payload as any).userId, 
        username: (payload as any).username, 
        email: (payload as any).email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // สร้าง refresh token ใหม่
    const newRefreshToken = jwt.sign(
      { 
        userId: (payload as any).userId, 
        username: (payload as any).username, 
        email: (payload as any).email 
      },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    )

    // บันทึก refresh token ใหม่ในฐานข้อมูล
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        user: { connect: { id: (payload as any).userId } },
        expiresAt: getRefreshExpiryDate(),
        del: 0
      }
    })

    return { access_token: newAccessToken, refresh_token: newRefreshToken, expires_in: JWT_EXPIRES_IN }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' })
  }
})
