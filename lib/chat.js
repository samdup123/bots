"use strict";

var xMin = 0;
var xMax = 100;
var yMin = 0;
var yMax = 100;
var bots = [];

var getRandomInt = function getRandomInt(min, max) {
  return Math.floor(Math.random() * Math.floor(max - min));
};

var getRandomCoord = function getRandomCoord() {
  var x = getRandomInt(xMin, xMax);
  var y = getRandomInt(yMin, yMax);
  return {
    x: x,
    y: y
  };
};

for (var i = 0; i < 100; i++) {
  bots.append({
    coord: getRandomCoord()
  });
}

bots.forEach(function (bot) {
  console.log(bot);
});
