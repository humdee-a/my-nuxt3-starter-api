import { H3Event, createError } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'

export function verifyToken(event: H3Event) {
  const authHeader = event.req.headers.authorization
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header missing' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
}
