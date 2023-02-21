const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const {notFoundToken} = require('../methods/notFoundToken')
const {getUserId} = require('../methods/getUserId')

module.exports = {
    createFolder: async (args,context) => {
        const {name} = args.input,
        errors = [];
        let result;

        if(context.headers.authorization) {
            if (!name) errors.push('Nombre de carpeta obligatorio.')

            if(errors.length === 0) {
                const userId = await getUserId(context.headers.authorization)
                result = await prisma.folders.create({
                    data:{
                        ...args.input,
                        userId:userId
                    }
                })
            }
        } 
        else notFoundToken('Not Found Authorization Token','UNAUTH')
        
        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }
        
    },
    deleteFolder: async (args,context) => {
        const {id} = args.input,
        errors = [];
        let result;

        if(context.headers.authorization) {
            if (!id) errors.push("Id de carpeta obligatorio.")

            if (errors.length === 0) result = await prisma.folders.delete({
                where:{id:id}
            })
        }
        else notFoundToken('Not Found Authorization Token','UNAUTH')
        

        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }


    },
    updateFolder: async (args,context) => {
        
        const {id,name} = args.input,
        errors = [];

        let result;

        if(context.headers.authorization){
            if(!id) errors.push('El id es obligatorio')
            if(!name) errors.push('Debes actualizar alguna propiedad')
            
            if(errors.length === 0) result = await prisma.folders.update({
                where:{id:id},
                data:{
                    ...args.input
                }
            })
        }
        else notFoundToken('Not Found Authorization Token','UNAUTH')

        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }
    }
 }
 