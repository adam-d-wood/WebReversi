class Display {
  constructor(dims) {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.cols = dims;
    this.rows = dims;
    this.colWidth = this.canvas.width / this.cols;
    this.rowHeight = this.canvas.height / this.rows;
    this.darkColour = "#000000";
    this.lightColour = "#ffffff";
  }

  drawBoard(board) {
    // draws the board on the HTML Canvas object

    this.drawGrid();
    this.labelSquares();
    this.drawDiscs(board);
  }

  drawGrid() {
    // draws the grid seperating each square on
    // the HTML canvas

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "#A2A3BB";
    for (var i = 1; i < this.rows; ++i) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.colWidth * i, 0);
      this.ctx.lineTo(this.colWidth * i, this.canvas.height);
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.moveTo(0, this.rowHeight * i);
      this.ctx.lineTo(this.canvas.width, this.rowHeight * i);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  labelSquares() {
    // labels the top and left side of the board
    // with the coordinate system

    for (let i = 0; i < this.rows + 1; i++) {
      this.ctx.font = "14px Lucida Console";
      this.ctx.fillStyle = "#D9C9C9";
      this.ctx.fillText(
        String.fromCharCode(i + 96),
        this.colWidth * i - 14,
        15
      );
      this.ctx.fillText(i, 1, this.rowHeight * i - 10);
    }
  }

  drawDiscs(board) {
    // draws each player's discs on the HTML canvas

    for (var i = 0; i < board.field.length; i++) {
      for (var j = 0; j < board.field[i].length; j++) {
        if (board.field[i][j] == 1) {
          this.ctx.fillStyle = this.darkColour;
          var x = this.colWidth * j + this.canvas.width / (this.cols * 2);
          var y = this.rowHeight * i + this.canvas.height / (this.rows * 2);
          this.ctx.beginPath();
          this.ctx.arc(x, y, this.colWidth / 3, 0, 2 * Math.PI);
          this.ctx.fill();
        } else if (board.field[i][j] == 2) {
          this.ctx.fillStyle = this.lightColour;
          x = this.colWidth * j + this.canvas.width / (this.cols * 2);
          y = this.rowHeight * i + this.canvas.height / (this.rows * 2);
          this.ctx.beginPath();
          this.ctx.arc(x, y, this.colWidth / 3, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.closePath();
        }
      }
    }
  }

  showLegals(game) {
    // displays the legal moves for the active player
    // as small dots on the canvas

    let legals = game.findLegalMoves(game.board.field);
    for (var i = 0; i < game.board.rows; i++) {
      for (var j = 0; j < game.board.cols; j++) {
        var x = this.colWidth * (j + 0.5),
          y = this.rowHeight * (i + 0.5);
        switch (game.turnToken()) {
          case 1:
            this.ctx.fillStyle = this.darkColour;
            break;
          case 2:
            this.ctx.fillStyle = this.lightColour;
            break;
        }
        if (JSON.stringify(legals).includes([i, j])) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
          this.ctx.fill();
        }
      }
    }
  }

  highlightSquare(square) {
    // highlights a given sqaure on the board

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    let x = square[1] * this.colWidth;
    let y = square[0] * this.rowHeight;
    this.ctx.fillRect(x, y, this.colWidth, this.rowHeight);
  }

  highlightLastSquare(game) {
    // highlights the square to white a move was
    // most recently played

    let lastSquare = game.machineForm(game.gameHistory.slice(-2));
    this.highlightSquare(lastSquare);
  }
}
