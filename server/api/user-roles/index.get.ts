import { defineEventHandler, createError } from 'h3'
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

  // ดึงรายการ UserRole ที่ยังไม่ถูกลบ (del = 0)
  const userRoles = await prisma.userRole.findMany({
    where: { del: 0 },
    include: { user: true, role: true }
  })
  return userRoles
})
