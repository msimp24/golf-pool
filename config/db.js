const sqlite3 = require('sqlite3')

let db = new sqlite3.Database('pga-data.db', (err) => {
  if (err) {
    console.log('Error occured' + err.message)
  } else {
    console.log('Database connected')
  }
})

module.exports = db
