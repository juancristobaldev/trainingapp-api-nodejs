const query = require('../db')

module.exports = {
    getRoutinesByToken: async (args) => {

        const result = await query(`SELECT * FROM routines WHERE token = "${args.token}"`)
        return result
    },
    getRoutineById: async (args) => {
        const result = await query(`SELECT * FROM routines WHERE id = "${args.id}"`)
        return result
    }
}