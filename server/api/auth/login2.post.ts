import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  }

  // ดึง IP Address จาก request (รองรับ proxy ด้วย)
  const ipAddress = event.req.headers['x-forwarded-for'] || event.req.socket.remoteAddress || null

  // ค้นหาผู้ใช้งานจากฐานข้อมูลด้วย Prisma
  const user = await prisma.user.findUnique({ where: { username } })

  if (!user) {
    // บันทึก log การ login ล้มเหลว (ไม่พบ user)
    await prisma.loginLog.create({
      data: {
        ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
        success: false,
        userId: null,
        del: 0,
      }
    })
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // ตรวจสอบ password โดยเปรียบเทียบกับ password hash ที่เก็บไว้
  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    // บันทึก log การ login ล้มเหลว (password ไม่ถูกต้อง)
    await prisma.loginLog.create({
      data: {
        ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
        success: false,
        userId: user.id,
        del: 0,
      }
    })
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // บันทึก log การ login สำเร็จ
  await prisma.loginLog.create({
    data: {
      ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
      success: true,
      userId: user.id,
      del: 0,
    }
  })

  // สร้าง payload สำหรับ JWT
  const payload = { userId: user.id, username: user.username, email: user.email }

  // สร้าง access_token และ refresh_token ด้วย JWT
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })

  return { access_token, refresh_token, expires_in: JWT_EXPIRES_IN }
})
