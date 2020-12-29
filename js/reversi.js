class Reversi {
  constructor(dims) {
    this.board = new Board(dims);
    this.gameRunning = true;
    this.darkTurn = true;
    this.missedTurns = 0;
    this.freeTiles = dims ** 2 - 4;
    this.gameHistory = "";
    this.inBook = true;
    Object.defineProperty(this, "openings", {
      configurable: true,
      writable: true,
      value: []
    });
  }

  turnToken() {
    // returns the token ID of the player whose turn
    // it currently is

    if (this.darkTurn) return 1;
    else return 2;
  }

  gameEnded(field) {
    // determines whether the game has ended by checking
    // whether either player has legal moves available

    const noDarkMoves = this.findLegalMoves(field, 1) == false;
    const noLightMoves = this.findLegalMoves(field, 2) == false;
    return noDarkMoves && noLightMoves;
  }

  insertToken(cell) {
    // checks to see whether a move is legal and, if so
    // inserts the relevant token into the board array

    const [row, col] = cell;
    var success;
    if (
      JSON.stringify(this.findLegalMoves(this.board.field)).includes(cell)
    ) {
      // if the move is in the list of legal moves
      success = true;
      // insert the token into the board matrix
      this.board.field[row][col] = this.turnToken();
    } else {
      success = false;
    }
    return success;
  }

  findLegalMoves(field, player = null) {
    // finds all legal moves for a given player
    // given some position 'field'

    if (player == null) player = this.turnToken();
    const neighbours = this.findNeighbours(field);
    const legals = this.validateNeighbours(neighbours, field, player);
    return legals;
  }

  findNeighbours(field) {
    // finds all squares adjacent to occupied squares

    const occupiedCells = this.findOccupiedCells(field);
    const surrounds = this.generateSurroundVectors();
    var neighbours = [];
    for (let cell of occupiedCells) {
      for (let surround of surrounds) {
        let neighbour = cell.map(function(a, b) {
          return a + surround[b];
        });
        if (
          this.onBoard(neighbour) &&
          field[neighbour[0]][neighbour[1]] == 0
        ) {
          neighbours.push(neighbour);
        }
      }
    }
    var unduplicatedNeighbours = this.deleteDuplicates(neighbours);
    return unduplicatedNeighbours;
  }

  findOccupiedCells(field) {
    // returns a list of all cells which are occupied

    var occupiedCells = [];
    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        if (field[i][j] != 0) {
          occupiedCells.push([i, j]);
        }
      }
    }
    return occupiedCells;
  }

  generateSurroundVectors() {
    // returns a list of vectors corresponding to
    // transformations which map a cell onto one of
    // its neighbouring cells

    var surrounds = [];
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i != 0 || j != 0) {
          surrounds.push([i, j]);
        }
      }
    }
    return surrounds;
  }

  validateNeighbours(neighbours, field, player) {
    // tests whether each 'neighbour' square
    // is actually a legal move for a given player

    var legals = [];
    for (let move of neighbours) {
      var runs = this.findRuns(field, move, player);
      if (runs.length > 0) {
        legals.push(move);
      }
    }
    return legals;
  }

  nextCellInRun(cell, direction) {
    // given a cell, finds the adjacent cell
    // in a given direction

    return cell.map(function(x, y) {
      return x + direction[y];
    });
  }

  deleteDuplicates(legals) {
    // deletes duplicate moves in a list of
    // legal moves

    var result = [];
    for (let move of legals) {
      if (!JSON.stringify(result).includes(move)) {
        result.push(move);
      }
    }
    return result;
  }

  onBoard(cell) {
    // tests whether a square is on the board
    // i.e. [3, 4] is on the board but
    // [9, -3] is not (in 8x8)

    var valid = true;
    for (var coord of cell) {
      valid = valid && 0 <= coord && coord < this.board.cols;
    }
    return valid;
  }

  findRuns(field, cell, playerToken) {
    // generates a list of 'runs' along which
    // discs must be flipped as a result of a
    // move

    var directions = this.generateSurroundVectors();
    var runs = [];
    for (let direction of directions) {
      var run = [];
      var testedCell = cell;
      while (true) {
        testedCell = this.nextCellInRun(testedCell, direction);
        if (!this.onBoard(testedCell)) {
          break;
        }
        var testedToken = this.tokenAt(testedCell, field);
        if (testedToken == 0) {
          break;
        } else if (testedToken == playerToken) {
          if (run.length > 0) {
            runs.push(run);
          }
          break;
        } else if (testedToken == 3 - playerToken) {
          run.push(testedCell);
        }
      }
    }
    return runs;
  }

  flipTokens(field, cell, token) {
    // flips the necessary discs given a move (cell)
    // that has just been played and a board position (field)

    var runs = this.findRuns(field, cell, token);
    for (var run of runs) {
      for (var cell of run) {
        field[cell[0]][cell[1]] = token;
      }
    }
  }

  countTokens(board) {
    // counts the number of discs for
    // each player

    var dark = 0,
      light = 0;
    for (var i = 0; i < board.rows; i++) {
      for (var j = 0; j < board.cols; j++) {
        if (board.field[i][j] == 1) dark++;
        else if (board.field[i][j] == 2) light++;
      }
    }
    return [dark, light];
  }

  handlePass() {
    // is called whenever a player is
    // forced to pass (because they have no
    // legal moves)

    this.missedTurns += 1;
    this.darkTurn = !this.darkTurn;
    this.gameHistory += "--";
  }

  getRandomMove() {
    // returns a random, legal move

    var legals = this.findLegalMoves(this.board.field);
    var move = legals[Math.floor(Math.random() * legals.length)];
    return move;
  }

  loadOpenings(callback) {
    // requests the opening book from a text file

    var self = this;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        callback(this, self);
      }
    };
    xhttp.open("GET", "books/openings.txt", true);
    xhttp.send();
  }

  callback(xhttp, self) {
    // is run when the opening book text file is posted

    let openings = xhttp.responseText.split("\n");
    for (let i = 0; i < openings.length; i++) {
      openings[i] = openings[i].toLowerCase().split(", ");
    }
    self.openings = openings;
  }

  checkInBook() {
    // checks whether the game is still following
    // a known opening and updates this.inBook accordingly.
    // returns a list of possible openings that are consistent
    // with the game so far

    var possibleOpenings = this.findPossibleOpenings(this.gameHistory);
    var viableOpenings = this.filterLongerOpenings(possibleOpenings);
    if (viableOpenings.length > 0) {
      this.inBook = true;
    } else {
      this.inBook = false;
    }
    return viableOpenings;
  }

  getBookMove(openings) {
    // randomly chooses a move from a book opening
    // that is consistent with the game so far

    let progress = this.gameHistory.length;
    let opening = openings[Math.floor(Math.random() * openings.length)];
    let permutedMove = this.machineForm(
      opening[0][0].slice(progress, progress + 2).split("")
    );
    var move = this.board.permuteCell(permutedMove, opening[1]);
    move = [move[0], move[1]];
    return move;
  }

  findPossibleOpenings(transcript) {
    // returns a list of all book openings
    // that are consistent with the game so far

    let possibleOpenings = [];
    for (let permutation = 0; permutation < 4; permutation++) {
      var perumtedHistory = "";
      for (let i = 0; i < transcript.length / 2; i++) {
        let cell = this.machineForm(
          transcript.slice(i * 2, i * 2 + 2).split("")
        );
        let permutedCell = this.humanForm(
          this.board.permuteCell(cell, permutation)
        ).join("");
        perumtedHistory += permutedCell;
      }
      for (let opening of this.openings) {
        if (opening[0].startsWith(perumtedHistory)) {
          possibleOpenings.push([opening, permutation]);
        }
      }
    }
    return possibleOpenings;
  }

  filterLongerOpenings(openings) {
    // filters a list of openings to only
    // include openings that contain moves
    // beyond the current game

    let longerOpenings = [];
    for (let opening of openings) {
      if (opening[0][0].length > this.gameHistory.length) {
        longerOpenings.push(opening);
      }
    }
    return longerOpenings;
  }

  getCompletedOpening(openings) {
    // returns the longest opening that has been
    // fully played out in the current game

    let completedOpening = [[""]];
    for (let opening of openings) {
      if (
        opening[0][0].length <= this.gameHistory.length &&
        opening[0][0].length > completedOpening[0][0].length
      ) {
        completedOpening = opening;
      }
    }
    return completedOpening;
  }

  machineForm(cell) {
    // converts a coordinate in the form
    // letter, number (e.g. e6) to the corresponding
    // indices of the field matrix (e.g. [4,5])

    let col = cell[0].charCodeAt(0) - 97;
    let row = cell[1] - 1;
    return [row, col];
  }

  humanForm(cell) {
    // the inverse function of machineForm().

    var col = String.fromCharCode(cell[1] + 97);
    var row = cell[0] + 1;
    return [col, row];
  }

  mockPlay(field, move, token) {
    // returns the board position that results from
    // inserting a given token at a given position from
    // some specified position

    if (move == null) return field;
    let newfield = JSON.parse(JSON.stringify(field));
    newfield[move[0]][move[1]] = token;
    this.flipTokens(newfield, [move[0], move[1]], token);
    return newfield;
  }

  tokenAt(cell, field) {
    // returns the token (0, 1, or 2) at a certain
    // square in the field matrix

    var y = cell[0];
    var x = cell[1];
    var token = field[y][x];
    return token;
  }
}
