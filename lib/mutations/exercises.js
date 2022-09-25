

const query = require('../db')

module.exports = {
  createExercise: async (args) => {
    console.log(args)
    const { name, typeEx, muscleEx } = args.input,
    errors = [];
    let result;  

    console.log(args.input)

    if(!name && !typeEx && !muscleEx) errors.push('Todos los campos son obligatorios')

    if(errors.length === 0) result = await query('INSERT INTO exercises (token, name, typeEx, muscleEx, seriesEx) VALUES ?', args)

    return {
      errors:JSON.stringify(errors),
      success:result
    }
  },
  deleteExercise: async (args) => {
      const {token, name} = args.input,
      errors = [];
      let result;

      if(!token && name) errors.push('Token/nombre de usuario obligatorio.')

      result = await query(`DELETE FROM exercises WHERE token = "${token}" AND name = "${name}"`)
      if(result) return {
          errors:JSON.stringify(errors),
          success:result
      }
  },
  updateExercise: async (args) => {
      const errors = [],
      {
          token,
          name,
          seriesEx
      } = args.input;

      if(!name && !seriesEx ) errors.push('Debes actualizar alguna propiedad');
      if(!token) errors.push('Debes ingresar un token de usuario');

      if(errors.length === 0) result = await query('UPDATE exercises SET ? WHERE id = ?', args).then(data => data);

      return {
        errors:JSON.stringify(errors),
        success:result
      }
  }
}