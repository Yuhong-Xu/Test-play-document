// ===== Little Lighter Core Interaction =====
// p5.js + ml5.js (handpose + audio input)
// Style: metallic semi-realistic little lighter

let video, handpose, predictions = [];
let mic, attention = 0, lighter;
let lastTouchTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  rectMode(CORNER);

  // --- 摄像头输入 ---
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", gotHands);

  // --- 麦克风输入 ---
  mic = new p5.AudioIn();
  mic.start();

  // --- 初始化打火机 ---
  lighter = {
    x: width / 2,
    y: height * 0.6,
    state: "idle", // "idle", "happy", "hot"
    flameSize: 0,
  };
}

function modelReady() {
  console.log("🤖 Handpose model loaded.");
}

function gotHands(results) {
  predictions = results;
}

function draw() {
  background(10);
  image(video, 0, 0, width, height);
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // --- 声音输入 ---
  let level = mic.getLevel();
  if (level > 0.1) attention += 0.5;

  // --- 手势输入 ---
  if (predictions.length > 0) {
    let indexTip = predictions[0].landmarks[8];
    let d = dist(indexTip[0], indexTip[1], lighter.x, lighter.y);

    // “隔空摸摸头”动作
    if (d < 60) {
      attention += 0.2;
      lastTouchTime = millis();
    }
  }

  // --- 情绪过渡 ---
  attention = constrain(attention, 0, 20);

  if (attention < 6) lighter.state = "idle";
  else if (attention < 13) lighter.state = "happy";
  else lighter.state = "hot";

  drawLighter(lighter.state);

  drawSatisfactionBar();
}

// --- 绘制小打火机 ---
function drawLighter(state) {
  push();
  translate(lighter.x, lighter.y);

  // 打火机主体
  noStroke();
  if (state === "idle") fill(180);
  else if (state === "happy") fill(200, 180, 100);
  else fill(255, 80, 80);
  rectMode(CENTER);
  rect(0, 0, 100, 120, 15);

  // 金属反光效果
  for (let i = -40; i < 40; i += 10) {
    let alpha = map(i, -40, 40, 80, 0);
    stroke(255, 255, 255, alpha);
    line(i, -60, i, 60);
  }

  // 火焰
  noStroke();
  if (state === "idle") fill(255, 180, 80, 100);
  else if (state === "happy") fill(255, 200, 100, 180);
  else fill(255, 50, 50, 220);
  let flameH = state === "idle" ? 20 : state === "happy" ? 40 : 60;
  ellipse(0, -80 - flameH / 2, 25, flameH);

  pop();
}

// --- 满足进度条 ---
function drawSatisfactionBar() {
  let barWidth = map(attention, 0, 20, 0, width * 0.8);
  let barX = width * 0.1;
  let barY = 30;

  if (attention < 13) fill(255, 180, 60);
  else fill(255, 60, 60);

  noStroke();
  rect(barX, barY, barWidth, 12, 8);
  stroke(255, 80);
  noFill();
  rect(barX, barY, width * 0.8, 12, 8);
}
