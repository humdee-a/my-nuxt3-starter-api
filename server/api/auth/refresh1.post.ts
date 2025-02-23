import { defineEventHandler, readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { refresh_token } = body

  if (!refresh_token) {
    throw createError({ statusCode: 400, statusMessage: 'Refresh token is required' })
  }

  try {
    // ตรวจสอบความถูกต้องของ refresh_token
    const payload = jwt.verify(refresh_token, JWT_SECRET)
    
    // (ถ้ามีการจัดเก็บ refresh token ในฐานข้อมูล สามารถตรวจสอบเพิ่มเติมได้ที่นี่)
    
    // สร้าง access_token ใหม่โดยใช้ข้อมูลจาก payload
    // สามารถเลือกส่งเฉพาะข้อมูลที่จำเป็นเท่านั้น
    const newAccessToken = jwt.sign(
      { userId: payload.userId, username: payload.username, email: payload.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return { access_token: newAccessToken, expires_in: JWT_EXPIRES_IN }
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' })
  }
})