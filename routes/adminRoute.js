const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.route('/create-user').post(adminController.createNewUser)

router.route('/create-pool').post(adminController.createNewPool)

router.route('/create-user-pool').post(adminController.createUserPool)

router.route('/make-pick').post(adminController.makePick)

router.route('/get-users').get(adminController.getAllUsers)

router.route('/get-user-pools').get(adminController.getAllUserPools)

router.route('/tee-sheet').get(adminController.getAllPlayers)

module.exports = router
