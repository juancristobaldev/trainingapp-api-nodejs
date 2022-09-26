
const routines = require('./routines')
const users = require('./users')
const exercises = require('./exercises')
const folders = require('./folders')

module.exports = {
    ...users,
    ...routines,
    ...exercises,
    ...folders
}
