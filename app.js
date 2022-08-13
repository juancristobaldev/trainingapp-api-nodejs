//packages


const {buildSchema} = require('graphql')
const {graphqlHTTP} = require('express-graphql')

const {readFileSync} = require('fs')
const {join} = require('path')

const express = require('express'),
app = express()

const cors = require('cors'),
bodyparser = require('body-parser'),
jwt = require('jsonwebtoken'),
config = require('./configs/configs')
mysql = require('mysql'),
session = require('express-session');

app.set('key', config.key)

//env

require('dotenv').config({path:'./.env'})

//middlewares

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(cors());

app.use(session({
    secret: 'mysecretkey' ,
    resave:true,
    saveUninitialized:true,

}));

const resolvers = require('./lib/resolvers')

const schema = buildSchema(
    readFileSync(
        join(__dirname, 'lib', 'schema.graphql'),
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
    res.send('Api funcionando')
})

app.listen(port,() => {
    console.log('Corriendo puerto en puerto ' + port)
})

