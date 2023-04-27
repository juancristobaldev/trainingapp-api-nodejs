const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const { notFoundToken } = require("../methods/notFoundToken");
const { getUserId } = require("../methods/getUserId");

module.exports = {
  createExercise: async (args, context) => {
    const { name, type, muscle } = args.input,
      errors = [];
    let result, variables;

    if (!context.headers.authorization)
      notFoundToken("Not Found Authorization Token", "UNAUTH");
    if (!name || !type || !muscle)
      errors.push("Todos los campos son obligatorios");

    if (errors.length === 0) {
      variables = {
        ...args.input,
        user: {
          connect: {
            token: context.headers.authorization,
          },
        },
      };

      result = await prisma.exercises.create({
        data: variables,
      });
    }

    return {
      errors: JSON.stringify(errors),
      success: result ? true : false,
      exercise: result,
    };
  },

  deleteExercise: async (args, context) => {
    const { ids } = args.input,
      errors = [];
    let result;

    const arrayIds = JSON.parse(ids);

    if (!context.headers.authorization) {
      notFoundToken("Not Found Authorization Token", "UNAUTH");
    } else {
      if (!ids) errors.push("IDs de ejercicios obligatorio");

      if (arrayIds.length >= 1) {
        if (arrayIds.length > 1) {
          result = await prisma.exercises.deleteMany({
            where: {
              id: {
                in: arrayIds,
              },
            },
          });
        } else {
          result = await prisma.exercises.delete({
            where: {
              id: arrayIds[0],
            },
          });
        }
      } else errors.push("IDs de ejercicios obligatorio");
    }

    return {
      errors: errors ? JSON.stringify(errors) : false,
      success: result ? true : false,
      exercises: ids,
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
