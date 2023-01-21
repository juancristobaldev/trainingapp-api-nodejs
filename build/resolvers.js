"use strict";
const mutations = require('./mutations/mutations');
const queries = require('./queries/queries');
module.exports = Object.assign(Object.assign({}, queries), mutations);
