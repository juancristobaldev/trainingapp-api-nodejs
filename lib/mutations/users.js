const query = require('../db');
const TokenGenerator = require('uuid-token-generator');

module.exports = { 
    createUser: async (args) => {
        const errors = {},
        {user,first_name,last_name,email,pass} = args.input;
        let result;

        const users = await query(`SELECT * FROM users WHERE user = "${user}"`)
        const emails = await query(`SELECT * FROM users WHERE email = "${email}"`)

        if(!user) errors.user = 'El nombre de usuario es obligatorio.'
        if(!first_name || !last_name) errors.names = 'El nombre y el apellido son obligatorios.'
        if(!email) errors.email = 'El correo electronico es obligatorio.'
        if(!pass) errors.pass = 'La contraseña es obligatoria.'
        if(users.length > 0) errors.user_exist = 'Este usuario ya esta en uso.'
        if(emails.length > 0) errors.email_exist = 'Este email ya esta en uso.'

        const arrayErrors = Object.values(errors)
        
        if(arrayErrors.length === 0){

            const tokengen = new TokenGenerator(256, TokenGenerator.BASE62),
            token = tokengen.generate();
            args.input["token"] = token
            args.input["last_workouts"] = JSON.stringify([])

            result = await query('INSERT INTO users (user,first_name,last_name,email,date,pass,token,last_workouts) VALUES ?', args)
            .then(data => {
                return data
            })
        }

        return {
            errors:JSON.stringify(errors) || null,
            success:result || false
        }
    },
    deleteUser: async (args) => {
        const errors = [],
        {id} = args.input;
        let result;



        if(!id) errors.push('El id es obligatorio')

        if(errors.length === 0){
            result = await query('DELETE FROM users where id = ?',args)
            .then(data => data)
        }

        return {
            errors: JSON.stringify(errors),
            success: result
        }
    },
    updateUser: async (args) => {
        
        const errors = [],
        {id,user,email,pass,last_workouts} = args.input;
        let result;

        if(!id) errors.push('El id es obligatorio')
        if(!user && !email && !pass && !last_workouts) errors.push('Debes actualizar alguna propiedad')
        
        
        if(errors.length === 0){
            result = await query('UPDATE users SET ? WHERE id = ?', args)
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
            const userResponse = await query(`SELECT * FROM users WHERE user = '${user}'`)

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
    }
} 