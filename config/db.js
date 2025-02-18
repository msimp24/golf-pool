const sqlite3 = require('sqlite3')

const fs = require('fs')
const path = require('path')

let environment
let DB_PATH

const prodPath = '/var/www/golf-pool'

if (fs.existsSync(prodPath)) {
  environment = 'prod'
  DB_PATH = path.join(prodPath, 'pga-data-scraper', 'pga-data.db')
} else {
  environment = 'dev'
  DB_PATH = process.env.DB_URL
}

let db = new sqlite3.Database(process.env.DB_URL, (err) => {
  if (err) {
    console.log('Error occured' + err.message)
  } else {
    console.log('Database connected')
  }
})

module.exports = db
