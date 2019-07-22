function randomMove(game) {
    console.log("called")
    let legals = game.findLegalMoves(game.board)
    // console.log("legals", legals)
    var move = legals[Math.floor(Math.random() * legals.length)]
    console.log([move[1],move[0]])
    return [move[1],move[0]]
}
