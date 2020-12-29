$(function() {
  // when the page loads
  console.log("ready");
  engine = new Engine(8);
  engine.draw();
  $("#passNotification").hide();
  document.getElementById("passNotification").style.visibility = "visible";
});

document.getElementById("gameSetupBtn").addEventListener("click", function() {
  // when the new game button is clicked
  engine = null;
  engine = new Engine(8);
  engine.draw();
});

document.getElementById("startButton").addEventListener("click", function() {
  // when the start game button is clicked
  engine.draw();
  engine.display.showLegals(engine);
  $("#myCanvas").off("mousedown");
  console.log("始めましょう");
  engine.handleTurn();
});
