const db = require('./../config/db')

const getLiveLeaderboardData = (req, res) => {
  let tournamentId = req.params.id
  let page = parseInt(req.query.page) || 1
  let limit = parseInt(req.query.limit) || 10
  let status = req.params.status

  page = Math.max(page, 1)

  let offset = (page - 1) * limit

  if (status === 'complete') {
    db.all(
      `SELECT * FROM final_leaderboard where tournament_id = ${tournamentId} limit ${limit} offset ${offset}`,
      (err, rows) => {
        if (err) {
          console.error(err.message)
          res.status(500).send('Internal server error')
        } else {
          res.send(rows)
        }
      }
    )
  } else if (status === 'live') {
    db.all(
      `SELECT * FROM live_leaderboard where tournament_id = ${tournamentId} limit ${limit} offset ${offset}`,
      (err, rows) => {
        if (err) {
          console.error(err.message)
          res.status(500).send('Internal server error')
        } else {
          res.send(rows)
        }
      }
    )
  } else {
    res.send('Tournament has not yet started')
  }
}

const getTournaments = (req, res) => {
  db.all(`select * from tournaments`, (err, rows) => {
    if (err) {
      console.log(err)
      res.status(500).send('Internal server error')
    } else {
      res.status(200).send(rows)
    }
  })
}

const getTournamentById = (req, res) => {
  const tournament_id = req.params.id

  db.all(
    `select * from tournaments where tournament_id = ${tournament_id}`,
    (err, rows) => {
      if (err) {
        console.log(err)
        res.status(500).send('Internal server error')
      } else {
        res.status(200).send(rows)
      }
    }
  )
}

const getRowCount = (req, res) => {
  const tournament_id = req.params.id
  const status = req.params.status

  if (status === 'complete') {
    db.all(
      `select count(*) as rowCount from final_leaderboard where tournament_id = ${tournament_id}`,
      (err, rowCount) => {
        if (err) {
          res.status(500).send('Internal Server Error')
        } else {
          res.status(200).json(rowCount[0])
        }
      }
    )
  } else if (status === 'live') {
    db.all(
      `select count(*) as rowCount from live_leaderboard where tournament_id = ${tournament_id}`,
      (err, rowCount) => {
        if (err) {
          res.status(500).send('Internal Server Error')
        } else {
          res.status(200).json(rowCount[0])
        }
      }
    )
  } else {
    res.json({
      count: 0,
    })
  }
}

const getLiveScorePicks = (req, res) => {
  let tournament_id = req.params.tournamentId

  db.all(
    `SELECT 
    up.user_id, 
    u.team_name,
    p.player_name, 
    COALESCE(fl.Score, ll.Score) AS Score,
    COALESCE(fl.Total, ll.Total) AS Total,
    ll.Thru,
    po.tournament_id, 
    po.id AS pool_id
FROM picks AS p
JOIN user_pool AS up ON p.user_pool_id = up.id
JOIN pools AS po ON up.pool_id = po.id
LEFT JOIN live_leaderboard AS ll ON p.player_name = ll.Player AND ll.tournament_id = po.tournament_id
LEFT JOIN final_leaderboard AS fl ON p.player_name = fl.Player AND fl.tournament_id = po.tournament_id
JOIN users AS u ON up.user_id = u.user_id 
WHERE po.tournament_id = (?);`,
    [tournament_id],
    (err, rows) => {
      if (err) {
        console.log(err)
        res.status(500).send('Internal server error')
      } else {
        res.status(200).send(rows)
      }
    }
  )
}

module.exports = {
  getLiveLeaderboardData,
  getTournaments,
  getTournamentById,
  getRowCount,
  getLiveScorePicks,
}
