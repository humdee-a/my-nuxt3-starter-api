import { defineEventHandler } from 'h3'
import { verifyToken } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = verifyToken(event)
  return { message: 'This is protected data', user }
  // return { message: 'This is protected data' }
})
