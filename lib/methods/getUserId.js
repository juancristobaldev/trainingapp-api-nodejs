const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getUserId = async (token) => {
    const user = await prisma.users.findUnique({
        where:{
            token:token
        }
    })

   console.log(user)
}

module.exports = {getUserId}