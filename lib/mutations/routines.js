const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { notFoundToken } = require("../methods/notFoundToken");
const { getUserId } = require("../methods/getUserId");

module.exports = {
  createRoutine: async (args, context) => {
    if (context.headers.authorization) {
      const { flow, name, dones, timeRecord } = args.input;

      const parsedFlow = JSON.parse(flow);

      const idsExercises = parsedFlow
        .filter((exercise) => exercise.type !== "superSet")
        .map((exercise) => {
          return {
            id: exercise.id,
          };
        });

      await prisma.routines
        .create({
          data: {
            name: name,
            dones: dones,
            timeRecord: timeRecord,
            user: {
              connect: {
                token: context.headers.authorization,
              },
            },
            exercises: {
              connect: [...idsExercises],
            },
          },
        })
        .then(async (data) => {
          const superSets = [];

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
                routinesId: data.id,
                exercises: exercises
              };

              superSets.push(cycle);
            }
          });

          if (superSets.length > 0) {
            superSets.forEach( async (cycle) => {
                await prisma.cycles.create({
                    data:{
                        cycles:cycle.cycles,
                        routines:{
                            connect:{
                                id:cycle.routinesId
                            }
                        },
                        exercises:{
                            connect:[...cycle.exercises]
                        }
                    }
                })
            })
          }
        });
    }
  },
  deleteRoutine: async (args, context) => {
    const { id } = args.input,
      errors = [];
    let result, me, last_workouts;

    if (context.headers.authorization) {
      if (!id) errors.push("Id de rutina obligatorio");

      if (errors.length === 0) {
        const userId = await getUserId(context.headers.authorization);

        let folders = await prisma.folders.findMany({
          where: { userId: userId },
        });

        if (folders.length) {
          for (var a = 0; a < folders.length; a++) {
            let content = JSON.parse(folders[a].content);
            for (var b = 0; b < content.length; b++) {
              const int = parseInt(content[b].id);

              if (int == id) {
                content.splice(b, 1);
                b = b - 1;

                await prisma.folders.update({
                  where: {
                    id: parseInt(folders[a].id),
                  },
                  data: {
                    name: folders[a].name,
                    content: JSON.stringify(content),
                  },
                });
              }
            }
          }
        }

        me = await prisma.users.findMany({
          where: { id: userId },
        });

        console.log(me);

        last_workouts = JSON.parse(me[0].last_workouts);

        if (last_workouts.length) {
          const index = last_workouts.findIndex((item) => item.id === id);
          if (index >= 0) {
            last_workouts.splice(index, 1);
            await prisma.users.update({
              where: { id: userId },
              data: {
                last_workouts: JSON.stringify(last_workouts),
              },
            });
          }
        }

        result = await prisma.routines.delete({
          where: {
            id: id,
          },
        });
      }
    } else notFoundToken("Not Found Autorization Token", "UNAUTH");

    return {
      errors: JSON.stringify(errors),
      success: result ? true : false,
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
