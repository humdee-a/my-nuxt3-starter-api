import { defineEventHandler, readBody, createError, getMethod } from 'h3'
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
  
  // รับ id จาก URL params
  const { id } = event.context.params as { id: string }
  const roleId = parseInt(id, 10)
  if (isNaN(roleId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid role id' })
  }

  // ดึงข้อมูล Role โดย id
  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) {
    throw createError({ statusCode: 404, statusMessage: 'Role not found' })
  }
  
  const method = getMethod(event)
  if (method === 'GET') {
    return role
  } else if (method === 'PUT') {
    // อัปเดตข้อมูล Role
    const body = await readBody(event)
    const { roleName, description, canView, canAdd, canEdit, canDelete } = body
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        roleName,
        description,
        canView: canView === true,
        canAdd: canAdd === true,
        canEdit: canEdit === true,
        canDelete: canDelete === true,
      }
    })
    return updatedRole
  } else if (method === 'DELETE') {
    // ทำการ soft delete โดย set del เป็น 1
    const deletedRole = await prisma.role.update({
      where: { id: roleId },
      data: { del: 1 }
    })
    return { message: 'Role deleted successfully', role: deletedRole }
  } else {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
