import { defineEventHandler, createError } from 'h3'
import { verifyToken } from '~~/server/utils/auth'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  // ตรวจสอบ Token และสิทธิ์ admin
  const tokenPayload = verifyToken(event)
  const user = await prisma.user.findUnique({
    where: { id: tokenPayload.userId },
    include: { roles: { include: { role: true } } }
  })
  if (!user || !user.roles.some(r => r.role.roleName === 'admin')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admin can manage roles' })
  }
  // ดึง Role ทั้งหมดที่ยังไม่ถูกลบ (del = 0)
  const roles = await prisma.role.findMany({
    // where: { del: 0 }
  })
  return roles
})
