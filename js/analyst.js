class Analyst {
  constructor(dims, transcript) {
    this.transcript = transcript;
    this.simulator = new CompPlayer(dims);
    this.simulator.loadOpenings(this.simulator.callback);
    this.positions = this.genPositions();
  }

  genPositions() {
    // returns a list of all positions encountered in a game
    // from a transcript of the game

    var positions = [];
    var field = JSON.parse(JSON.stringify(this.simulator.board.field));
    for (let i = 0; i < this.transcript.length; i += 2) {
      var move = this.transcript.slice(i, i + 2);
      var token = i % 4 == 0 ? 1 : 2;
      if (move != "--") {
        move = this.simulator.machineForm(move);
        var field = this.simulator.mockPlay(field, move, token);
        positions.push(field);
      } else {
        positions.push(field);
      }
    }
    return positions;
  }

  gradePositions(depth) {
    // asynchronously computes the value of each position using an
    // alpha-beta search on a given search depth

    var specificDepth = depth;
    var self = this;
    var evaluations = new Array(this.positions.length);
    var freeTiles = this.simulator.board.rows ** 2 - 1;
    for (var i = 0; i < this.positions.length; i++) {
      if (i > 0 && this.positions[i] != this.positions[i - 1]) {
        freeTiles -= 1;
      }
      if (freeTiles <= 10) {
        // solves the game if there are 10 or
        // fewer tiles left
        specificDepth = 100;
      }
      var fieldCopy = JSON.parse(JSON.stringify(this.positions[i]));
      var token = i % 2 == 0 ? 2 : 1;
      evaluations[i] = new Promise(function(resolve) {
        var w = new Worker("js/minimaxWorker.js");
        var workerMessge = [
          specificDepth,
          fieldCopy,
          token,
          freeTiles,
          self.simulator.board.rows
        ];
        w.postMessage(workerMessge);
        w.onmessage = function(event) {
          var colour = i % 2 == 0 ? -1 : 1;
          var result = event.data;
          var value = result.value * colour;
          var move = result.move;
          w.terminate();
          w = undefined;
          resolve([value, move]);
        };
      });
    }
    return Promise.all(evaluations);
  }

  separateEvaluations(evaluations) {
    // splits the value and best move for each position
    // into seperate lists for values and best moves

    var values = new Array(evaluations.length);
    var moves = new Array(evaluations.length);
    for (var i = 0; i < evaluations.length; i++) {
      values[i] = evaluations[i][0];
      if (i != evaluations.length - 1) {
        moves[i + 1] = evaluations[i][1];
      }
    }
    return [values, moves];
  }

  constructAnalysisTable(evaluations) {
    // constructs a 2D array table to display in the
    // post game analysis popup

    var [values, moves] = this.separateEvaluations(evaluations);
    var table = [];
    for (let i = 0; i < evaluations.length; i++) {
      var playedMove = this.transcript.slice(i * 2, (i + 1) * 2);
      var appraisal = this.appraiseMove(i, values, moves, playedMove);
      var row = [i + 1, playedMove, values[i], moves[i], appraisal];
      table.push(row);
    }
    return table;
  }

  appraiseMove(n, values, moves, playedMove) {
    // assigns a qualitative label to each move
    // describing how good it was

    var appraisal = "";
    var valImprovement = values[n + 1] * -1 - values[n];
    var playedOpening = this.determineOpening(this.transcript);
    var openingLength = playedOpening[0].length / 2;
    if (moves[n]) {
      if (n <= openingLength) {
        appraisal = "book: " + playedOpening[1];
      } else {
        if (playedMove == this.simulator.humanForm(moves[n]).join("")) {
          appraisal = "correct move";
        } else if (valImprovement >= 0) {
          appraisal = "good move";
        } else {
          appraisal = "mistake";
        }
      }
    }
    return appraisal;
  }

  determineOpening() {
    // determines the longest opening that is consistent with
    // the game being analysed

    var consistentOpenings = this.findConsistentOpenings();
    var playedOpening = ["", null];
    for (var opening of consistentOpenings) {
      if (opening[0].length > playedOpening[0].length) {
        playedOpening = opening;
      }
    }
    return playedOpening;
  }

  findConsistentOpenings() {
    // finds all openings which are consistent
    // with the game being analysed

    var consistentOpenings = [];
    for (var permutation = 0; permutation < 4; permutation++) {
      var permutedHistory = "";
      for (var i = 0; i < this.transcript.length / 2; i++) {
        var cell = this.simulator.machineForm(
          this.transcript.slice(i * 2, i * 2 + 2).split("")
        );
        var permutedCell = this.simulator
          .humanForm(this.simulator.board.permuteCell(cell, permutation))
          .join("");
        permutedHistory += permutedCell;
      }
      for (var opening of this.simulator.openings) {
        if (permutedHistory.startsWith(opening[0])) {
          consistentOpenings.push(opening);
        }
      }
    }
    return consistentOpenings;
  }
}
