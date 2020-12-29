class CompPlayer extends Reversi {
  constructor(dims) {
    super(dims);
  }

  evaluateByWeight(field, maxToken) {
    // applies a weightings mask to a given game
    // position to determine, based on this alone,
    // which player this position is more desirable for

    var weightings = this.generateWeightingMask();
    let result = 0;
    for (let i = 0; i < weightings.length; i++) {
      for (let j = 0; j < weightings[i].length; j++) {
        let mult;
        if (field[i][j] == maxToken) {
          mult = 1;
        } else if (field[i][j] == 3 - maxToken) {
          mult = -1;
        } else {
          mult = 0;
        }
        result += mult * weightings[i][j];
      }
    }
    return result;
  }

  generateWeightingMask() {
    // constructs a weighting 'mask' based on which positions are
    // likely to be desirable to occupy

    let weightings = [];
    let n = this.board.rows - 1;
    for (let i = 0; i < n + 1; i++) {
      let row = [];
      for (let j = 0; j < n + 1; j++) {
        var score;
        var cell = [i, j];
        if (this.cornerSquare(cell, this.board.rows)) {
          score = 100;
        } else if (this.cSquare(cell, this.board.rows)) {
          score = -10;
        } else if (this.aOrBSquare(cell, this.board.rows)) {
          score = 0;
        } else if (this.xSquare(cell, this.board.rows)) {
          score = -10;
        } else {
          score = 0;
        }
        row.push(score);
      }
      weightings.push(row);
    }
    return weightings;
  }

  cornerSquare(cell, dims) {
    // tests whether a given square is a
    // corner square

    var n = dims - 1;
    var [i, j] = cell;
    var x = j - n / 2;
    var y = i - n / 2;
    return x ** 2 + y ** 2 == n ** 2 / 2;
  }

  cSquare(cell, dims) {
    // tests whether a given square is a
    // C square

    var n = dims - 1;
    var [i, j] = cell;
    var x = j - n / 2;
    var y = i - n / 2;
    return x ** 2 + y ** 2 == ((n - 1) ** 2 + 1) / 2;
  }

  aOrBSquare(cell, dims) {
    // tests whether a given square is an
    // A square or B square

    var n = dims - 1;
    var [i, j] = cell;
    return [i, j].map(x => [0, n].includes(x)).reduce((x, y) => x || y);
  }

  xSquare(cell, dims) {
    // tests whether a given square is an
    // X square

    var n = dims - 1;
    var [i, j] = cell;
    var x = j - n / 2;
    var y = i - n / 2;
    return x ** 2 + y ** 2 == (n - 2) ** 2 / 2;
  }

  countFrontiers(field) {
    // returns the number of frontier discs for light and dark

    let dark = 0;
    let light = 0;
    const surrounds = this.generateSurroundVectors();
    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        if (field[i][j] != 0) {
          let frontier = false;
          for (let s of surrounds) {
            let cell = [i + s[0], j + s[1]];
            if (this.onBoard(cell) && field[cell[0]][cell[1]] == 0) {
              frontier = true;
            }
          }
          if (frontier) {
            if (field[i][j] == 1) {
              dark++;
            } else {
              light++;
            }
          }
        }
      }
    }
    return [dark, light];
  }

  evaluateByTerritory(field, maxToken) {
    // evuluates the desirability of a position for a given
    // player based only on how many discs each player has

    let dark = 0,
      light = 0;
    for (let i = 0; i < field.length; i++) {
      for (let j = 0; j < field[i].length; j++) {
        if (field[i][j] == 1) dark++;
        else if (field[i][j] == 2) light++;
      }
    }
    return maxToken == 1 ? dark - light : light - dark;
  }

  evaluateByMobility(field, maxToken) {
    // evaluates the desirability of a position for a given
    // player based only on each player's mobility

    const darkMoves = this.findLegalMoves(field, 1).length;
    const lightMoves = this.findLegalMoves(field, 2).length;
    const team = maxToken == 1 ? 1 : -1;
    const mobility = darkMoves - lightMoves;
    return mobility * team;
  }

  evaluateByFrontiers(field, maxToken) {
    // evaluates the desirability of a position for a given
    // player based only on the number of frontier discs possessed
    // by each player

    const frontiers = this.countFrontiers(field);
    const [dark, light] = frontiers;
    return maxToken == 1 ? light - dark : dark - light;
  }

  evaluate(field, maxToken, tilesLeft) {
    // evaluates how desirable some position is for a given
    // player based on an amalgamation of various metrics

    if (this.gameEnded(field)) {
      var score = this.evaluateByTerritory(field, maxToken);
      if (score > 0) {
        return 1000 + score;
      } else if (score < 0) {
        return -1000 + score;
      } else {
        return 0;
      }
    }
    if (tilesLeft > 5) {
      const mc = 1,
        fc = 1,
        ec = 1;
      const mobility = this.evaluateByMobility(field, maxToken);
      const frontiers = this.evaluateByFrontiers(field, maxToken);
      const edges = this.evaluateByWeight(field, maxToken);
      return mc * mobility + fc * frontiers + ec * edges;
    } else return this.evaluateByTerritory(field, maxToken);
  }

  inv(move) {
    // returns a reversed copy of a move index

    if (move == null) {
      return move;
    } else {
      return [move[1], move[0]];
    }
  }

  maxMove(a, b) {
    // returns the ValuedMove object with the
    // greatest value attribute

    let vals = [];
    for (let m of [a, b]) {
      while (m instanceof ValuedMove) {
        m = m.value;
      }
      vals.push(m);
    }
    return vals[0] >= vals[1] ? a : b;
  }

  minMove(a, b) {
    // returns the ValuedMove object with the
    // least value

    let vals = [];
    for (let m of [a, b]) {
      while (m instanceof ValuedMove) {
        m = m.value;
      }
      vals.push(m);
    }
    return vals[0] <= vals[1] ? a : b;
  }

  alphabeta(
    field,
    depth,
    maxToken,
    tilesLeft,
    alpha = -10000,
    beta = 10000,
    maximisingPlayer = true
  ) {
    // searches the game tree to a specified depth
    // and returns the best move from some position

    if (depth === 0 || this.gameEnded(field)) {
      var evaluation = this.evaluate(field, maxToken, tilesLeft);
      return new ValuedMove(evaluation, null);
    }
    let simToken = maximisingPlayer ? maxToken : 3 - maxToken;
    let legals = this.findLegalMoves(field, simToken);
    if (legals == false) legals.push(null);
    if (maximisingPlayer) {
      var value = new ValuedMove(-10000, null);
      for (var move of legals) {
        var newfield = this.mockPlay(field, move, simToken);
        var newValue = this.alphabeta(
          newfield,
          depth - 1,
          maxToken,
          tilesLeft,
          alpha,
          beta,
          false
        ).value;
        var newValuedMove = new ValuedMove(newValue, move);
        value = this.maxMove(value, newValuedMove);
        alpha = this.maxMove(alpha, value.value);
        if (alpha >= beta) break;
      }
      return value;
    } else {
      // minimising player
      var value = new ValuedMove(10000, null);
      for (var move of legals) {
        var newfield = this.mockPlay(field, move, simToken);
        var newValue = this.alphabeta(
          newfield,
          depth - 1,
          maxToken,
          tilesLeft,
          alpha,
          beta,
          true
        ).value;
        var newValuedMove = new ValuedMove(newValue, move);
        value = this.minMove(value, newValuedMove);
        beta = this.minMove(beta, value.value);
        if (alpha >= beta) break;
      }
      return value;
    }
  }
}

class ValuedMove {
  constructor(value, move) {
    this.value = value;
    this.move = move;
  }
}
