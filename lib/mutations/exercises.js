const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()



module.exports = {
  createExercise: async (args) => {

    const { name, typeEx, muscleEx } = args.input,
    errors = [];
    let result;  


    if(!name && !typeEx && !muscleEx) errors.push('Todos los campos son obligatorios')

    if(errors.length === 0) result = await prisma.exercises.create({
      data:{
        ...args.input
      }
    })


    return {
      errors:JSON.stringify(errors),
      success:result ? true : false
    }
  },
  deleteExercise: async (args) => {
      const {id} = args.input,
      errors = [];
      let result;

      if(!id) errors.push('ID de ejercicio obligatorio')

      if(!errors.length) result = await prisma.exercises.delete({
        where:{
          id: id
        }
      })

      return {
          errors:JSON.stringify(errors),
          success:result ? true : false
      }
  },
  updateExercise: async (args) => {
      const errors = []


      const {
        id,
        name,
        seriesEx
      } = args.input;

      if(!name && !seriesEx ) errors.push('Debes actualizar alguna propiedad');
      if(!id) errors.push('ID de ejercicio obligatorio');

      if(errors.length === 0) result = await prisma.exercises.update({
        where:{
          id:id
        },
        data:{
          ...args.input
        }
      })

      return {
        errors:JSON.stringify(errors),
        success:result ? true : false
      }
  }
}