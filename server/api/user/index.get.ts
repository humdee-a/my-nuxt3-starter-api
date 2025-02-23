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
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admin can manage users' })
  }

  // ดึงผู้ใช้งานที่ยังไม่ถูก soft delete (del = 0)
  const users = await prisma.user.findMany({
    where: { del: 0 }
  })

  // ลบข้อมูล passwordHash ออกจากผลลัพธ์
  return users.map(({ passwordHash, ...userWithoutPassword }) => userWithoutPassword)
})
