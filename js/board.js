class Board {
  constructor(dims) {
    this.rows = this.cols = dims;
    this.field = this.constructStartingBoard();
  }

  constructStartingBoard() {
    // constructs a board matrix representing
    // the starting position

    var field = [];
    for (var i = 0; i < this.rows; i++) {
      field.push([]);
      for (var j = 0; j < this.cols; j++) {
        field[i].push(0);
      }
    }
    let half = this.rows / 2;
    field[half - 1][half - 1] = field[half][half] = 2;
    field[half][half - 1] = field[half - 1][half] = 1;
    return field;
  }

  rotateCell(cell, turns) {
    // rotates a cell by a specified amount about the centre
    // 'turns' is the number of quarter turns anticlockwise

    var newCell = cell;
    for (let i = 0; i < turns; i++) {
      let col = this.rows - 1 - newCell[1];
      let row = newCell[0];
      newCell = [col, row];
    }
    return newCell;
  }

  reflectCell(cell, direction) {
    // reflects a cell in one of the boards diagonals
    // direction = 0 refers to the leading diagonal
    // direction = 1 refers to the trailing diagonal

    var newCell;
    if (direction == 0) {
      newCell = cell.reverse();
    } else {
      newCell = [this.rows - 1 - cell[1], this.cols - 1 - cell[0]];
    }
    return newCell;
  }

  permuteCell(cell, permutation) {
    // performs one of the four permutations to a cell
    // permutation = 0 => nothing (the 'identity')
    // permutation = 1 => reflection in leading diagonal
    // permutation = 2 => rotation by half turn about centre
    // permutation = 3 => reflection in trailing diagonal

    var newCell;
    switch (permutation) {
      case 0:
        newCell = cell;
        break;
      case 1:
        newCell = this.reflectCell(cell, 0);
        break;
      case 2:
        newCell = this.rotateCell(cell, 2);
        break;
      case 3:
        newCell = this.reflectCell(cell, 1);
        break;
    }
    return newCell;
  }
}
