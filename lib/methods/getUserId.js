const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getUserId = async (token) => {
    const user = await prisma.users.findUnique({
        where:{
            token:token
        }
    })

    return user.id
}

module.exports = {getUserId}