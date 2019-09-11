const { pgConfig } = require('../config')
const { Pool } = require('pg')


const pool = new Pool({
  user: pgConfig.userName,
  host: pgConfig.host,
  database: pgConfig.dbName,
  password: pgConfig.password,
  //max: 10, // max number of connection can be open to database
  //idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  //port: 5432
})

module.exports = {
    query: (text, params) => pool.query(text, params)
  }