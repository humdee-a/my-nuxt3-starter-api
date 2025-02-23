import { defineEventHandler, readBody, createError } from 'h3'
import { verifyToken } from '~~/server/utils/auth'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  // ตรวจสอบ JWT และสิทธิ์ admin
  const tokenPayload = verifyToken(event)
  const adminUser = await prisma.user.findUnique({
    where: { id: tokenPayload.userId },
    include: { roles: { include: { role: true } } }
  })
  if (!adminUser || !adminUser.roles.some(r => r.role.roleName === 'admin')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admin can manage user roles' })
  }

  const body = await readBody(event)
  const { userId, roleId } = body
  if (!userId || !roleId) {
    throw createError({ statusCode: 400, statusMessage: 'userId and roleId are required' })
  }

  // ตรวจสอบว่ามีการกำหนด role ให้ผู้ใช้งานนี้อยู่แล้วหรือไม่ (ที่ยังไม่ถูกลบ)
  const existingAssignment = await prisma.userRole.findFirst({
    where: { userId, roleId, del: 0 }
  })
  if (existingAssignment) {
    throw createError({ statusCode: 400, statusMessage: 'User already assigned to this role' })
  }

  const newUserRole = await prisma.userRole.create({
    data: {
      userId,
      roleId,
      del: 0
    }
  })
  return newUserRole
})
