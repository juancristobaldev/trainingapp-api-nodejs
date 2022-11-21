const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = {
    getUsers: async () => await prisma.users.findMany(),

    getUser: async (args) => prisma.users.findUnique({
        where:{
            token:args.token
        }
    }),
    getRoutinesByToken: async (args) => await prisma.routines.findMany({
        where:{
            token:args.token
        }
    }),
    getRoutineById: async (args) => await prisma.routines.findUnique({
        where:{
            id:args.id
        }
    }),
    getExercisesByToken: async (args) => await prisma.exercises.findMany({
        where:{
            token:args.token
        }
    }),
    getFoldersByToken: async args => await prisma.folders.findMany({
        where:{
            token:args.token
        }
    }),
    getFolderById: async args => await prisma.folders.findUnique({
        where:{
            id:args.id
        }
    })
}