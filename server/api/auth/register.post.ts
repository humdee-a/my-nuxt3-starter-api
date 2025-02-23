import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~~/server/utils/prisma'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password, email } = body

  if (!username || !password || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // ตรวจสอบว่ามีผู้ใช้งานนี้อยู่แล้วหรือไม่
  const existingUser = await prisma.user.findUnique({ where: { username } })
  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'Username already exists' })
  }

  // ทำการ Hash Password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // สร้างผู้ใช้งานใหม่ในฐานข้อมูล
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashedPassword
    }
  })

  return { user_id: user.id, username: user.username, message: 'Registration successful' }
})
