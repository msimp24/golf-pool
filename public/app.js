const http =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080/'
    : 'http://68.183.194.171/'

const tournamentSelect = document.getElementById('tournament-select')
const leaderboardTable = document.getElementById('leaderboard')

//funciton to get data from the database
async function fetchData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Http error! Status: ${response.status}`)
    }
    const data = await response.json()
    console.log(data)

    return data
  } catch (error) {
    console.error('Fethching error:', error)
  }
}

//get data for either the live or final leaderboard

async function createLeaderboardTable(id, page, limit) {
  let data = await fetchData(http + `api/tournament-info/${id}`)
  let status = data[0].status

  createPaginationButtons(id, status)

  if (status === 'planned') {
    leaderboardTable.innerHTML = ''

    document.getElementById('no-tourney').innerHTML =
      'Tournament has not started yet'
  } else {
    document.getElementById('no-tourney').innerHTML = ''

    leaderboardTable.innerHTML = ''

    let leaderboardData = await fetchData(
      http + `api/tournament/${id}/${status}?page=${page}&limit=${15}`
    )
    let headers

    if (status === 'complete') {
      document.getElementById('no-tourney').innerHTML = 'Final'
      headers = [
        'Position',
        'Player',
        'Score',
        'R1',
        'R2',
        'R3',
        'R4',
        'Total',
        'Earnings',
        'Fedex Pts',
      ]

      const thead = document.createElement('thead')
      const tr = document.createElement('tr')

      headers.forEach((text) => {
        const th = document.createElement('th')
        th.textContent = text
        tr.appendChild(th)
      })

      thead.appendChild(tr)
      leaderboardTable.appendChild(thead)

      const tbody = document.createElement('tbody')
      leaderboardData.forEach((player) => {
        const row = document.createElement('tr')

        headers.forEach((header) => {
          const td = document.createElement('td')
          td.textContent = player[header] || ''
          row.appendChild(td)
        })

        tbody.appendChild(row)
      })

      leaderboardTable.appendChild(tbody)
    }
    if (status === 'live') {
      document.getElementById('no-tourney').innerHTML = 'Live'

      headers = [
        'Position',
        'Player',
        'Score',
        'Today',
        'Thru',
        'R1',
        'R2',
        'R3',
        'R4',
        'Total',
      ]
      const thead = document.createElement('thead')
      const tr = document.createElement('tr')

      headers.forEach((text) => {
        const th = document.createElement('th')
        th.textContent = text
        tr.appendChild(th)
      })

      thead.appendChild(tr)
      leaderboardTable.appendChild(thead)

      const tbody = document.createElement('tbody')
      leaderboardData.forEach((player) => {
        const row = document.createElement('tr')

        headers.forEach((header) => {
          const td = document.createElement('td')
          td.textContent = player[header] || ''
          row.appendChild(td)
        })

        tbody.appendChild(row)
      })

      leaderboardTable.appendChild(tbody)
    }
  }
}

//updates the current tournament after the selection

// gets the list of tournaments and loads them
async function loadTournaments() {
  let tournaments = await fetchData(http + 'api/tournament/list')

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

    tournamentSelect.append(option)
  })
}

// runs load tournament
loadTournaments()

tournamentSelect.addEventListener('change', () => {
  let selectedTournament =
    tournamentSelect.options[tournamentSelect.selectedIndex].text
  let tournamentId =
    tournamentSelect.options[tournamentSelect.selectedIndex].value

  createLeaderboardTable(tournamentId)

  createPicksLeaderboard(tournamentId)

  document.getElementById('curr-tournament').innerHTML = selectedTournament
})

//create pagination buttons

async function createPaginationButtons(tournamentId, status) {
  try {
    let paginationContainer = document.getElementById('page-container')

    paginationContainer.innerHTML = ''

    // Ensure `http` is properly defined
    if (!http) throw new Error('Base URL (http) is not defined')

    let response = await fetchData(
      http + `api/tournament-count/${tournamentId}/${status}`
    )

    let rowCount = Number(response.rowCount)

    let numBtns = Math.ceil(rowCount / 15)

    if (numBtns === null) {
      numBtns = 0
    }

    for (let i = 0; i < numBtns; i++) {
      let pageBtn = document.createElement('button')
      pageBtn.textContent = i + 1
      pageBtn.classList.add('pagination-btn')

      pageBtn.addEventListener('click', function (e) {
        let pageNum = e.target.textContent

        pageBtn.classList.add('active')

        createLeaderboardTable(tournamentId, pageNum, 15)
      })
      paginationContainer.append(pageBtn)
    }
  } catch (error) {
    console.error('Error fetching tournament count:', error)
    return null
  }
}

const leaderboardContainer = document.getElementById(
  'pool-leaderboard-container'
)

// retrieves data from the databased based on users selected picks
async function createPicksLeaderboard(id) {
  let picksArray = await fetchData(http + `api/get-live-score-picks/${id}`)

  let cardsArray = picksArray.reduce((acc, curr) => {
    let existing = acc.find((e) => e.user_id === curr.user_id)

    if (curr.Score === 'E') {
      curr.Score = 0
    }
    if (curr.Score === 'CUT') {
      curr.Score = curr.Score + 10
    }
    if (isNaN(curr.Score)) {
      curr.Score = 0
    }

    let temp = String(curr.Score)

    if (temp.charAt(0) === '+') {
      curr.Score = String(curr.Score.substring(1))
    }

    if (existing) {
      existing.total += parseInt(curr.Score)

      // Check if the player is already added
      let playerExists = existing.team.find(
        (p) => p.player === curr.player_name
      )

      if (!playerExists) {
        existing.team.push({
          player: curr.player_name,
          score: parseInt(curr.Score),
        })
      }
    } else {
      acc.push({
        user_id: curr.user_id,
        team_name: curr.team_name,
        total: parseInt(curr.Score),
        team: [
          {
            player: curr.player_name,
            score: parseInt(curr.Score),
          },
        ],
      })
    }

    document.getElementById('pool-leaderboard-text').style.display = 'block'
    return acc
  }, [])

  cardsArray.forEach((card) => {
    card.team.sort((a, b) => a.score - b.score)
  })

  if (!cardsArray) {
    document.getElementById('pool-leaderboard-text').style.display = 'none'
    console.error('No data found')
    return
  }

  leaderboardContainer.innerHTML = ''

  //create leaderboard card
  cardsArray.forEach((element) => {
    let leaderboardCard = document.createElement('div')
    leaderboardCard.classList.add('leaderboard-card')

    let teamName = document.createElement('h3')
    teamName.textContent = element.team_name

    let scoreContainer = document.createElement('div')
    scoreContainer.classList.add('score-container')

    leaderboardCard.appendChild(teamName)
    leaderboardCard.appendChild(scoreContainer)

    element.team.forEach((el) => {
      let scoreDiv = document.createElement('div')

      let playerName = document.createElement('p')
      playerName.textContent = el.player

      let playerScore = document.createElement('p')
      playerScore.textContent = el.score

      if (Number(el.score) > 0) {
        playerScore.classList.add('pos-nums')
      }
      if (Number(el.score) < 0) {
        playerScore.classList.add('neg-nums')
      }

      scoreDiv.append(playerName, playerScore)

      scoreContainer.append(scoreDiv)
    })

    let scoreDiv = document.createElement('div')
    scoreDiv.classList.add('total-score')
    let total = document.createElement('p')
    total.textContent = 'Total'

    let highScore = element.team.pop()

    let totalScore = document.createElement('p')
    totalScore.textContent = element.total - highScore.score

    scoreDiv.append(total, totalScore)
    scoreContainer.append(scoreDiv)

    leaderboardContainer.appendChild(leaderboardCard)
  })
}
