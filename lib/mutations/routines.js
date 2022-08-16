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
        const {token, name} = args.input;
        let result;

        result = await query(`DELETE FROM routines WHERE token = "${token}" AND name = "${name}"`)
        if(result) return {
            errors:JSON.stringify(errors),
            success:result
        }
    },
    updateRoutine: async (args) => {
        const errors = [],
        {
            token,
            name,
            dones,
            timeRecord,
            exercises,
        } = args.input;

        if(!name && !dones && !timeRecord && !exercises) errors.push('Debes actualizar alguna propiedad');
        if(!token) errors.push('Debes ingresar un token de usuario');

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