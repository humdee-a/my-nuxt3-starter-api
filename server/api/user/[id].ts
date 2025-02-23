import { defineEventHandler, readBody, createError, getMethod } from 'h3'
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
  
  // รับค่า id จาก URL parameters
  const { id } = event.context.params as { id: string }
  const userId = parseInt(id, 10)
  if (isNaN(userId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  }
  
  const method = getMethod(event)
  if (method === 'GET') {
    // ดึงข้อมูลผู้ใช้งานเฉพาะรายการ
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    if (!user || user.del === 1) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }
    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  } else if (method === 'PUT') {
    // อ่านข้อมูลที่ต้องการอัปเดต
    const body = await readBody(event)
    const { username, email, password, branchId } = body
    let data: any = {}
    if (username) data.username = username
    if (email) data.email = email
    if (branchId !== undefined) data.branchId = branchId
    if (password) {
      const saltRounds = 10
      data.passwordHash = await bcrypt.hash(password, saltRounds)
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data
    })
    const { passwordHash, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  } else if (method === 'DELETE') {
    // Soft delete: อัปเดตฟิลด์ del เป็น 1
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { del: 1 }
    })
    const { passwordHash, ...userWithoutPassword } = deletedUser
    return { message: 'User deleted successfully', user: userWithoutPassword }
  } else {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
})
