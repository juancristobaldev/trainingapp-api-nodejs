const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const {notFoundToken} = require('../methods/notFoundToken')

module.exports = {
    getUsers: async () => await prisma.users.findMany(),

    getUserByEmail: async (args) => await prisma.users.findUnique({
        where:{
            email:args.email
        }
    }),

    getUser: async (args,context) => {
        if(context.headers.authorization) return await prisma.users.findUnique({
            where:{
                token:context.headers.authorization
            }
        })
        else notFoundToken('Not Found Authorization Token','UNAUTH')
    },
    getRoutines: async (args,context) => {

        if(context.headers.authorization) {
            console.log('s')
            return await prisma.routines.findMany({
                where:{
                    user:{
                        token:{
                            contains:context.headers.authorization
                        }
                    }
                }
            })
        }
        else notFoundToken('Not Found Authorization Token','UNAUTH')
    },
    getRoutineById: async (args) => await prisma.routines.findUnique({
        where:{
            id:args.id
        }
    }),
    getExercises: async (args,context) => {
        
        if(context.headers.authorization) {
            return await prisma.exercises.findMany({
                where:{
                    user:{
                        token:{
                            contains:context.headers.authorization
                        }
                    }
                }
            })
        }
        else notFoundToken('Not Found Authorization Token','UNAUTH')
    },
    getFolders: async (args,context) => {
        if(context.headers.authorization) {
            return await prisma.folders.findMany({
                where:{
                    user:{
                        token:{
                            contains:context.headers.authorization
                        }
                    }
                }
            })
        }
        else notFoundToken('Not Found Authorization Token','UNAUTH')
    },
    getFolderById: async args => await prisma.folders.findUnique({
        where:{
            id:args.id
        }
    })
}