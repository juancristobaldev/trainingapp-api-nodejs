const query = require('../db');
const TokenGenerator = require('uuid-token-generator');

module.exports = { 
    createUser: async (args) => {
        const errors = [],
        {user,first_name,last_name,email,pass} = args.input;
        let result;

        const users = await query(`SELECT * FROM users WHERE user = "${user}"`)
        const emails = await query(`SELECT * FROM users WHERE email = "${email}"`)

        if(!user) errors.push('El nombre de usuario es obligatorio.')
        if(!first_name || !last_name) errors.push('El nombre y el apellido son obligatorios.')
        if(!email) errors.push('El correo electronico es obligatorio.')
        if(!pass) errors.push('La contraseña es obligatoria.')
        if(users.length > 0) errors.push('Este usuario ya esta en uso.')
        if(emails.length > 0) errors.push('Este email ya esta en uso.')
        
        if(errors.length === 0){
            
            result = await query('INSERT INTO users (user,first_name,last_name,email,date,pass) VALUES ?', args)
            .then(data => data)
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
        {id,user,email,pass} = args.input;
        let result;

        if(!id) errors.push('El id es obligatorio')
        if(!user && !email && !pass) errors.push('Debes actualizar alguna propiedad')
        
        if(errors.length === 0){
            result = await query('UPDATE users SET ? WHERE id = ?', args).then(data => data)
        }

        return {
            errors:JSON.stringify(errors),
            success:result
        }

    },
    userSignIn: async (args, {req} ) => {

        const errors = [],
        {user,pass} = args.input;

        if(!user) errors.push('Ingresa un nombre de usuario.')
        if(!pass) errors.push('Ingresa una contraseña.')

        if(errors.length === 0){
            const userResponse = await query(`SELECT * FROM users WHERE user = '${user}' AND pass = '${pass}'`)
            if(!userResponse.length) return {errors:'Usuario y/o contraseña incorrecta',success:false}
            else{
                const tokengen = new TokenGenerator(256, TokenGenerator.BASE62),
                token = tokengen.generate();
                console.log(userResponse)
                return {
                    errors:JSON.stringify([]),
                    success:true,
                    user:JSON.stringify(userResponse[0]),
                    token:token
                }
            }
        }else return {
            errors:JSON.stringify(errors),
            success:false
        }
    }
}