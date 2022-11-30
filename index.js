//packages
/*
const {buildSchema} = require('graphql')
const {graphqlHTTP} = require('express-graphql')

const {readFileSync} = require('fs')
const {join} = require('path')

const express = require('express'),
app = express();

const cors = require('cors');

//env

require('dotenv').config({path:'./.env'})



app.use(cors());

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
    console.log(req.headers.host)
    res.send('Welcome to my Api in Vercel')
})

// server
app.listen( port, () => {
    console.log(`Server running at: ${port}`)
})
*/
const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
  },
};

const startApolloServer = async(app, httpServer) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
  
    await server.start();
    server.applyMiddleware({ app });
}

startApolloServer(app, httpServer);

export default httpServer;