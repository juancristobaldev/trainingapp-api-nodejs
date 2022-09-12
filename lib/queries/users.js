const query = require('../db')

module.exports = {
    getUsers: () => query('SELECT * FROM users'),
    getUser: async (args) => {
        const result = await query(`SELECT * FROM users WHERE token = "${args.token}"`)
        return result[0]
    }
}