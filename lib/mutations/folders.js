const query = require('../db')

module.exports = {
    createFolder: async args => {
        const {token,name,content} = args.input,
        errors = [];
        let result;

        console.log(args.input)

        if (!token) errors.push('Token de usuario obligatorio.')
        if (!name) errors.push('Nombre de carpeta obligatorio.')

        console.log(JSON.parse(content))

        if(errors.length === 0) {
            result = await query('INSERT INTO folders (token,name,content) VALUES ?', args)
            .then(data => {
                console.log(data)
                return data
            })

            return {
                errors:JSON.stringify(errors),
                success:true
            }
        }else return {
            errors:JSON.stringify(errors),
            success:false
        }
        
    },
    deleteFolder: async args => {
        const {id,token} = args.input,
        errors = [];
        let result;

        if (!id) errors.push("Id de carpeta obligatorio.")
        if (!token) errors.push("Token de usuario obligatorio")

        if (errors.length === 0){
            result = await query(`DELETE FROM folders WHERE id = ${id} AND token = "${token}"`)
            if(result) return {
                errors:JSON.stringify(errors),
                success:true
            }
        }
        else return {
            errors:JSON.stringify(errors),
            success:false
        }


    },
    updateFolder: async args => {

        const errors = [],
        {id,name,content} = args.input;
        let result;

        if(!id) errors.push('El id es obligatorio')
        if(!content && !name) errors.push('Debes actualizar alguna propiedad')
        
        if(errors.length === 0){
            result = await query('UPDATE folders SET ? WHERE id = ?', args)
            if(result) return {
                errors:JSON.stringify(errors),
                success:true
            }
        }else return {
            errors:JSON.stringify(errors),
            success:false
        }

    }
 }
 