//packages

const express = require('express'),
app = express()

const cors = require('cors');
const bodyparser = require('body-parser')
const mysql = require('mysql');
const session = require('express-session');
const { stringify } = require('nodemon/lib/utils');
const { reset } = require('nodemon');


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

//SELECCIONAR TABLA DE DATOS

app.get('/api/select/:table/', async (req,res) => { // SELECCIONAR TABLA
    connection.query(`SELECT * FROM ${req.params.table}`, (err,result) => {
        if (err) throw err
        else res.send(result)
    })
});

//SELECCIONAR ELEMENTO ATRAVEZ DE USUARIO EN UNA TABLA DE DATOS

app.get('/api/select/:table/user/:userid' , (req,res) => { 
    connection.query(`SELECT * FROM ${req.params.table} WHERE usuario = ${req.params.userid}`,
    (err,result) => {
        if(err) throw err
        else res.send(result)
    })

})

//SELECCIONAR ELEMENTO ATRAVEZ DE ID DE ELEMENTO EN UNA TABLA DE DATOS

app.get('/api/select/:table/element/:id', (req,res) =>{ // SELECCIONAR USER POR ID
    connection.query(`SELECT * FROM ${req.params.table} WHERE id = ${req.params.id}`,(err,result)=>{
        if(err) throw err
        else res.send(result)
    })
})

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
        const {user,name,email,date,pass } = userData

        const errors = []

        users.forEach(item => {
            if(item.user === user) errors.push('Este usuario ya existe. Selecciona otro por favor');
            if(item.email === email) errors.push('Este email ya esta en uso, por favor escribe uno nuevo');
        })

        if(errors.length > 0) res.send(JSON.stringify({error:true, errors:errors}))
        else{
            const sqlInsert = "INSERT INTO users (user,name,email,date,pass) VALUES ?"
            const values = [
                [user,name,email,date,pass]
            ]
             connection.query(sqlInsert, [values], (err,result) => {
                if (err) console.log(err)
                else res.send({error:false})
            })
        }
    })
})

// AUTH

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
            req.session.userID = find[0].id
            res.send(JSON.stringify([{key:find[0].id}]));
        }else{
            res.send(JSON.stringify([{error:true, message: 'Usuario y/o contraseña incorrecto'}]));
        }
    })

})

// EXERCISES

// CREATE EXERCISE

app.post( '/api/exercises/create-exercise' , (req,res) => {
    const dataForm = {
        idUser:req.body.id,
        name:req.body.name,
        muscle:req.body.muscle,
        type:req.body.type,
        series:[]
    }

    const {idUser,name,muscle,type,series} = dataForm;

    const sqlInsert = 'INSERT INTO exercises (usuario,nameEx,typeEx,muscleEx,seriesEx) VALUES ?'
    const values = [
        [idUser,name,type,muscle,JSON.stringify(series)]
    ]

    if(name.length > 0){
        connection.query(sqlInsert,[values],(err,sucess) => {
            if(err) throw err
            else res.send(true)
        })
    }else{
        res.send(false)
    }
})

// DELETE EXERCISE 

app.post( '/api/exercises/delete-exercise/:id' , async (req,res) => {
    const dataForm = {
        idUser:parseInt(req.params.id),
        items:req.body
    }

    const {idUser,items} = dataForm;

    await items.forEach(item => {
        const sqlDelete = `DELETE FROM exercises WHERE nameEx = '${item.nameEx}' AND usuario = '${idUser}'`;
        connection.query(sqlDelete, (err,done) => {
            if(err) throw err;
        })
    })

    res.send(true)
})

//ROUTINES 

app.post( '/api/routines/create-routine/' , async (req,res) => {
    const dataForm = {
        routine:req.body
    }

    const {done,timeRecord,exercises,nameRoutine,idUser } = dataForm.routine
    const values = [
        [idUser,nameRoutine,done,timeRecord,JSON.stringify(exercises)]
    ]
    
    console.log(exercises)

    connection.query('INSERT INTO routines (usuario,name,dones,timeRecord,exercises) VALUES ?',[values], (err,done) => {
        if(err) throw err
        if(done) console.log('good')
    })

})


app.listen(port,() => {
    console.log('Corriendo puerto en puerto ' + port)
})

