const { GraphQLError } = require('graphql')

const notFoundToken = (message,code) => {
    throw new GraphQLError(message,{
        extensions:{ code:code }
    })
}


module.exports = {notFoundToken}