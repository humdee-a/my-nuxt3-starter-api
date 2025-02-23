import { defineEventHandler, readBody, createError, getMethod } from 'h3'
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
  
  // รับค่า id จาก URL params
  const { id } = event.context.params as { id: string }
  const userRoleId = parseInt(id, 10)
  if (isNaN(userRoleId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user role id' })
  }
  
  const method = getMethod(event)
  if (method === 'GET') {
    // ดึงข้อมูล UserRole ตาม id
    const userRole = await prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: { user: true, role: true }
    })
    if (!userRole || userRole.del === 1) {
      throw createError({ statusCode: 404, statusMessage: 'User role not found' })
    }
    return userRole
  } else if (method === 'PUT') {
    // อัปเดตข้อมูล UserRole (สามารถปรับเปลี่ยน userId หรือ roleId ได้)
    const body = await readBody(event)
    const { userId, roleId } = body
    const updatedUserRole = await prisma.userRole.update({
      where: { id: userRoleId },
      data: { userId, roleId }
    })
    return updatedUserRole
  } else if (method === 'DELETE') {
    // Soft delete: อัปเดตฟิลด์ del เป็น 1
    const deletedUserRole = await prisma.userRole.update({
      where: { id: userRoleId },
      data: { del: 1 }
    })
    return { message: 'User role deleted successfully', userRole: deletedUserRole }
  } else {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
