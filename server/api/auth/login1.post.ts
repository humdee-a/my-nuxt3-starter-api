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

  // ค้นหาผู้ใช้งานจากฐานข้อมูลด้วย Prisma
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // ตรวจสอบ password โดยเปรียบเทียบกับ password hash ที่เก็บไว้
  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // สร้าง payload สำหรับ JWT
  const payload = { userId: user.id, username: user.username, email: user.email }

  // สร้าง access_token และ refresh_token ด้วย JWT
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })

  // สามารถเก็บ refresh_token ในฐานข้อมูลสำหรับการจัดการ token revocation ได้ที่นี่

  return {payload, access_token, refresh_token, expires_in: JWT_EXPIRES_IN }
})
