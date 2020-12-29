class Engine extends Reversi {
  constructor(dims) {
    super(dims);
    this.display = new Display(dims);
    this.darkPlayer = null;
    this.lightPlayer = null;
    this.darkDepth = 0;
    this.lightDepth = 0;
    this.aiDelay = 20; //miliseconds
    this.useBook = true;
    this.thinking = false;
    this.initGameTable();
    this.initDepthSelect();
    this.initPlayerSelect();
    this.initOpeningLabel();
    this.initAnalysisTable();
    this.loadOpenings(this.callback);
  }

  initDepthSelect() {
    // sets the depth select radio buttons to
    // update the relevant depth attribute

    var self = this;
    this.darkDepth = 1;
    console.log("intitialising depth selection");
    var darkselect = $("#darkdepthSelector .btn");
    darkselect[0].click();
    darkselect.on("click", function(event) {
      let darkdepth = $(this)
        .find("input")
        .val();
      self.darkDepth = Number(darkdepth);
    });
    this.lightDepth = 1;
    var lightselect = $("#lightdepthSelector .btn");
    lightselect[0].click();
    lightselect.on("click", function(event) {
      let lightdepth = $(this)
        .find("input")
        .val();
      self.lightDepth = Number(lightdepth);
    });
  }

  initPlayerSelect() {
    // sets the player select radio buttons to
    // update the relevant player attribute

    var self = this;
    this.darkPlayer = "human";
    console.log("intitialising player selection");
    var darkselect = $("#darkPlayerSelector .btn");
    darkselect[0].click();
    darkselect.on("click", function(event) {
      let darkplayer = $(this)
        .find("input")
        .val();
      self.darkPlayer = darkplayer;
    });
    this.lightPlayer = "human";
    var lightselect = $("#lightPlayerSelector .btn");
    lightselect[0].click();
    lightselect.on("click", function(event) {
      let lightplayer = $(this)
        .find("input")
        .val();
      self.lightPlayer = lightplayer;
    });
  }

  updateOpeningLabel() {
    // updates the label displaying the opening being played

    let label = document.getElementById("openingLabel");
    let possibleOpenings = this.findPossibleOpenings(this.gameHistory);
    let currentOpening = this.getCompletedOpening(possibleOpenings);
    if (typeof currentOpening[0][1] == "string") {
      label.innerHTML = currentOpening[0][1];
    }
  }

  updateGameTable() {
    // updates the game table after a move is played

    let table = document.getElementById("moveHistory");
    if (this.gameHistory.length % 4 === 0) {
      console.log(table.rows[0]);
      let row = table.rows[table.rows.length - 1];
      let cell = row.cells[1];
      console.log(row);
      cell.innerHTML = this.gameHistory.slice(-2);
    } else {
      let row = table.insertRow(-1);
      let cell1 = row.insertCell(0);
      cell1.innerHTML = this.gameHistory.slice(-2);
      row.insertCell(1);
    }
  }

  initGameTable() {
    // clears game table ready for new game

    let table = document.getElementById("moveHistory");
    let len = table.rows.length;
    for (let i = 0; i < len; i++) {
      table.deleteRow(0);
    }
  }

  initAnalysisTable() {
    var table = document.getElementById("analysisTable");
    var len = table.rows.length;
    for (let i = 0; i < len - 1; i++) {
      table.deleteRow(1);
    }
  }

  initOpeningLabel() {
    //initialises label displaying opening being played

    let label = document.getElementById("openingLabel");
    label.innerText = "Opening";
  }

  draw() {
    // wrapper for the drawBoard() method

    this.display.drawBoard(this.board);
  }

  handleTurn() {
    // is called every turn and handles
    // the logic of a single turn

    if (this.gameEnded(this.board.field)) {
      this.gameRunning = false;
      this.handlegameEnd();
    } else {
      // if game is still running
      if (this.findLegalMoves(this.board.field) == false) {
        this.handlePass();
        $("#passNotification").show();
        var passLabel = document.getElementById("passLabel");
        var playerText = this.darkTurn ? "Light" : "Dark";
        passLabel.innerText = playerText + " is forced to pass";
        this.updateGameTable();
        this.display.showLegals(this);
        var self = this;
        setTimeout(function() {
          $("#passNotification").hide();
          self.handleTurn(); //
        }, 1000);
      } else {
        // if there are legal moves available
        var activePlayer = this.darkTurn
          ? this.darkPlayer
          : this.lightPlayer;
        console.log("activeplayer: ", activePlayer);
        if (activePlayer === "human") {
          var self = this;
          $("#myCanvas").one("mousedown", function() {
            self.processHumanMove();
          });
          console.log("listening for input");
        } else if (!this.thinking) {
          //if computer player
          var self = this;
          this.thinking = true;
          console.log("processing CompMove");
          setTimeout(function() {
            self.processCompMove();
          }, this.aiDelay);
        }
      }
    }
  }

  initiateMinimax() {
    // constructs a list of parameters to be
    // passed to the minimax worker and then
    // initiates the creation of the worker

    var depth = this.darkTurn ? this.darkDepth : this.lightDepth;
    if (this.freeTiles <= 10) {
      depth = 10;
    }
    var fieldCopy = JSON.parse(JSON.stringify(this.board.field));
    var workerMessage = [
      depth,
      fieldCopy,
      this.turnToken(),
      this.freeTiles,
      this.board.rows
    ];
    this.createMinimaxWorker(workerMessage);
  }

  createMinimaxWorker(workerMessage) {
    // creates a minimax web worker with a
    // message. This worker asynchronously
    // performas the minimax algorithm

    var self = this;
    var w = new Worker("js/minimaxWorker.js");
    w.postMessage(workerMessage);
    w.onmessage = function(event) {
      var result = event.data;
      var move = result.move;
      if (typeof self != "undefined") {
        self.executeMove(move);
      }
      w.terminate(); // delete web worker
      w = undefined; // and remove the reference
    };
  }

  processCompMove() {
    // is called by handleTurn() if it is the
    // computers turn to move and handles the process
    // of deciding on a computer move

    var executed = false;
    if (this.gameHistory == "") {
      var move = this.getRandomMove();
      executed = true;
      this.executeMove(move);
    } else if (this.inBook && this.useBook) {
      var openings = this.checkInBook();
      if (this.inBook) {
        var move = this.getBookMove(openings);
        executed = true;
        this.executeMove(move);
      }
    }
    if (!executed) {
      this.initiateMinimax();
    }
  }

  executeMove(move) {
    // handles the execution of a move and updates
    // various game related attributes accordingly

    console.log("executing", move);
    if (this.insertToken(move)) {
      this.flipTokens(this.board.field, move, this.turnToken());
      this.display.ctx.clearRect(
        0,
        0,
        this.display.canvas.width,
        this.display.canvas.height
      );
      this.draw();
      this.darkTurn = !this.darkTurn;
      this.display.showLegals(this);
      this.gameHistory += this.humanForm(move).join("");
      console.log(this.gameHistory);
      this.display.highlightLastSquare(this);
      this.updateGameTable();
      this.updateOpeningLabel();
      this.freeTiles -= 1;
      this.thinking = false;
    }
    this.handleTurn();
  }

  processHumanMove() {
    // processes human input (clicking on the board)
    // and inputs the corresponding move, updating
    // various game attributes accordingly

    let move = this.getSquare(event);
    this.executeMove(move);
  }

  getSquare(event) {
    // determines which square has been clicked
    // given the coordinates of a mouseclick on
    // the board

    const bound = this.display.canvas.getBoundingClientRect();
    var x = event.clientX - bound.left;
    var y = event.clientY - bound.top;
    var cellX = Math.floor(x / this.display.colWidth),
      cellY = Math.floor(y / this.display.rowHeight);
    return [cellY, cellX];
  }

  handlegameEnd() {
    // determines the winner at the end of
    // the game and triggers the post-game
    // popup window

    var [dark, light] = this.countTokens(this.board);
    console.log("dark", dark);
    console.log("light", light);
    var prefix;
    if (dark > light) {
      prefix = "Dark Won ";
    } else if (light > dark) {
      prefix = "Light Won ";
    } else {
      prefix = "Draw: ";
    }
    let scoreline = prefix + dark + " - " + light;
    let scoreLabel = document.getElementById("gameReport");
    scoreLabel.innerText = scoreline;
    $("#postGameModal").modal("show");
    this.analyseGame(3);
  }

  analyseGame(depth) {
    // analyses the game just played and constructs
    // an analysis in memory

    var analyst = new Analyst(this.board.rows, this.gameHistory);
    var evaluations = analyst.gradePositions(depth);
    var self = this;
    evaluations.then(function(results) {
      var tableData = analyst.constructAnalysisTable(results);
      var humanisedTableData = [];
      for (var row of tableData) {
        try {
          row[3] = self.humanForm(row[3]).join("");
        } catch {
          row[3] = "N/A";
        }
        humanisedTableData.push(row);
      }
      self.populteAnalysisTable(humanisedTableData);
    });
  }

  populteAnalysisTable(tableData) {
    // populates an HTML table with the contents
    // of a precontructed analysis table

    var table = document.getElementById("analysisTable");
    for (let rowData of tableData) {
      var row = table.insertRow();
      for (let cellData of rowData) {
        var cell = row.insertCell();
        cell.innerHTML = cellData;
      }
    }
  }
}
