const query = require("../db")

module.exports = {
    getFoldersByToken: async args => {
        const result = await query(`SELECT * FROM folders WHERE token = "${args.token}"`)
        return result
    },
    getFolderById: async args => {
        const result = await query(`SELECT * FROM folders WHERE id = "${args.id}"`)
        return result[0]
    }
}