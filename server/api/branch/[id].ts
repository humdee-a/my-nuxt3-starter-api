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
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admin can manage branches' })
  }
  
  // รับค่า id จาก URL parameters
  const { id } = event.context.params as { id: string }
  const branchId = parseInt(id, 10)
  if (isNaN(branchId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid branch id' })
  }
  
  const method = getMethod(event)
  if (method === 'GET') {
    // ดึงข้อมูล branch เฉพาะรายการ
    const branch = await prisma.branch.findUnique({ where: { id: branchId } })
    if (!branch || branch.del === 1) {
      throw createError({ statusCode: 404, statusMessage: 'Branch not found' })
    }
    return branch
  } else if (method === 'PUT') {
    // อัปเดตข้อมูล branch
    const body = await readBody(event)
    const { branchCode, branchName, address, phone } = body
    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        branchCode,
        branchName,
        address,
        phone
      }
    })
    return updatedBranch
  } else if (method === 'DELETE') {
    // Soft delete: อัปเดตฟิลด์ del เป็น 1
    const deletedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: { del: 1 }
    })
    return { message: 'Branch deleted successfully', branch: deletedBranch }
  } else {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
