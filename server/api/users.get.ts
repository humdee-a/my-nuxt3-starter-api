import { defineEventHandler } from 'h3'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany()
  return users
})
