const db = require('./../config/db')

const createNewUser = (req, res) => {
  let userName = req.body.username
  let teamName = req.body.team_name

  let checkQuery = 'SELECT * FROM users where username = ?'

  db.get(checkQuery, [userName], (err, row) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Internal server error' })
    }

    if (row) {
      return res.status(400).json({ message: 'Username is already taken' })
    }
    db.run(
      `INSERT INTO users (username, team_name) VALUES (?, ?)`,
      [userName, teamName], // Use parameterized values
      (err) => {
        if (err) {
          res.status(500).json({
            status: 'failed',
            message: err.message, // Send only the error message
          })
        } else {
          res.status(201).json({
            status: 'success',
            message: `${teamName} successfully added to the DB`,
          })
        }
      }
    )
  })
}

const createNewPool = (req, res) => {
  let tournamentId = req.body.tournamentId
  function getRandomSixDigit() {
    return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
  }

  let entryCode = getRandomSixDigit()

  db.run(
    `INSERT INTO pools(tournament_id, entry_code) values (?, ?)`,
    [tournamentId, entryCode],
    (err) => {
      if (err) {
        res.status(500).json({
          status: 'failed',
          message: err.message,
        })
      } else {
        res.status(200).json({
          status: 'success',
          message: 'New pool successfully created',
        })
      }
    }
  )
}

const createUserPool = (req, res) => {
  let poolId = req.body.poolId
  let userId = req.body.userId

  db.run(
    `INSERT INTO user_pool(pool_id, user_id) values (?, ?)`,
    [poolId, userId],
    (err) => {
      if (err) {
        res.status(500).json({
          status: 'failed',
          message: err.message,
        })
      } else {
        res.status(200).json({
          status: 'success',
          message: 'New user pool successfully created',
        })
      }
    }
  )
}
const makePick = (req, res) => {
  const { userPoolId, player } = req.body

  db.serialize(() => {
    db.run('BEGIN TRANSACTION')

    db.run(`INSERT INTO picks (user_pool_id, player_name) VALUES (?, ?)`, [
      userPoolId,
      player,
    ]).run(`DELETE FROM tee_times WHERE player = ?`, [player], (err) => {
      if (err) {
        return db.run('ROLLBACK', () =>
          res.status(500).json({ status: 'failed', message: err.message })
        )
      }
      db.run('COMMIT', () =>
        res
          .status(200)
          .json({ status: 'success', message: 'Pick made & player removed' })
      )
    })
  })
}

const getAllUsers = (req, res) => {
  db.all('SELECT * from users', (err, rows) => {
    if (err) {
      res.status(500).json(err)
    } else {
      res.status(200).send(rows)
    }
  })
}

const getAllUserPools = (req, res) => {
  db.all(
    'SELECT tournaments.name AS tournament_name, user_pool.id as user_pool_id, users.team_name FROM user_pool INNER JOIN pools ON user_pool.pool_id = pools.id INNER JOIN tournaments ON pools.tournament_id = tournaments.tournament_id inner join users on users.user_id = user_pool.user_id',
    (err, rows) => {
      if (err) {
        res.status(500).json(err)
      } else {
        res.status(200).send(rows)
      }
    }
  )
}

const getAllPlayers = (req, res) => {
  db.all('SELECT player from tee_times', (err, rows) => {
    if (err) {
      res.status(500).json(err)
    } else {
      res.status(200).send(rows)
    }
  })
}

module.exports = {
  createNewUser,
  createNewPool,
  createUserPool,
  makePick,
  getAllUsers,
  getAllUserPools,
  getAllPlayers,
}
