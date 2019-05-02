const xMax = 52;
const yMax = 52;
const messageRadius = 4;
const quadsWide = Math.ceil(xMax / messageRadius);
const quadsTall = Math.ceil(yMax / messageRadius);
const numberBots = 400;


let bots = [];

let getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

let getRandomCoord = () => {
  let x = getRandomInt(xMax);
  let y = getRandomInt(yMax);
  return {x, y};
}

for (let i = 0; i < numberBots; i++) {
  bots.push({coord: getRandomCoord()});
}

// bots.forEach( (bot, index) => console.log(index, bot));

let quads = [];

let numberQuads =  Math.floor( (xMax * yMax) / (messageRadius*messageRadius) );

let quadIndexFromCoord = (coord) => {

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

bots.forEach( (bot, index) => {
  quads[quadIndexFromCoord(bot.coord)].bots.push(index);
});

quads.forEach( (quad, index) => {
  quad.bots.forEach( (botNum) => {
  });
});
