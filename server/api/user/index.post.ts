import { defineEventHandler, readBody, createError } from 'h3'
import { verifyToken } from '~~/server/utils/auth'
import prisma from '~~/server/utils/prisma'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  // ตรวจสอบ JWT และสิทธิ์ admin
  const tokenPayload = verifyToken(event)
  const adminUser = await prisma.user.findUnique({
    where: { id: tokenPayload.userId },
    include: { roles: { include: { role: true } } }
  })
  if (!adminUser || !adminUser.roles.some(r => r.role.roleName === 'admin')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admin can manage users' })
  }
  
  const body = await readBody(event)
  const { username, email, password, branchId } = body
  
  if (!username || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'username, email, and password are required' })
  }
  
  // ตรวจสอบว่ามีผู้ใช้งานนี้อยู่แล้วหรือไม่
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    }
  })
  
  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'User with provided username or email already exists' })
  }
  
  // ทำการ Hash password
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      branchId: branchId ? parseInt(branchId, 10) : undefined,
      del: 0
    }
  })
  
  // ไม่ส่งกลับ passwordHash
  const { passwordHash: _ignore, ...userWithoutPassword } = newUser
  return userWithoutPassword
})
