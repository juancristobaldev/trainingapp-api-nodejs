const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
    createFolder: async args => {
        const {token,name,content} = args.input,
        errors = [];
        let result;

        if (!token) errors.push('Token de usuario obligatorio.')
        if (!name) errors.push('Nombre de carpeta obligatorio.')

        if(errors.length === 0) {
            result = await prisma.folders.create({
                data:{
                    ...args.input
                }
            })
        }

        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }
        
    },
    deleteFolder: async args => {
        const {id,token} = args.input,
        errors = [];
        let result;

        if (!id) errors.push("Id de carpeta obligatorio.")
        if (!token) errors.push("Token de usuario obligatorio")

        if (errors.length === 0) result = await prisma.folders.delete({
            where:{id:id}
        })

        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }


    },
    updateFolder: async args => {
        
        const {id,name,content} = args.input,
        errors = [];

        let result;

        if(!id) errors.push('El id es obligatorio')
        if(!content && !name) errors.push('Debes actualizar alguna propiedad')
        
        if(errors.length === 0) result = await prisma.folders.update({
            where:{id:id},
            data:{
                ...args.input
            }
        })

        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }
    }
 }
 