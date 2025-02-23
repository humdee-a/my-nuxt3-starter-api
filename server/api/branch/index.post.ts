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
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admin can manage branches' })
  }

  const body = await readBody(event)
  const { branchCode, branchName, address, phone } = body
  if (!branchCode || !branchName) {
    throw createError({ statusCode: 400, statusMessage: 'branchCode and branchName are required' })
  }

  // ตรวจสอบว่ามี branchCode ซ้ำหรือไม่
  const existingBranch = await prisma.branch.findUnique({ where: { branchCode } })
  if (existingBranch) {
    throw createError({ statusCode: 400, statusMessage: 'Branch code already exists' })
  }

  const branch = await prisma.branch.create({
    data: {
      branchCode,
      branchName,
      address,
      phone,
      del: 0
    }
  })
  return branch
})
