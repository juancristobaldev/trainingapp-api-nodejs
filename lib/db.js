require('dotenv').config({path:'./.env'})
const mysql = require('mysql');
const { JSON } = require('mysql/lib/protocol/constants/types');

const dbUrl = process.env.DATABASE_URL;
let connection

const connectDB = async () => {
    if( connection ) return connection
    try {
        connection = await mysql.createConnection(dbUrl)
        connection.connect( err => {
            if(err) throw err
            else console.log('Connect to DB succesful')
        })
    }catch (err) {
        console.log('Cant connect to db', process.env.DATABASE_URL, err)
        process.exit(1)
    }
 
    return connection
}

const query = async (sql, args, req) => new Promise( async (resolve, reject) => {
    const db = await connectDB()
    let values = [];
    if(args){
        const action = sql.split(' ')
        if(args.input){
            if(action[0] === 'INSERT') values = [[Object.values(args.input)]]
            else if(action[0] === 'DELETE') values = [Object.values(args.input)]
            else if(action[0] === 'UPDATE'){
                const id = args.input.id,
                data = args.input
                delete data.id
                values = [new Object(data),id]
            }
        }
    }
    
    await db.query(sql, values, (err, rows) => {
        if (err) {
            reject(err)
            console.log(err)
        } else {
            rows.changedRows || rows.affectedRows || rows.insertId ? resolve(true) : resolve(rows);
        }
    });
    
});

module.exports = query