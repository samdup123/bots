const EventEmitter = require('events');
let eventEmitter = new EventEmitter();

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

let numberQuads =  Math.floor( (xMax * yMax) / (messageRadius*messageRadius) );

let getQuadIndexFromCoord = (coord) => {

  let verticalBoxNum = Math.floor(coord.y/messageRadius) + 1;

  let numQuadsInBoxAboveCoord = 0;
  if (verticalBoxNum > 1) {
    numQuadsInBoxAboveCoord += (verticalBoxNum-1) * quadsWide;
  }

  let horizontalBoxNum = Math.floor(coord.x/messageRadius) + 1;

  let quadNum = numQuadsInBoxAboveCoord + horizontalBoxNum;

  return (quadNum - 1)
}

for (let i = 0; i < numberQuads; i++) {
  quads.push({bots: []});
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
    let newQuadNum = getQuadIndexFromCoord(bot.coord);
    if (bot.quadNum !== newQuadNum) {
      let oldQuadNum = bot.quadNum;
      bot.quadNum = newQuadNum;

      // remove bot from old quad
      quads[oldQuadNum].bots.filter( n => n != botNum );

      // put bot in new quad
      quads[newQuadNum].bots.push(botNum);
    }
  }
}

let getNeighborQuadNums = (quadNum) => {
  let quadNums = [
    quadNum
  ];

  let verticalBoxNum = Math.floor(coord.y/messageRadius) + 1;
  let horizontalBoxNum = Math.floor(coord.x/messageRadius) + 1;

  if (horizontalBoxNum !== 1) {
    quadNums.push(quadNum - 1);
  }
  if (horizontalBoxNum !== quadsWide) {
    quadNums.push(quadNum + 1);
  }

  if (verticalBoxNum !== 1) {
    quadNums.push(quadNum - quadsWide);
  }
  if (verticalBoxNum !== quadsTall) {
    quadNums.push(quadNum + quadsWide);
  }

  if (verticalBoxNum !== 1 && horizontalBoxNum !== 1) {
    quadNums.push(quadNum - quadsWide - 1);
  }
  if (verticalBoxNum !== 1 && horizontalBoxNum !== quadsWide) {
    quadNums.push(quadNum - quadsWide + 1);
  }

  if (verticalBoxNum !== quadsTall && horizontalBoxNum !== 1) {
    quadNums.push(quadNum + quadsWide - 1);
  }
  if (verticalBoxNum !== quadsTall && horizontalBoxNum !== quadsWide) {
    quadNums.push(quadNum + quadsWide + 1);
  }

  return quadNums;
}

let distance = (a,b) => {
  return Math.sqrt( Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

let bots = [];
for (let i = 0; i < numberBots; i++) {
  let botNum = i;
  let receivedEvent = `r${i}`;
  let coord = getRandomCoord();
  let quadNum = getQuadIndexFromCoord(coord);

  let bot = {
    botNum,
    coord,
    receivedEvent,
    quadNum,
    controller: {
      quadNum,
      coord,
      move: (speed, direction) => {
        movements[i] = {speed, direction};
      },
      send: (data) => {
        globalTime = process.hrtime.bigint();
        makeMovements();
        let quadNums = getNeighborQuadNums(this.quadNum);

        for (var quadNum in quadNums) {
          let quad = quads[quadNum];
          for (var otherBotNum in quad.bots) {
            let otherBot = bots[otherBotNum];
            let d = distance(this.coord, otherBot.coord);
            if (distance(this.coord, otherBot.coord) <= messageRadius) {
              let signalStength = d/messageRadius;
              eventEmitter.emit(`r${otherBotNum}`, data, signalStength);
            }
          }
        }

      },
      receivedEvent
    }
  }

  bots.push(bot);

  quads[getQuadIndexFromCoord(coord)].bots.push(botNum);
}
