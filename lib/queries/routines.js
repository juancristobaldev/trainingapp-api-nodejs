const query = require('../db')

module.exports = {
    getRoutinesByToken: async (args) => {
        console.log(args)
        const result = await query(`SELECT * FROM routines WHERE token = "${args.token}"`)
        return result
    }
}