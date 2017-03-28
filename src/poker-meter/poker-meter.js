'use strict'

const _ = window['_']

function Hand(table) {
  const log = []
  return {
    action: (player, action) => {
      log.push({player, action})
    },
    log: () => ({table, log})
  }
}

function Table() {
  let button = 0
  let seats = []

  function verify(seat) {
    if(seat < 0 || seat > 9)
      throw new Error(`seat ${seat} out of index`)
    else
      return seat
  }

  return {
    setPlayer: (seat, initials, sitOut) => {
      if(_.includes(seats, initials)){
        throw new Error(`Player ${initials} already exists`)
      }
      seats[verify(seat)] = {initials, sitOut}
    },
    getPlayer: seat => seats[verify(seat)],
    removePlayer: seat => {
      seats[verify(seat)] = undefined
    },
    setButton: seat => {
      button = verify(seat)
    },
    getButton: () => button,
    // getPosition: initials => (_.findIndex(seats, {initials}) - button + 10) % 10,
    log: () => ({button, seats})
  }
}

function LogHand(canvas, table) {
  const FOLD = 0
  const CALL = 1
  const RAISE = 2

  let active = true

  let resolvePromise
  let rejectPromise
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const actions = []
  let redoStack = []

  const players = _(_.range(table.getButton(), 10))
    .concat(_.range(0, table.getButton()))
    .map(table.getPlayer)
    .reject(_.isUndefined)
    .reject('sitOut')
    .value()

  let activeSeat = 2
  let activeAction = CALL

  function toggleActiveAction(){
    switch (activeAction){
      case FOLD:
        activeAction = CALL
        break
      case CALL:
        activeAction = RAISE
        break
      case RAISE:
        activeAction = FOLD
        break
    }
  }

  function foldPlayers(fromSeat, toSeat){
    let seats
    if(fromSeat < toSeat)
      seats = _.range(fromSeat, toSeat)
    else
      seats = _.concat(_.range(fromSeat, players.length()), _.range(0, toSeat))

    _.forEach(seats, seat => {
      actions.push({seat, player: players[seat], action: FOLD})
    })
    redoStack = []
  }

  function clickSeat(seat){
    if(seat === activeSeat) {
      toggleActiveAction()
    }
    else {
      actions.push({seat: activeSeat, player: players[activeSeat], action: activeAction})
      redoStack = []
      foldPlayers(activeSeat + 1, seat)

      activeSeat = seat
      toggleActiveAction()
    }
  }

  function undo(){
    if(actions.length > 0)
      redoStack.push(actions.pop())
  }

  function redo(){
    if(redoStack.length > 0)
      actions.push(redoStack.pop())
  }

  function endHand(){
    active = false
    resolvePromise(actions)
  }

  function cancelHand(){
    active = false
    rejectPromise()
  }

  function paint() {
    if(active)
      window.requestAnimationFrame(paint)

    _.forEach(actions, action => {

    })
  }

  paint()
  return promise
}

function EditTable(canvas) {

  let active = true
  const table = Table()

  function occupied(seat) {
    return table.getPlayer(seat) === undefined
  }

  function startHand() {
    active = false
    LogHand(canvas, table)
      .then(actions => {
        active = true
        paint()
      })
      .catch(() => {
        active = true
        paint()
      })
  }

  function clickSeat(seat, longClick){
    if(occupied(seat) && !longClick){
      table.setButton(seat)
    }
    else {
      active = false
      const player = table.getPlayer(seat)
      EditPlayer(canvas, seat, _.get(player, 'initials'), _.get(player, 'sitOut'))
        .then(({initials, sitOut}) => {
          if(initials)
            table.setPlayer(seat, initials, sitOut)
          else
            table.removePlayer(seat)
          active = true
          paint()
        })
        .catch(() => {
          active = true
          paint()
        })
    }
  }

  function paint() {
    if(active)
      window.requestAnimationFrame(paint)
  }

  paint()
}

function EditPlayer(canvas, seat, initialsString, sitOut){
  let active = true
  let initials = _.map(initialsString)

  let resolvePromise
  let rejectPromise
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  function toggleSitOut(){
    sitOut = !sitOut
  }

  function letter(l) {
    if(initials.length < 2)
      initials.push(l)
  }

  function back() {
    if(initials.length > 0)
      initials.pop()
  }

  function cancel() {
    active = false
    rejectPromise()
  }

  function enter() {
    if(initials.length === 2){
      active = false
      resolvePromise({initials: initials.join(''), sitOut})
    }
    else if(initials.length === 0){
      active = false
      resolvePromise({initials: undefined, sitPut: false})
    }
  }

  function paint(){
    if(active)
      window.requestAnimationFrame(paint)
  }

  paint()

}
