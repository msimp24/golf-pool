const sqlite3 = require('sqlite3')

let db = new sqlite3.Database(process.env.DB_URL, (err) => {
  if (err) {
    console.log('Error occured' + err.message)
  } else {
    console.log('Database connected')
  }
})

module.exports = db
