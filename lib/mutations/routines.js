/*
  "Crear una rutina"
  createRoutine(input:CreateRoutineInput!): CreateRoutineOutput

  "Eliminar una rutina"
  deleteRoutine(input:DeleteRoutineInput!) : DeleteRoutineOutput

  "Actualizar una rutina"
  updateRoutine(input:UpdateRoutineInput!) : UpdateRoutineOutput

  type Routine {
  id: Int
  token: String!
  name: String!
  dones: Int
  timeRecord: String
  exercises: String
}
*/

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
        let result;

        if(!token || !id) errors.push('El token y el id es obligatorio')
        
        if(errors.length === 0){
            let folders = await query(`SELECT * FROM folders WHERE token = "${token}"`)
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
            name,
            dones,
            timeRecord,
            exercises,
        } = args.input;


        if(!name && !dones && !timeRecord && !exercises) errors.push('Debes actualizar alguna propiedad');

        result = await query('UPDATE routines SET ? WHERE id = ?', args).then(data => data);

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