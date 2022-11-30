
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const {notFoundToken} = require('../methods/notFoundToken')
const {getUserId} = require('../methods/getUserId')

module.exports = {
    createRoutine: async (args,context) => {
        const errors = [];
        let result;

        const {name} = args.input

        if(context.headers.authorization){
            if (!name) errors.push('Nombre de rutina obligatorio')
        
            if(errors.length === 0) result = await prisma.routines.create({
                data:{
                    ...args.input
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
        let result, me, last_workouts;

        if(context.headers.authorization){
            if(!id) errors.push('Id de rutina obligatorio')
        
            if(errors.length === 0){
                const userId = getUserId(context.headers.authorization)

                let folders = await prisma.folders.findMany({
                    where:{userId:userId}
                })
    
                if(folders.length){
                    for(var a = 0; a < folders.length; a++){
                        let content = JSON.parse(folders[a].content)
                        for(var b = 0; b < content.length; b++){
                            const int = parseInt(content[b].id)
                            if(int == id){
                                content.splice(b,1)
                                b = b - 1
                                let argFolder = {input:{ name:folders[a].name, content:JSON.stringify(content)}}
                                await prisma.folders.update({
                                    where:{
                                        id:folders[a].id
                                    },
                                    data:{
                                        ...argFolder
                                    }
                                })
                            } 
                        }
                    }
                }
                me = await prisma.users.findMany({
                    where:{token:context.headers.authorization}
                })
    
                last_workouts = JSON.parse(me[0].last_workouts)
    
                if(last_workouts.length){
                    const index = last_workouts.findIndex(item => item.id === id)
                    if(index >= 0){
                        last_workouts.splice(index,1)
                        await prisma.users.update({
                            where:{id:userId},
                            data:{
                                last_workouts:JSON.stringify(last_workouts)
                            }
                        })
                    }
                }
            
                result = await prisma.routines.delete({
                    where:{
                       id:id
                    }
                })
            }
        }else notFoundToken('Not Found Autorization Token', 'UNAUTH')
        
        return {
            errors:JSON.stringify(errors),
            success: result ? true : false
        }
    },
    updateRoutine: async (args) => {
        const errors = [];

        const {
            id,
            name,
            dones,
            timeRecord,
            exercises,
        } = args.input;

        let result, token, last_workouts, me, routine, folders;

        if(!name && !dones && !timeRecord && !exercises) errors.push('Debes actualizar alguna propiedad');
        
        if(!errors.length) {

            routine = await prisma.routines.findMany({where:{id:id}})
            token = routine[0].token

            me = await prisma.users.findMany({where:{token:token}})
            last_workouts = JSON.parse(me[0].last_workouts)

            folders = await prisma.folders.findMany({where:{token:token}})

            folders.forEach( async folder => {
                const content = JSON.parse(folder.content)
                for(var i = 0; i < content.length; i++){
                    if(content[i].id === id){
                        let newContent = [...content]
                        newContent[i] = {...args.input, exercises: exercises}
                        await prisma.folders.update({
                            where:{id:folder.id},
                            data:{
                                name:folder.name,
                                content:JSON.stringify(newContent)
                            }
                        })
                    } 
                }
            })
            
            if(routine[0].dones === dones){
                for(var i = 0; i < last_workouts.length; i++){
                    if(last_workouts[i].id === id){ 
                        last_workouts[i] = {...args.input}
                        await prisma.users.update({
                            where:{id:me[0].id},
                            data:{
                                last_workouts: JSON.stringify(last_workouts)
                            }
                        })
                    }
                }
            }else {
                if(last_workouts.length){
                    let index = last_workouts.findIndex(item => item.id === id),
                    someRoutine;
                    if(index >= 0) {
                        someRoutine = last_workouts[index]
                        last_workouts.splice(index,1)
                    }else if(last_workouts.length >= 3) last_workouts.pop()
                }
                last_workouts.unshift({...args.input})

                await prisma.users.update({
                    where:{id:me[0].id},
                    data:{
                        last_workouts: JSON.stringify(last_workouts)
                    }
                })
            }

            result = await prisma.routines.update({
                where:{id:id},
                data:{
                    ...args.input
                }
            })
        }
        
        return {
            errors:JSON.stringify(errors),
            success:result ? true : false
        }
    }
}