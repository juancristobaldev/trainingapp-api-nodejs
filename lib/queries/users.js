const query = require('../db')

module.exports = {
    getUsers: () => query('SELECT * FROM users'),
    getUsersById:(args) => query('SELECT * FROM users WHERE id = ?',args)
}