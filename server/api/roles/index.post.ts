import { defineEventHandler, readBody, createError } from 'h3'
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

  const body = await readBody(event)
  const { roleName, description, canView, canAdd, canEdit, canDelete } = body
  if (!roleName) {
    throw createError({ statusCode: 400, statusMessage: 'Role name is required' })
  }

  // ตรวจสอบว่ามี Role ที่มีชื่อซ้ำกันหรือไม่
  const existingRole = await prisma.role.findFirst({
    where: { roleName }
  })

  if (existingRole) {
    throw createError({ statusCode: 400, statusMessage: 'Role name already exists' })
  }
  
  // สร้าง Role ใหม่
  const role = await prisma.role.create({
    data: {
      roleName,
      description,
      canView: canView === true,
      canAdd: canAdd === true,
      canEdit: canEdit === true,
      canDelete: canDelete === true,
      del: 0
    }
  })
  return role
})
