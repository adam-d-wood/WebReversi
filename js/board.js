class Board {

    constructor(dims) {
        this.rows = this.cols = dims
        this.field = []
        for (var i = 0; i < this.rows; i++) {
            this.field.push([])
            for (var j=0; j<this.cols; j++) {
                this.field[i].push(0)
            }
        }
        let half = this.rows/2
        this.field[half-1][half-1] = this.field[half][half] = 1
        this.field[half][half-1] = this.field[half-1][half] = 2
    }
}

// board = new Board(8)
// console.log(board.field)