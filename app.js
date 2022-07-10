//packages

const express = require('express'),
app = express()

const cors = require('cors');
const bodyparser = require('body-parser')
const mysql = require('mysql');
const session = require('express-session')


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

//conexion a la bd

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect( (err) => {
    if(err) throw err
    else console.log('Conectado a a la base de datos')
    }
)

// port

const port = process.env.PORT;

// routes

app.get( '/', (req,res) => {
    res.send('Api funcionando')
})

app.get('/api/users', (req,res) => { // SELECCIONAR TODOS LOS USERS
    connection.query('SELECT * from users', (err,done) => {
        if(err) throw err;
        else res.send(done)
    });
});

app.get('/api/users/:id', (req,res) =>{ // SELECCIONAR USER POR ID
    const query = 'SELECT * FROM users WHERE id = ?'
    connection.query(query,[parseInt(req.params.id)],(err,object)=>{
        if(err) throw err
        else res.send(object)
    })
})

// CREATE A USER

app.post( '/api/users/create-user' , async  (req, res) => {
    const userData = {
        name:req.body.name,
        user:req.body.user,
        email:req.body.email,
        date:req.body.date,
        pass:req.body.pass,
        passConfirm:req.body.passConfirm
    }

    const sqlSelect = 'SELECT * FROM users';
    connection.query( sqlSelect, (err,users) => {
        const {user,name,email,date,pass,passConfirm } = userData

        const errors = []

        users.forEach(item => {
            if(item.user === user) errors.push('Este usuario ya existe. Selecciona otro por favor');
            if(item.email === email) errors.push('Este email ya esta en uso, por favor escribe uno nuevo');
        })

        if(user.length === 0) errors.push('El usuario es obligatorio');
        if(name.length === 0) errors.push('El nombre es obligatorio');
        if(email.length === 0) errors.push('El email es obligatorio');
        if(pass.length === 0) errors.push('Debes escribir una contraseña')
        if(passConfirm !== pass) errors.push('Las contraseñas deben coincidir'); 

        if(errors.length > 0) res.send(JSON.stringify(errors))
        else{
            const sqlInsert = "INSERT INTO users (user,name,email,date,pass) VALUES ?"
            const values = [
                [user,name,email,date,pass]
            ]
             connection.query(sqlInsert, [values], (err,result) => {
                if (err) console.log(err)
                else console.log('Datos agregados') 
            })
        }
    })
})

// LOGIN

app.post( '/api/auth' , (req, res) => {

    const formData = {
        user:req.body.user,
        pass:req.body.pass
    }

    const { user,pass } = formData
    const sqlAuth = `SELECT * FROM users WHERE user = ? AND pass = ?`

    connection.query(sqlAuth, [user,pass], (err,find) => {

        if(err) throw err;
        if(find.length > 0){
            res.send(JSON.stringify([{key:find[0].id}]));
        }else{
            res.send(JSON.stringify([{error:true, message: 'Usuario y/o contraseña incorrecto'}]));
        }
    })

})


app.listen(port,() => {
    console.log('Corriendo puerto en puerto ' + port)
})

