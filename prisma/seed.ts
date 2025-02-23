import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ตรวจสอบว่ามี role admin อยู่หรือไม่ ถ้าไม่มีก็สร้างใหม่
  let adminRole = await prisma.role.findUnique({
    where: { roleName: 'admin' },
  })

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        roleName: 'admin',
        description: 'Administrator with full permissions',
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        del: 0,
      },
    })
    console.log('Created admin role')
  }

  // ตรวจสอบว่ามี user admin อยู่หรือไม่ ถ้าไม่มีก็สร้างใหม่
  let adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  })

  if (!adminUser) {
    const defaultPassword = 'admin' // กำหนด password เริ่มต้น (แนะนำให้เปลี่ยนหลังจาก seed)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds)
    adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        del: 0,
      },
    })
    console.log('Created admin user')
  }

  // ตรวจสอบว่ามีการกำหนด role ให้ user admin แล้วหรือไม่
  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
        del: 0,
      },
    })
    console.log('Assigned admin role to admin user')
  }

  console.log('Seed completed successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
