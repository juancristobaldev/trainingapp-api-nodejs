/*   "Crear un ejercicio"
  createExercise(input:CreateExerciseInput!): CreateExerciseOutput

  "Eliminar una ejercicio"
  deleteExercise(input:DeleteExerciseInput!) : DeleteExerciseOutput

  "Actualizar una ejercicio"
  updateExercise(input:UpdateExerciseInput!) : UpdateExerciseOutput
  
  
  input CreateExerciseInput {
  token: String!
  nameEx: String!
  typeEx: String!
  muscleEx: String!
}

input DeleteExerciseInput {
  token: String!
  nameEx: String!
}

input UpdateExerciseInput {
  token: String!
  nameEx: String
  seriesEx: String
}

  
  */

const query = require('../db')

module.exports = {
  createExercise: async (args) => {
    console.log(args)
    const { nameEx, typeEx, muscleEx } = args.input,
    errors = [];
    let result;  

    console.log(args.input)

    if(!nameEx && !typeEx && !muscleEx) errors.push('Todos los campos son obligatorios')

    if(errors.length === 0) result = await query('INSERT INTO exercises (token, nameEx, typeEx, muscleEx, seriesEx) VALUES ?', args)

    return {
      errors:JSON.stringify(errors),
      success:result
    }
  },
  deleteExercise: async (args) => {
      const {token, nameEx} = args.input,
      errors = [];
      let result;

      if(!token && nameEx) errors.push('Token/nombre de usuario obligatorio.')

      result = await query(`DELETE FROM exercises WHERE token = "${token}" AND nameEx = "${nameEx}"`)
      if(result) return {
          errors:JSON.stringify(errors),
          success:result
      }
  },
  updateExercise: async (args) => {
      const errors = [],
      {
          token,
          nameEx,
          seriesEx
      } = args.input;

      if(!nameEx && !seriesEx ) errors.push('Debes actualizar alguna propiedad');
      if(!token) errors.push('Debes ingresar un token de usuario');

      if(errors.length === 0) result = await query('UPDATE exercises SET ? WHERE id = ?', args).then(data => data);

      return {
        errors:JSON.stringify(errors),
        success:result
      }
  }
}