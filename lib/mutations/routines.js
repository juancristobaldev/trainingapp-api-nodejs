const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { notFoundToken } = require("../methods/notFoundToken");

module.exports = {
  createRoutine: async (args, context) => {
    let error,
      result,
      superSets = [],
      objectCreate;

    if (context.headers.authorization) {
      const { flow, name, dones, timeRecord } = args.input;

      const parsedFlow = JSON.parse(flow);

      const idsExercises = parsedFlow
        .filter((exercise) => exercise.type !== "superSet")
        .map((exercise) => {
          /* delete exercise.__typename;
          delete exercise.added;
          delete exercise.select;
          return {
            ...exercise,
            series: JSON.stringify(exercise.series),
            rest: exercise.rest ? exercise.rest : JSON.stringify({}),
          }; */
          return {
            id: exercise.id,
          };
        });

      parsedFlow.forEach((item) => {
        if (item.type === "superSet") {
          delete item.type;
          const exercises = item.cycle.map((exercise) => {
            return {
              id: exercise.id,
            };
          });

          delete item.cycle;

          const cycle = {
            ...item,
            exercises: {
              connect: [...exercises],
            },
          };

          superSets.push(cycle);
        }
      });

      objectCreate = {
        name: name,
        dones: dones,
        timeRecord: timeRecord,
        flow: flow,
        user: {
          connect: {
            token: context.headers.authorization,
          },
        },
        exercises: {
          connect: [...idsExercises],
        },
      };

      if (superSets.length) {
        objectCreate.cycles = {
          create: [...superSets],
        };
      }

      result = await prisma.routines
        .create({
          data: {
            ...objectCreate,
          },
        })
        .catch((error) => {
          if (error) {
            console.log(error);
          }
        });

      console.log(idsExercises, superSets);
    }

    return {
      routine: result,
      errors: error ? error : false,
      success: result ? true : false,
    };
  },
  deleteRoutine: async (args, context) => {
    const { id } = args.input,
      errors = [];
    let result, user;

    if (context.headers.authorization) {
      if (!id) errors.push("Id de rutina obligatorio");

      if (errors.length === 0) {
        result = await prisma.routines.delete({
          where: {
            id: id,
          },
        });

        user = await prisma.users.findUnique({
          where: {
            token: context.headers.authorization,
          },
          include: {
            routines: true,
          },
        });
      }
    } else notFoundToken("Not Found Autorization Token", "UNAUTH");

    return {
      errors: JSON.stringify(errors),
      success: result ? true : false,
      user: user,
    };
  },
  updateRoutine: async (args, context) => {
    const errors = [];

    const { id, name, dones, timeRecord, exercises } = args.input;

    let result, last_workouts, me, routine, folders, userId;

    if (context.headers.authorization) {
      if (!name && !dones && !timeRecord && !exercises)
        errors.push("Debes actualizar alguna propiedad");

      if (!errors.length) {
        routine = await prisma.routines.findUnique({ where: { id: id } });
        userId = routine.userId;

        me = await prisma.users.findUnique({ where: { id: userId } });
        last_workouts = JSON.parse(me.last_workouts);

        folders = await prisma.folders.findMany({ where: { userId: userId } });

        folders.forEach(async (folder) => {
          const content = JSON.parse(folder.content);
          for (var i = 0; i < content.length; i++) {
            if (content[i].id === id) {
              let newContent = [...content];
              newContent[i] = { ...args.input, exercises: exercises };
              await prisma.folders.update({
                where: { id: folder.id },
                data: {
                  name: folder.name,
                  content: JSON.stringify(newContent),
                },
              });
            }
          }
        });

        if (routine.dones === dones) {
          for (var i = 0; i < last_workouts.length; i++) {
            if (last_workouts[i].id === id) {
              last_workouts[i] = { ...args.input };
              await prisma.users.update({
                where: { id: userId },
                data: {
                  last_workouts: JSON.stringify(last_workouts),
                },
              });
            }
          }
        } else {
          if (last_workouts.length) {
            let index = last_workouts.findIndex((item) => item.id === id),
              someRoutine;
            if (index >= 0) {
              someRoutine = last_workouts[index];
              last_workouts.splice(index, 1);
            } else if (last_workouts.length >= 3) last_workouts.pop();
          }
          last_workouts.unshift({ ...args.input });

          await prisma.users.update({
            where: { id: userId },
            data: {
              last_workouts: JSON.stringify(last_workouts),
            },
          });
        }

        result = await prisma.routines.update({
          where: { id: id },
          data: {
            ...args.input,
          },
        });
      }
    } else notFoundToken("Not Found Autorization Token", "UNAUTH");

    return {
      errors: JSON.stringify(errors),
      success: result ? true : false,
    };
  },
};
