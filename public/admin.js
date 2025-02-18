const createUserForm = document.getElementById('create-user-form')
const createPoolForm = document.getElementById('create-pool-form')
const createUserPoolForm = document.getElementById('create-userpool-form')
const makePickForm = document.getElementById('make-pick-form')

const host =
  window.location.host === 'localhost'
    ? 'https://localhost:8080'
    : 'http://68.183.194.171'

async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Something went wrong!')
    }
    const result = await response.json()
    console.log(result)
  } catch (err) {
    console.log(err)
    document.getElementById('username-error').textContent = err.message
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Http error! Status: ${response.status}`)
    }
    const data = await response.json()

    return data
  } catch (error) {
    console.error('Fethching error:', error)
  }
}

createUserForm.addEventListener('submit', function (event) {
  event.preventDefault()
  let isValid = true // Assume the form is valid initially

  let userName = document.getElementById('username')
  let teamName = document.getElementById('team-name')

  let userNameErr = document.getElementById('username-error') // Fixed ID
  let teamNameErr = document.getElementById('team-name-err')

  let data = {}

  // Username validation
  if (!userName.value.trim()) {
    userNameErr.textContent = 'Username is a required field'
    isValid = false
  } else {
    userNameErr.textContent = '' // Clear error message
    data.username = userName.value.trim()
  }

  // Team Name validation
  if (!teamName.value.trim()) {
    teamNameErr.textContent = 'Team Name is a required field'
    isValid = false
  } else {
    teamNameErr.textContent = '' // Clear error message
    data.team_name = teamName.value.trim()
  }

  // If form is valid, submit it
  if (isValid) {
    postData(`${host}/admin/create-user`, data)
    window.location.reload()
  }
})

createPoolForm.addEventListener('submit', function (event) {
  event.preventDefault()
  let isValid = true

  let selectedPool = document.getElementById('admin-tournament-select')
  let poolErr = document.getElementById('select-pool-err')

  let data = {}

  if (!selectedPool.value.trim()) {
    poolErr.textContent = 'Select a tournament is a required field'
    isValid = false
  } else {
    poolErr.textContent = ''
    data.tournamentId = selectedPool.value.trim()
  }
  if (isValid) {
    postData(`${host}/admin/create-pool`, data)

    window.location.reload()
  }
})

//get all users

const userSelect = document.querySelectorAll('.user-select')

async function loadUsers() {
  let users = await fetchData(`${host}/admin/get-users`)

  // Create a new formatted array
  let userList = users.map((element) => ({
    username: element.username,
    user_id: element.user_id,
    team_name: element.team_name,
  }))

  userList.forEach((element) => {
    let option = document.createElement('option')
    option.value = element.user_id
    option.text = element.team_name

    userSelect.forEach((select) => {
      select.append(option.cloneNode(true)) // Clone option for each select
    })
  })
}

loadUsers()

createUserPoolForm.addEventListener('submit', function (event) {
  event.preventDefault()
  let isValid = true

  let userSelect = document.querySelector('.user-select')
  let poolErr = document.getElementById('select-user-err')

  let poolEntry = document.getElementById('pool-entry')
  let poolEntryErr = document.getElementById('pool-entry-err')

  let data = {}

  if (!userSelect.value.trim()) {
    poolErr.textContent = 'Select user is a required field'
    isValid = false
  } else {
    poolErr.textContent = ''
    data.userId = userSelect.value.trim()
  }

  if (!poolEntry.value.trim()) {
    poolEntryErr.textContent = 'Pool entry code is a required field'
    isValid = false
  } else {
    poolEntryErr.textContent = ''
    data.poolId = poolEntry.value.trim()
  }

  if (isValid) {
    postData(`${host}/admin/create-user-pool`, data)
    window.location.reload()
  }
})

const userPoolSelect = document.querySelector('.user-pool-select')

async function loadUserPool() {
  let users = await fetchData(`${host}/admin/get-user-pools`)

  console.log(users)

  // Create a new formatted array
  let userPoolList = users.map((element) => ({
    tournament_name: element.tournament_name,
    user_pool_id: element.user_pool_id,
    team_name: element.team_name,
  }))

  userPoolList.forEach((element) => {
    let option = document.createElement('option')
    option.value = element.user_pool_id
    option.text = element.tournament_name + ' (' + element.team_name + ')'

    userPoolSelect.append(option)
  })
}

loadUserPool()

const teeTimesSelect = document.querySelector('.tee-time-select')

async function loadTeeTimes() {
  let players = await fetchData(host + '/admin/tee-sheet')

  // Create a new formatted array
  let teeTimesList = players.map((element) => ({
    player: element.player,
  }))

  teeTimesList.forEach((element) => {
    let option = document.createElement('option')
    option.value = element.player
    option.text = element.player

    teeTimesSelect.append(option)
  })
}

loadTeeTimes()

makePickForm.addEventListener('submit', function (event) {
  event.preventDefault()
  let isValid = true

  let poolEntry = document.getElementById('pick-select-pool')
  let poolEntryErr = document.getElementById('pick-pool-err')

  let selectPlayer = document.getElementById('select-player')
  let selectPlayerError = document.getElementById('select-player-err')

  let data = {}

  if (!poolEntry.value.trim()) {
    poolEntryErr.textContent = 'Select pool is a required field'
    isValid = false
  } else {
    poolEntryErr.textContent = ''
    data.userPoolId = poolEntry.value.trim()
  }

  if (!selectPlayer.value.trim()) {
    selectPlayerError.textContent = 'Select player is a required field'
    isValid = false
  } else {
    selectPlayerError.textContent = ''
    data.player = selectPlayer.value.trim()
  }

  if (isValid) {
    console.log(data.userPoolId)

    postData(`${host}/admin/make-pick`, data)
    window.location.reload()
    makePickForm.reset()
  }
})

const adminTournamentSelect = document.getElementById('admin-tournament-select')

async function loadTournaments() {
  let tournaments = await fetchData(host + '/api/tournament/list')

  // Create a new formatted array
  let tournamentList = tournaments.map((element) => ({
    name: element.name,
    tournament_id: element.tournament_id,
    status: element.status,
  }))

  tournamentList.forEach((element) => {
    let option = document.createElement('option')
    option.value = element.tournament_id
    option.text = element.name

    adminTournamentSelect.append(option)
  })
}

// runs load tournament
loadTournaments()
