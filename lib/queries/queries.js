const { PrismaClient } = require("@prisma/client");
const { Console } = require("console");
const prisma = new PrismaClient();

const { notFoundToken } = require("../methods/notFoundToken");

module.exports = {
  getUsers: async () => {
    const result = await prisma.users.findMany({
      include: {
        exercises:true,
        routines:true,
        profile: true,
      },
    });

    console.log(result);

    return result;
  },

  getUserByEmail: async (args) =>
    await prisma.users.findUnique({
      where: {
        email: args.email,
      },
    }),

  getUser: async (args, context) => {
    if (context.headers.authorization)
      return await prisma.users.findUnique({
        where: {
          token: context.headers.authorization,
        },
        include: {
          profile: true,
          exercises: true,
          routines: true,
          folders: true,
        },
      });
    else notFoundToken("Not Found Authorization Token", "UNAUTH");
  },
  getRoutines: async (args, context) => {
    if (context.headers.authorization) {
      const result = await prisma.routines.findMany({
        where: {
          user: {
            token: context.headers.authorization,
          },
        },
        include: {
          exercises: {
            where: {
              user: {
                token: context.headers.authorization,
              },
            },
          },
          cycles: {
            where: {
              routines: {
                user: {
                  token: context.headers.authorization,
                },
              },
            },
          },
        },
      });

      return result;
    } else notFoundToken("Not Found Authorization Token", "UNAUTH");
  },
  getRoutineById: async (args) =>
    await prisma.routines.findUnique({
      where: {
        id: args.id,
      },
      include:{
        exercises:true,
        cycles:{
          include:{
            exercises:true
          }
        }
      }
    }),

  getExercises: async (args, context) => {
    if (context.headers.authorization) {
      return await prisma.exercises.findMany({
        where: {
          user: {
            token: {
              contains: context.headers.authorization,
            },
          },
        },
      });
    } else notFoundToken("Not Found Authorization Token", "UNAUTH");
  },

  getFolders: async (args, context) => {
    if (context.headers.authorization) {
      return await prisma.folders.findMany({
        where: {
          user: {
            token: {
              contains: context.headers.authorization,
            },
          },
        },
      });
    } else notFoundToken("Not Found Authorization Token", "UNAUTH");
  },
  getFolderById: async (args) =>
    await prisma.folders.findUnique({
      where: {
        id: args.id,
      },
    }),
};
