import { defineEventHandler, createError } from 'h3'
import { verifyToken } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ตรวจสอบ token ที่ส่งมาจาก client ผ่าน header
    const tokenPayload = verifyToken(event)
    
    // สำหรับ JWT แบบ stateless การ Logout ส่วนใหญ่จะถูกจัดการที่ฝั่ง Client
    // หากต้องการ implement token blacklist สามารถเพิ่ม logic ลงที่นี่ได้
    return { message: 'Logout successful', user: tokenPayload }
  } catch (error) {
    // หากไม่พบหรือ token ไม่ถูกต้อง ให้ส่ง error กลับไป
    throw createError({ statusCode: 401, statusMessage: 'Invalid or missing token' })
  }
})
