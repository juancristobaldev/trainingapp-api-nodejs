
const { PrismaClient } = require('@prisma/client')
const TokenGenerator = require('uuid-token-generator');
const prisma = new PrismaClient()
const tokengen = new TokenGenerator(256, TokenGenerator.BASE62)

module.exports = { 
    createUser: async (args) => {

        const errors = {},
        {first_name,last_name,email,password} = args.input;
        let result;


        const emails = await prisma.users.findMany({
            where:{
                email:email
            }
        })

        console.log(emails)

        if(!first_name || !last_name) errors.names = 'El nombre y el apellido son obligatorios.'
        if(!email) errors.email = 'El correo electronico es obligatorio.'
        if(!password) errors.password = 'La contraseña es obligatoria.'
        if(emails.length > 0) errors.email_exist = 'Este email ya esta en uso.'

        const arrayErrors = Object.values(errors)

        const userData = {
            ...args.input,
            last_workouts: JSON.stringify([]),
            token:tokengen.generate()
        }
         
        if(arrayErrors.length === 0) result = await prisma.users.create({
            data:{
                ...userData
            }
        })

        return {
            errors: JSON.stringify(errors) || null,
            success: result ? true : false,
            token: result ? userData.token : false
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

        const {id,email,password,last_workouts} = args.input;

        if(!id) errors.push('El id es obligatorio')
        if(!email && !password && !last_workouts) errors.push('Debes actualizar alguna propiedad')
        
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
        {email,password} = args.input;

        if(!email) errors.email = 'Ingresa un email.'
        if(!password) errors.password = 'Ingresa una contraseña.'

        const errorsLength = Object.values(errors).length

        if(errorsLength === 0){
            const userResponse = await prisma.users.findMany({
                where:{
                    email:email
                }
            })
            if(!userResponse.length) return { errors:JSON.stringify({...errors, user_auth:'Este email no se encuentra registrado.'}),success:false }
            else{
                if(userResponse[0].password === password){
                    return {
                        errors:JSON.stringify([]),
                        success:true,
                        user:JSON.stringify(userResponse[0]),
                        token:userResponse[0].token
                    }
                }else{
                    return { errors:JSON.stringify({...errors, user_password:'Contraseña incorrecta.'}),success:false }
                }
            }
        }else return {
            errors:JSON.stringify(errors),
            success:false
        }
    },
    userSignInRRSS: async (args,req) => {

        let result, dataUser;

        const {email} = args.input

        const userResponseEmail = await prisma.users.findUnique({
            where:{
                email:email
            }
        })

        if(!userResponseEmail) {

            console.log(args.input)

            dataUser = {
                ...args.input,
                last_workouts:JSON.stringify([]),
                token: await tokengen.generate()
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
