const folders = require('./folders')
const exercises = require('./exercises')
const routines = require('./routines')
const users = require('./users')


module.exports = {
    ...users,
    ...routines,
    ...exercises,
    ...folders
}