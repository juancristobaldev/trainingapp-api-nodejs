
const routines = require('./routines')
const users = require('./users')
const exercises = require('./exercises')

module.exports = {
    ...users,
    ...routines,
    ...exercises
}
