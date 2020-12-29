importScripts("board.js", "reversi.js", "thinker.js");

self.onmessage = function(msg) {
  let [depth, fieldCopy, turnToken, freeTiles, dims] = msg.data;
  var minimaxer = new CompPlayer(dims);
  var result = minimaxer.alphabeta(fieldCopy, depth, turnToken, freeTiles);
  delete minimaxer;
  self.postMessage(result);
};
