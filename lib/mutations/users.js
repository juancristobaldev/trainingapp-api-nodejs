
const { PrismaClient } = require('@prisma/client')
const TokenGenerator = require('uuid-token-generator');
const prisma = new PrismaClient()
const tokengen = new TokenGenerator(256, TokenGenerator.BASE62)

module.exports = { 
    createUser: async (args) => {

        const errors = {},
        {user,first_name,last_name,email,pass} = args.input;
        let result;

        const users = await prisma.users.findMany({
            where:{
                user:user
            }
        })
        const emails = await prisma.users.findMany({
            where:{
                email:email
            }
        })

        console.log(emails)

        if(!user) errors.user = 'El nombre de usuario es obligatorio.'
        if(!first_name || !last_name) errors.names = 'El nombre y el apellido son obligatorios.'
        if(!email) errors.email = 'El correo electronico es obligatorio.'
        if(!pass) errors.pass = 'La contraseña es obligatoria.'
        if(users.length > 0) errors.user_exist = 'Este usuario ya esta en uso.'
        if(emails.length > 0) errors.email_exist = 'Este email ya esta en uso.'

        const arrayErrors = Object.values(errors)
        
        if(arrayErrors.length === 0) result = await prisma.users.create({
            data:{
                ...args.input,
                last_workouts: JSON.stringify([]),
                token:tokengen.generate()
            }
        })

         return {
            errors: JSON.stringify(errors) || null,
            success: result ? true : false
        } 
    },
    deleteUser: async (args) => {
        const errors = [],
        {token} = args.input;
        let result;

        if(!token) errors.push('El token es obligatorio')

        if(errors.length === 0) result = await prisma.users.delete({
            where:{
                token:token
            }
        })

        return {
            errors: JSON.stringify(errors),
            success: result ? true : false
        }
    },
    updateUser: async (args) => {
        
        const errors = []
        let result;

        const {id,user,email,pass,last_workouts} = args.input;

        if(!id) errors.push('El id es obligatorio')
        if(!user && !email && !pass && !last_workouts) errors.push('Debes actualizar alguna propiedad')
        
        if(errors.length === 0){
            result = await prisma.users.update({
                where:{
                    id:id
                },
                data:{
                    ...args.input
                }
            })
            return {
                errors:JSON.stringify(errors),
                success:true
            }
        }
    },
    userSignIn: async (args, req ) => {
        const errors = {},
        {user,pass} = args.input;

        if(!user) errors.user = 'Ingresa un nombre de usuario.'
        if(!pass) errors.pass = 'Ingresa una contraseña.'

        const errorsLength = Object.values(errors).length

        if(errorsLength === 0){
            const userResponse = await prisma.users.findMany({
                where:{
                    user:user
                }
            })
            if(!userResponse.length) return { errors:JSON.stringify({...errors, user_auth:'Este nombre de usuario no esta registrado.'}),success:false }
            else{
                if(userResponse[0].pass === pass){
                    return {
                        errors:JSON.stringify([]),
                        success:true,
                        user:JSON.stringify(userResponse[0]),
                        token:userResponse[0].token
                    }
                }else{
                    return { errors:JSON.stringify({...errors, user_pass:'Contraseña incorrecta.'}),success:false }
                }
            }
        }else return {
            errors:JSON.stringify(errors),
            success:false
        }
    },
    userSignInRRSS: async (args,req) => {

        console.log(args)

        let result, dataUser;
        
        const {email} = args.input

        const userResponseEmail = await prisma.users.findUnique({
            where:{
                email:email
            }
        })

        if(!userResponseEmail) {

            dataUser = {
                ...args.input,
                last_workouts:JSON.stringify([]),
                date:'11/11/11',
                token:tokengen.generate()
            }

            result = await prisma.users.create({
                data:{
                    ...dataUser
                }
            })
            
        }

        return {
            errors:JSON.stringify([]),
            success: userResponseEmail ? true : result ? true : false,
            user:userResponseEmail ? JSON.stringify(userResponseEmail) : result ? JSON.stringify(dataUser) : false,
            token:userResponseEmail ? userResponseEmail.token : result ? dataUser.token : false,
            register: userResponseEmail ? false : true
        }
    }
} 
