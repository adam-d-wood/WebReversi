class Reversi {

    constructor(dims) {
        this.board = new Board(dims)
        this.display = new Display(dims)
        this.gameRunning = true
        this.blackTurn = true
        this.missedTurns = 0
        this.humanPlayers = []
        // this.blackPlayer = document.getElementById("engineSelect").value
        this.blackPlayer = minimax
        this.redPlayer = minimax
        this.aiDelay = 0 //miliseconds
        this.freeTiles = dims**2 - 4
    }

    draw() {
        this.display.drawBoard(this.board)
    }

    turnToken() {
        if (this.blackTurn) return 1
        else return 2
    }

    gameEnded() {
        if (this.findLegalMoves(this.board, 1) == false && this.findLegalMoves(this.board, 2) == false) {
            console.log("ended")
            return true
        } else {
            console.log("not ended")
            return false
        }
        // console.log("missed", this.missedTurns)
    }

    insertToken(cell, field) {
        console.log("cell", cell)
        // console.log(JSON.parse(JSON.stringify(field)))
        var [col, row] = cell
        // console.log(col, row)
        // console.log("field", field)
        // console.log("legals", this.findLegalMoves(this.board))
        if (JSON.stringify(this.findLegalMoves(this.board)).includes(cell.reverse())) {
            var success = true
            field[row][col] = this.turnToken()
            // console.log(JSON.parse(JSON.stringify(field)))
        } else {
            success = false 
            console.log("illegal")
        }
    // console.log("success", success)
    return success
    }

    findLegalMoves(board, player=null) {
        if (player == null) player = this.turnToken()
        let legals = []
        let friendlyCells = []
        // console.log(friendlyCells)
        let enemyCells = []
        // console.log("enemy: ", enemyCells)
        for (i=0; i < board.rows; i++) {
            for (j=0; j < board.cols; j++) {
                // console.log([i,j])
                if (board.field[i][j] == player) {
                    friendlyCells.push([i,j])
                    // console.log(friendlyCells)
                    // friendlyCells.map(console.log)
                } else if (board.field[i][j] ==  3-player) {
                    enemyCells.push([i,j])
                    // console.log("enemy: ", enemyCells)
                }
            }
        }
        var surrounds = []
        for (i = -1; i < 2; i++) {
            for (j = -1; j < 2; j++) {
                if (Math.abs(i) != Math.abs(j)) {
                    surrounds.push([i,j])
                }
            }
        }
        var totalOccupied = friendlyCells.concat(enemyCells)
        for (var cell of totalOccupied) {
            for (var s of surrounds) {
                var neighbour = []
                for (var i = 0; i <= 1; i++) {
                    neighbour.push(cell[i] + s[i])
                }
                var legal = true
                if (JSON.stringify(totalOccupied).includes(neighbour)) legal = false
                for (var ordinate of neighbour) {
                    if (!(0 <= ordinate && ordinate < board.cols)) legal = false
                    }
                if (legal) legals.push(neighbour)
                }
            }
        // console.log("maybe legals", legals)
        var trueLegals = [], directions = []
        for (var i = -1; i < 2; i++) {
            for (var j=-1; j<2; j++) {
                directions.push([i, j])
            }
        }
        directions.splice(4, 1) //removes [0, 0]
        for (var move of legals) {
            // console.log(legals)
            // console.log("move", move)
            var valid = false
            for (var d of directions) {
                // console.log(d)
                var testedCell = [move[1], move[0]]
                // console.log("restart", testedCell)
                var runLength = 0
                while (true) {
                    // console.log("tested cell", testedCell)
                    var testedCell = testedCell.map(function(a, b) {return a+d[b]})
                    // console.log("next tested cell", testedCell)
                    if (this.onBoard(testedCell)) {
                        if (board.field[testedCell[1]][testedCell[0]] == 3-player) {
                            runLength++
                            // console.log("run", runLength)
                        } else if (board.field[testedCell[1]][testedCell[0]] == player) {
                            if (runLength > 0) {
                                valid = true
                                // console.log("gotem")
                            }
                            break
                        } else break
                    } else break
            
                }
            }
            if (valid) trueLegals.push(move)
        }
        // console.log(trueLegals)
        return trueLegals
    }

    onBoard(cell) {
        var valid = true
        for (var coord of cell) {
            valid = valid && 0 <= coord && coord < this.board.cols
        }
        return valid
    }

    flipTokens(field, cell) {
        // console.log("from flip", cell, JSON.parse(JSON.stringify(field)))
        var directions = []
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                directions.push([i,j])
            }
        }
        directions.splice(4, 1) //removes [0, 0]
        // console.log("directions", directions)
        var runs = []
        for (var d of directions) {
            var run = [],
                testedCell = cell,
                ended = false, valid = true
            while (!ended) {
                run.push(testedCell)
                testedCell = testedCell.map(function(a, b) {return a+d[b]})
                if (!this.onBoard(testedCell)) {
                    valid = false
                    break
                }
                if (field[testedCell[1]][testedCell[0]] != 3-this.turnToken()) {
                    ended = true
                    // console.log("ended", this.constructor.humanForm(testedCell))
                }
            }
            // console.log("run", run)
            // console.log(field[testedCell[1]][testedCell[0]])
            if (valid && field[testedCell[1]][testedCell[0]] == this.turnToken()) {
                runs.push(run)
                // console.log("ya")
            }
        }
        // console.log("runs", runs)
        for (var r of runs) {
            for (var tile of r) {
                // console.log("cell", tile)
                field[tile[1]][tile[0]] = this.turnToken()
            }
        }
    }   

    countTokens(board) {
        var black = 0, red = 0
        for (var i = 0; i < board.rows; i++) {
            for (var j = 0; j < board.cols; j++) {
                if (board.field[i][j] == 1) black++
                else if (board.field[i][j] == 2) red++
            }
        }
        return [black, red]
    }

    handleTurn() {
        if (this.gameEnded()) {
            this.gameRunning = false
            this.handlegameEnd()
        } else {
            if (this.findLegalMoves(this.board) == false) {
                this.missedTurns++
                this.blackTurn = !(this.blackTurn)
                this.handleTurn()
            } else {
                var activePlayer = (this.blackTurn ? this.blackPlayer : this.redPlayer) 
                if (activePlayer === "human") {
                    document.getElementById("myCanvas").addEventListener("mousedown", this.processMove)
                }
                else { //if computer player
                    setTimeout(function() {reversi.processCompMove(activePlayer)}, this.aiDelay)
                }
            }
        }

    }


    processCompMove(player) {
        let fieldCopy = JSON.parse(JSON.stringify(this.board.field))
        // let result = player(fieldCopy, 14, -Infinity, Infinity, 1, this.turnToken(), this.freeTiles)
        let result = player(fieldCopy, 3, this.turnToken(), true)
        console.log(player, "result", result)
        let value = result.value, move = result.move
        if (this.insertToken(move, this.board.field)) {
            this.flipTokens(this.board.field, move.reverse())
            this.display.ctx.clearRect(0, 0, reversi.display.canvas.width, reversi.display.canvas.height)
            this.draw()
            this.blackTurn = !(this.blackTurn)
            this.display.showLegals(this)
        }
        this.handleTurn()
    }


    processMove() {
        const bound = reversi.display.canvas.getBoundingClientRect()
        var x = event.clientX - bound.left
        var y = event.clientY - bound.top
        var cellX = Math.floor(x/reversi.display.colWidth),
        cellY = Math.floor(y/reversi.display.rowHeight)
        console.log(Reversi.humanForm([cellX, cellY]))
        if (reversi.insertToken([cellX,cellY], reversi.board.field)) {
            reversi.flipTokens(reversi.board.field, [cellX, cellY])
            // console.log(reversi.board.field)
            reversi.display.ctx.clearRect(0, 0, reversi.display.canvas.width, reversi.display.canvas.height)
            reversi.draw()
            reversi.blackTurn = !(reversi.blackTurn)
            reversi.display.showLegals(reversi)
        }
        reversi.handleTurn()
    }

    // getMove() {
    //     if (this.gameEnded()) {
    //         this.gameRunning = false
    //         this.handlegameEnd()
    //     } else {
    //         if (!this.findLegalMoves(this.board)) {
    //             this.missedTurns++
    //             console.log("missed")
    //             this.blackTurn = !this.blackTurn
    //             getMove()
    //         } else {
    //             document.getElementById("myCanvas").addEventListener("mousedown", this.processMove)

    //         }
    //     }
    // }

    handlegameEnd() {
        var [black, red] = this.countTokens(this.board)
        console.log("black", black)
        console.log("red", red) 
    }

    static humanForm(cell) {
        var col = String.fromCharCode(cell[0]+97)
        var row = reversi.board.rows-cell[1]
        return [col, row]
    }
}


reversi = new Reversi(4)
reversi.draw()
reversi.display.showLegals(reversi)
reversi.handleTurn()
// reversi.mainLoop()