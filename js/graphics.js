class Display {

    constructor(dims) {
        this.canvas = document.getElementById("myCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.cols = dims
        this.rows = dims
        this.colWidth = this.canvas.width/this.cols
        this.rowHeight = this.canvas.height/this.rows
        // this.blackColour = "#80D39B"
        // this.redColour = "#B3B7EE"
        this.blackColour = "#FFE066"
        this.redColour = "#F25F5C"

        $("#myCanvas").mousemove(function(event) {
            const bound = this.getBoundingClientRect()
            var x = event.clientX - bound.left
            var y = event.clientY - bound.top
            var cellX = Math.floor(x/reversi.display.colWidth),
            cellY = Math.floor(y/reversi.display.rowHeight)
            $("#machineCoords").text(cellX + ", " + cellY)
            $("#humanCoords").text(Reversi.humanForm([cellX, cellY]))

        })
    }

    drawBoard(board) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.strokeStyle = "#A2A3BB"
        for (var i=1; i<this.rows; ++i) {
            this.ctx.beginPath()
            this.ctx.moveTo(this.colWidth*i, 0)
            this.ctx.lineTo(this.colWidth*i, this.canvas.height)
            this.ctx.stroke()
            this.ctx.closePath()
            
            this.ctx.beginPath()
            this.ctx.moveTo(0, this.rowHeight*i)
            this.ctx.lineTo(this.canvas.width, this.rowHeight*i)
            this.ctx.stroke()
            this.ctx.closePath()
        }
        
        // console.log("field", board.field)
        for (var i = 0; i < board.field.length; i++) {
            for (var j = 0; j < board.field[i].length; j++) {
                if (board.field[i][j] == 1) {
                    // console.log("drawing p1 at", i,j)
                    this.ctx.fillStyle = this.blackColour
                    var x = (this.colWidth)*j+this.canvas.width/(this.cols*2),
                    y = (this.rowHeight)*i+this.canvas.height/(this.rows*2)
                    this.ctx.beginPath()
                    this.ctx.arc(x, y, this.colWidth/3, 0, 2 * Math.PI)
                    this.ctx.fill()
                } else if (board.field[i][j] == 2) {
                    // console.log("drawing p2 at", i,j)
                    this.ctx.fillStyle = this.redColour
                    x = (this.colWidth)*j+this.canvas.width/(this.cols*2)
                    y = (this.rowHeight)*i+this.canvas.height/(this.rows*2)
                    this.ctx.beginPath()
                    this.ctx.arc(x, y, this.colWidth/3, 0, 2 * Math.PI)
                    this.ctx.fill()
                    this.ctx.closePath()
        
                }
            }
        }
    }

    showLegals(game) {
        let legals = game.findLegalMoves(game.board)
        // console.log("field", game.board.field)
        // console.log("legals", legals)
        for (var i = 0; i < game.board.rows; i++) {
            for (var j = 0; j < game.board.cols; j++) {
                var x = this.colWidth * (j+0.5), y = this.rowHeight * (i+0.5)
                switch (game.turnToken()) {
                    case 1:
                        this.ctx.fillStyle = this.blackColour
                        break
                    case 2:
                        this.ctx.fillStyle = this.redColour
                        break
                }
                if (JSON.stringify(legals).includes([i,j])) {
                    this.ctx.beginPath()
                    this.ctx.arc(x, y, 5, 0, 2 * Math.PI)
                    this.ctx.fill()
                }
            }
        }
    }

}
