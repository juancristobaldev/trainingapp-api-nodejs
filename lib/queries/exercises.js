const query = require('../db')

module.exports = {
    getExercisesByToken: async (args) => await query(`SELECT * FROM exercises WHERE token = "${args.token}"`)
}