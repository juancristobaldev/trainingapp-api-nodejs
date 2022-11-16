
const query = require('../db')

module.exports = {
    createRoutine: async (args) => {
        const errors = [];
        let result;

        const {token,name} = args.input
        if (!token) errors.push('Token es obligatorio')
        if (!name) errors.push('Nombre de rutina obligatorio')
        
        if(errors.length === 0) {
            result = await query('INSERT INTO routines (token,name,dones,timeRecord,exercises) VALUES ?',args)
            if(result) return {
                errors:JSON.stringify(errors),
                success:true
            }
        }else return {
            errors:JSON.stringify(errors),
            success:false
        }

    },
    deleteRoutine: async (args) => {
        const {token, id} = args.input,
        errors = []
        let result, me, last_workouts, idUser;

        if(!token || !id) errors.push('El token y el id es obligatorio')
        
        if(errors.length === 0){
            let folders = await query(`SELECT * FROM folders WHERE token = "${token}"`)
            if(folders.length){
                for(var a = 0; a < folders.length; a++){
                    let content = JSON.parse(folders[a].content)
                    for(var b = 0; b < content.length; b++){
                        const int = parseInt(content[b].id)
                        if(int == id){
                            content.splice(b,1)
                            b = b - 1
                            let argFolder = {input:{id:folders[a].id, name:folders[a].name, content:JSON.stringify(content)}}
                            query('UPDATE folders SET ? WHERE id = ?', argFolder)
                        } 
                    }
                }
            }
            me = await query(`SELECT * FROM users WHERE token = "${token}"`)
            last_workouts = JSON.parse(me[0].last_workouts)
            idUser = me[0].id

            if(last_workouts.length){
                const index = last_workouts.findIndex(item => item.id === id)
                if(index >= 0){
                    last_workouts.splice(index,1)
                    await query('UPDATE users SET ? WHERE id = ?', {
                        input:{
                            id:idUser,
                            last_workouts:JSON.stringify(last_workouts)
                        }
                    })
                }
            }
        
            result = await query(`DELETE FROM routines WHERE token = "${token}" AND id = "${id}"`)
        }
        
        return {
            errors:JSON.stringify(errors),
            success:result
        }
    },
    updateRoutine: async (args) => {
        const errors = [],
        {
            id,
            name,
            dones,
            timeRecord,
            exercises,
        } = args.input;
        let result, token, last_workouts, me, routine, folders;


        if(!name && !dones && !timeRecord && !exercises) errors.push('Debes actualizar alguna propiedad');
        

        if(!errors.length) {

            routine = await query(`SELECT * FROM routines WHERE id = "${id}"`)
            token = routine[0].token

            me = await query(`SELECT * FROM users WHERE token = "${token}"`)
            last_workouts = JSON.parse(me[0].last_workouts)

            folders = await query(`SELECT * FROM folders WHERE token = "${token}"`)

            folders.forEach( async folder => {
                const content = JSON.parse(folder.content)
                for(var i = 0; i < content.length; i++){
                    if(content[i].id === id){
                        let newContent = [...content]
                        newContent[i] = {...args.input, exercises: exercises}
                        await query('UPDATE folders SET ? WHERE id = ?', {
                            input:{
                                id:folder.id,
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
                        await query(`UPDATE users SET ? WHERE id = ${me[0].id}`, { input: {
                            last_workouts: JSON.stringify(last_workouts)
                        }})
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
                
                await query(`UPDATE users SET ? WHERE id = ${me[0].id}`, { input: {
                last_workouts: JSON.stringify(last_workouts)
                }})
            }

            result = await query('UPDATE routines SET ? WHERE id = ?', args).then(data => data);

        }
        if(result) return {
            errors:null,
            success:true
        }
        else return {
            errors:JSON.stringify(errors),
            success:false
        }
    }
}