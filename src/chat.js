let EventEmitter = require('events');
let eventEmitter = new EventEmitter();
const BotBrain = require('./BotBrain');

const xMax = 52;
const yMax = 52;
const messageRadius = 4;
const quadsWide = Math.ceil(xMax / messageRadius);
const quadsTall = Math.ceil(yMax / messageRadius);
const numberBots = 400;

let getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

let getRandomCoord = () => {
  let x = getRandomInt(xMax);
  let y = getRandomInt(yMax);
  return {x, y};
}

let quads = [];

let getQuadFromCoord = (coord) => {
  let verticalBoxNum = Math.floor(coord.y/messageRadius);
  let horizontalBoxNum = Math.floor(coord.x/messageRadius);
  return {x: verticalBoxNum, y: horizontalBoxNum};
}

let sameQuads = (a,b) => a.x === b.x && a.y === b.y;

for (let i = 0; i < quadsTall; i++) {
  quads.push([]);
  for (let j = 0; j < quadsWide; j++) {
    quads[i].push([]);
  }
}

let globalTime = process.hrtime.bigint()

let movements = {};

let timeSinceLastMovement = globalTime;
let makeMovements = () => {
  let deltaTime = globalTime - timeSinceLastMovement;
  for (var botNum in movements) {
    let bot = bots[botNum];
    let movement = movements[botNum];

    let angle = movement.direction;
    let speed = movement.speed;

    let deltaX = Math.cos(angle) * speed * deltaTime;
    let deltaY = Math.sin(angle) * speed * deltaTime;

    bot.coord.x += deltaX;
    if (bot.coord.x < 0) {
      bot.coord.x = 0;
      movements[botNum] = null;
    }
    else if (bot.coord.x > xMax) {
      bot.coord.x = xMax;
      movements[botNum] = null;
    }
    bot.coord.y += deltaY;
    if (bot.coord.y < 0) {
      bot.coord.y = 0;
      movements[botNum] = null;
    }
    else if (bot.coord.y > yMay) {
      bot.coord.y = yMax;
      movements[botNum] = null;
    }

    // make sure its in the right quad
    let newQuad = getQuadFromCoord(bot.coord);
    let oldQuad = bot.quadNum;
    if (!sameQuads(bot.quad, oldQuad)) {
      bot.quad = newQuad;

      // remove bot from old quad
      quads[oldQuad.x][oldQuad.y].filter( n => n != botNum );

      // put bot in new quad
      quads[oldQuad.x][oldQuad.y].push(botNum);
    }
  }
}

let getNeighborQuads = (quad) => {
  let neighbors = [];
  neighbors.push(quads[quad.x][quad.y]);

  if (quad.x > 0) {
    neighbors.push(quads[quad.x-1][quad.y]);

    if (quad.y > 0) {
      neighbors.push(quads[quad.x-1][quad.y-1]);
    }
    if (quad.y < quadsTall - 1) {
      neighbors.push(quads[quad.x-1][quad.y+1]);
    }
  }

  if (quad.x < quadsWide - 1) {
    neighbors.push(quads[quad.x+1][quad.y]);

    if (quad.y > 0) {
      neighbors.push(quads[quad.x+1][quad.y-1]);
    }
    if (quad.y < quadsTall - 1) {
      neighbors.push(quads[quad.x+1][quad.y+1]);
    }
  }

  if (quad.y > 0) {
    neighbors.push(quads[quad.x][quad.y-1]);
  }

  if (quad.y < quadsTall - 1) {
    neighbors.push(quads[quad.x][quad.y+1]);
  }

  return neighbors;
}

let distance = (a,b) => {
  return Math.sqrt( Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

let bots = [];
let controllers = [];
for (let i = 0; i < numberBots; i++) {
  let botNum = i;
  let receivedEvent = `r${i}`;
  let coord = getRandomCoord();
  let quad = getQuadFromCoord(coord);

  let bot = {
    botNum,
    coord,
    quad
  };
  bots.push(bot);
  quads[quad.x][quad.y].push(botNum);

  const _quad = () => bots[botNum].quad;
  const _coord = () => bots[botNum].coord;

  let controller = {
    onReceive: (callback) => {
      eventEmitter.on(receivedEvent, callback);
    },
    move: (speed, direction) => {
      movements[i] = {speed, direction};
    },
    send: (data) => {
      globalTime = process.hrtime.bigint();
      makeMovements();
      let quads = getNeighborQuads(_quad());

      for (var i in quads) {
        let quad = quads[i];
        for (var otherBotNum in quad) {
          let otherBot = bots[otherBotNum];
          let d = distance(_coord(), otherBot.coord);
          if (distance(_coord(), otherBot.coord) <= messageRadius) {
            let signalStength = d/messageRadius;
            eventEmitter.emit(`r${otherBotNum}`, data, signalStength);
          }
        }
      }
    }
  }

  BotBrain(controller);
}

module.exports = {
  xMax,
  yMax,
  messageRadius,
  bots,
}
