const express = require('express')
const router = express.Router()
const golfPoolController = require('../controllers/golfPoolController')

router
  .route('/tournament/:id/:status')
  .get(golfPoolController.getLiveLeaderboardData)

router.route('/tournament/list').get(golfPoolController.getTournaments)

router.route('/tournament-info/:id').get(golfPoolController.getTournamentById)

router
  .route('/tournament-count/:id/:status')
  .get(golfPoolController.getRowCount)

router
  .route('/get-live-score-picks/:tournamentId')
  .get(golfPoolController.getLiveScorePicks)
module.exports = router
