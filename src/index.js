import * as PIXI from "pixi.js";

var app = new PIXI.Application(640, 360);
document.body.appendChild(app.view);
var circle = new PIXI.Graphics();
circle.beginFill(0x5cafe2);
circle.drawCircle(0, 0, 80);
circle.x = 320;
circle.y = 180;
app.stage.addChild(circle);

app.ticker.add(dt => {
  circle.x += 1;
});
