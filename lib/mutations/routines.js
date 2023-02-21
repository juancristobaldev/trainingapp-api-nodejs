
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const {notFoundToken} = require('../methods/notFoundToken')
const {getUserId} = require('../methods/getUserId')

module.exports = {
    createRoutine: async (args,context) => {
        const errors = [];
        let result;

        if(context.headers.authorization){
            result = await prisma.routines.create({
                data:{
                    ...args.input,
                }
            })
        }else notFoundToken('Not Found Autorization Token', 'UNAUTH')

        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }

    },
    deleteRoutine: async (args,context) => {
        const {id} = args.input,
        errors = []
        let result

        if(context.headers.authorization){
            result = await prisma.routines.delete({
                where:{
                   id:id
                }
            })
        } else notFoundToken('Not Found Autorization Token', 'UNAUTH')
        
        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }
    },
    updateRoutine: async (args,context) => {
        const errors = [];

        const {
            id,
            name,
            dones,
            timeRecord,
        } = args.input;

        let result

        if(context.headers.authorization){
            if(!name && !dones && !timeRecord) errors.push('Debes actualizar alguna propiedad');
        
            if(!errors.length) {
    
                result = await prisma.routines.update({
                    where:{id:id},
                    data:{
                        ...args.input
                    }
                })
            }
        } else notFoundToken('Not Found Autorization Token', 'UNAUTH')
        
        return {
            errors:JSON.stringify(errors),
            success:result ? true : false
        }
    }
}