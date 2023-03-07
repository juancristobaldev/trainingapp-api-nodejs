const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { notFoundToken } = require("../methods/notFoundToken");
const { getUserId } = require("../methods/getUserId");

module.exports = {
  createExercise: async (args, context) => {
    const { name, type, muscle } = args.input,
      errors = [];
    let result;

    if (!context.headers.authorization)
      notFoundToken("Not Found Authorization Token", "UNAUTH");
    if (!name && !typeEx && !muscleEx)
      errors.push("Todos los campos son obligatorios");

    if (errors.length === 0) {
      result = await prisma.exercises.create({
        data: {
          ...args.input,
          series: JSON.stringify([]),
          user: {
            connect: {
              token: context.headers.authorization,
            },
          },
        },
      });
    }

    return {
      errors: JSON.stringify(errors),
      success: result ? true : false,
    };
  },

  deleteExercise: async (args, context) => {
    const { id } = args.input,
      errors = [];
    let result;

    if (!context.headers.authorization)
      notFoundToken("Not Found Authorization Token", "UNAUTH");
    if (!id) errors.push("ID de ejercicio obligatorio");

    if (!errors.length)
      result = await prisma.exercises.delete({
        where: {
          id: id,
        },
      });

    return {
      errors: JSON.stringify(errors),
      success: result ? true : false,
    };
  },
  updateExercise: async (args, context) => {
    const errors = [];
    let result;

    const { id, name, seriesEx } = args.input;

    if (!context.headers.authorization)
      notFoundToken("Not Found Authorization Token", "UNAUTH");
    if (!name && !seriesEx) errors.push("Debes actualizar alguna propiedad");
    if (!id) errors.push("ID de ejercicio obligatorio");

    if (errors.length === 0)
      result = await prisma.exercises.update({
        where: {
          id: id,
        },
        data: {
          ...args.input,
        },
      });

    return {
      errors: JSON.stringify(errors),
      success: result ? true : false,
    };
  },
};
