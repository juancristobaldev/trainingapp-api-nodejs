//packages

import express from 'express'
import { buildSchema } from 'graphql'
import { graphqlHTTP } from 'express-graphql'
import { readFileSync } from 'fs'
import { join } from 'path'



const app = express();
const cors = require('cors');

//env

require('dotenv').config({path:'./.env'})



app.use(cors());

const resolvers = require('./resolvers');

const schema = buildSchema(
    readFileSync(
        join(__dirname, 'schema.graphql'),
        'utf-8'
    )
)


app.use('/graphql', graphqlHTTP({
    schema,
    rootValue:resolvers,
    graphiql:true,
}))

// port

const port = process.env.PORT;

// routes

app.get( '/', (req,res) => {
    console.log(req.headers.host)
    res.send('Welcome to my Api in Vercel 🚀 ')
})

// server
app.listen( port, () => {
    console.log(`🚀 Server running at: ${port}`)
})

