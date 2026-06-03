//CONST
const W = 800;
const H = 600;

const TEXTES = [
  "Dancing up close to DJ Goth Jafar. This girl next to me—let's call her F. I don't know what we are. Friends with benefits, maybe?",
  "Next to her is what my rave friend B calls a punisher, although not the worst kind. He is someone who is going to make it hard to get your rave on, one way or another.",
  "He stands stock still in front of the DJ, checking his phone. Then he lifts up his beer can and sprays the contents on those around him."
];

//VAR
let etat = "texte1";
let charIndex = 0;
let textComplete = false;

let beat, filter;
let cutoff = 0;
let posX = 0;
let posX_vel = 0;
let targetX = 0;
let friction = 0.6;
let stiffness = 0.1;

let imgMec, imgChien, imgLight;
let titleFont;

//PRELOAD
function preload() {
  titleFont = loadFont('../terminal-grotesque-webfont.ttf');
  beat      = loadSound('assets/diskoteka.wav');
  imgMec    = loadImage('assets/mec.png');
  imgChien  = loadImage('assets/chien.png');
  imgLight  = loadImage('assets/lights.png');
}

//SETUP
function setup() {
  let cnv = createCanvas(W, H);
  cnv.parent('sketch-container');
  cnv.elt.style.width  = '';
  cnv.elt.style.height = '';

  textFont(titleFont);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  imageMode(CENTER);

  filter = new p5.HighPass();
  beat.disconnect();
  beat.connect(filter);
  beat.setVolume(2);
}

//DRAW
function draw() {
  background(0);

  switch (etat) {
    case "texte1": animerTexte(0, "texte2"); break;
    case "texte2": animerTexte(1, "texte3"); break;
    case "texte3": animerTexte(2, "scene");  break;
    case "scene":  dessinerScene();          break;
  }
}

//TXT
function animerTexte(idx, prochainEtat) {
  const txt = TEXTES[idx];

  if (!textComplete && frameCount % 2 === 0) {
    charIndex = min(charIndex + 1, txt.length);
    if (charIndex >= txt.length) {
      textComplete = true;
    }
  }

  fill(255);
  noStroke();
  textSize(30);
  textLeading(30);
  text(txt.substring(0, charIndex), W / 2, H / 2, W * 0.8, H * 0.6);
}

//SCENE
function dessinerScene() {

  const periode = 8;
  if (frameCount % periode < periode / 2) {
    image(imgLight, width / 2, height / 3);
  }


  image(imgChien, width / 2, height / 2, 200, 150);


  let imgWidth  = 400;
  let imgHeight = imgWidth * (imgMec.height / imgMec.width);
  image(imgMec, posX, 550 - imgHeight / 2, imgWidth * 1.5, imgHeight * 1.5);


  targetX = mouseIsPressed ? mouseX : width / 2;
  let force = (targetX - posX) * stiffness;
  posX_vel += force;
  posX_vel *= friction;
  posX += posX_vel;


  let val = map(posX, 0, width, -1, 1);
  cutoff = 3000 - (abs(val) * 10000);
  filter.freq(cutoff);
}

//ETAT
function changerEtat(nouvel) {
  etat = nouvel;
  charIndex = 0;
  textComplete = false;

  if (nouvel === "scene" && !beat.isPlaying()) {
    beat.loop();
     document.getElementById('btn-next').style.display    = 'block';
    document.getElementById('btn-restart').style.display = 'block';
  }
}

  if (nouvel === "texte1") {
    document.getElementById('btn-next').style.display    = 'none';
    document.getElementById('btn-restart').style.display = 'none';
  }


//INTERACTION
function mousePressed() {
  if (etat.startsWith("texte")) {
    const idx = parseInt(etat.slice(-1)) - 1;
    if (!textComplete) {
      charIndex = TEXTES[idx].length;
      textComplete = true;
    } else {
      if (etat === "texte1") changerEtat("texte2");
      else if (etat === "texte2") changerEtat("texte3");
      else if (etat === "texte3") changerEtat("scene");
    }
  }
}