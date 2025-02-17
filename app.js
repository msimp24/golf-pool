const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const path = require('path')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

const golfRouter = require('./routes/golfPoolRoutes')
const adminRouter = require('./routes/adminRoute')

app.use('/api', golfRouter)
app.use('/admin', adminRouter)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/', 'index.html'))
})
app.get('/leaderboard', (req, res) => {
  const tournament = req.params.tournament
  res.sendFile(path.join(__dirname, 'public/views/', 'index.html'))
})
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/', 'admin.html'))
})

module.exports = app
