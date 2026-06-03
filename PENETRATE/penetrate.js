//CONST
const W        = 800;
const H        = 800;
const CENTER_X = W / 2;
const CENTER_Y = H / 2;

const COLUMN   = [67, 200, 333, 467, 600, 733];
const SWITCH_Y = 685;
const SLIDER_Y = 755;

const TEXTES = [
  "Can't help, even in the moment, having a theory about what I'm doing. The curse of being stuck in your own racing thoughts. \n \n Here's the theory of that moment: I want the situation, the entire situation, to fuck me.",
];

const PHRASE3_MOTS = [
  { mot: "I",           element: null     },
  { mot: "want",        element: null     },
  { mot: "to",          element: null     },
  { mot: "be",          element: null     },
  { mot: "penetrated",  element: null     },
  { mot: "by",          element: null     },
  { mot: "light,",      element: "light"  },
  { mot: "fog,",        element: "fog"    },
  { mot: "the",         element: null     },
  { mot: "floor,",      element: "floor"  },
  { mot: "the",         element: null     },
  { mot: "walls,",      element: "walls"  },
  { mot: "the",         element: null     },
  { mot: "anonymous",   element: null     },
  { mot: "swaying",     element: null     },
  { mot: "bodies.",     element: "bodies" },
  { mot: "I",           element: null     },
  { mot: "want",        element: null     },
  { mot: "to",          element: null     },
  { mot: "be",          element: null     },
  { mot: "railed",      element: null     },
  { mot: "by",          element: null     },
  { mot: "pounding",    element: null     },
  { mot: "sound.",      element: "sound"  },
];

const PAUSE_MOT = 25;

//ELEMENTS
const ELEMENTS = [
  { id: "light",  actif: false, valeur: 0.5, x: COLUMN[0], switchY: SWITCH_Y, sliderY: SLIDER_Y },
  { id: "fog",    actif: false, valeur: 0.5, x: COLUMN[1], switchY: SWITCH_Y, sliderY: SLIDER_Y },
  { id: "floor",  actif: false, valeur: 0.5, x: COLUMN[2], switchY: SWITCH_Y, sliderY: SLIDER_Y },
  { id: "walls",  actif: false, valeur: 0.5, x: COLUMN[3], switchY: SWITCH_Y, sliderY: SLIDER_Y },
  { id: "bodies", actif: false, valeur: 0.5, x: COLUMN[4], switchY: SWITCH_Y, sliderY: SLIDER_Y },
  { id: "sound",  actif: false, valeur: 0.5, x: COLUMN[5], switchY: SWITCH_Y, sliderY: SLIDER_Y },
];

let elementsVisibles = [];

//VARIABLES D'ÉTAT
let etat              = "intro";
let charIndex         = 0;
let textComplete      = false;
let completedFrame    = -1;
let dernierChangement = 0;

let motIndex       = 0;
let motArriveFrame = -1;

//ASSETS
let titleFont;
let imgOn, imgOff, imgRail, imgBouton;
let imgLight, imgFloor, imgWalls, imgCrowd1, imgCrowd2;
let son;
const BPM_ORIGINAL = 111;

//PRELOAD
function preload() {
  titleFont = loadFont('../terminal-grotesque-webfont.ttf');
  imgOn     = loadImage('assets/interrupteur_on.png');
  imgOff    = loadImage('assets/interrupteur_off.png');
  imgRail   = loadImage('assets/slider.png');
  imgBouton = loadImage('assets/bouton_slider.png');
  imgLight  = loadImage('assets/lights.png');
  imgFloor  = loadImage('assets/floor.png');
  imgWalls  = loadImage('assets/walls.png');
  imgCrowd1 = loadImage('assets/crowd1.png');
  imgCrowd2 = loadImage('assets/crowd2.png');
  son       = loadSound('assets/Homme_a_la_Mode.mp3');
}

//SETUP
function setup() {
  let cnv = createCanvas(W, H);
  cnv.parent('sketch-container');
  cnv.elt.style.width  = '';
  cnv.elt.style.height = '';
  textFont(titleFont);
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  noStroke();
}

//DRAW
function draw() {
  background(0);

  drawScene();

  switch (etat) {
    case "intro":   animTexte(0);  break;
    case "phrase3": animPhrase3(); break;
    case "finale":                 break;
  }

  for (let el of elementsVisibles) {
    drawInterrupteur(el);
    drawSlider(el);
  }
}

//SCÈNE
function drawScene() {
  let elWalls  = elementsVisibles.find(e => e.id === "walls");
  let elFloor  = elementsVisibles.find(e => e.id === "floor");
  let elLight  = elementsVisibles.find(e => e.id === "light");
  let elBodies = elementsVisibles.find(e => e.id === "bodies");
  let elFog    = elementsVisibles.find(e => e.id === "fog");
  let elSound  = elementsVisibles.find(e => e.id === "sound");

  if (elWalls)  drawWalls(elWalls);
  if (elFloor)  drawFloor(elFloor);
  if (elLight)  drawLight(elLight);
  if (elBodies) drawCrowd(elBodies);
  if (elFog)    drawFog(elFog);
  if (elSound)  drawSound(elSound);
}

//LIGHTS
function drawLight(el) {
  if (!el.actif) return;
  let periode = floor(map(el.valeur, 0, 1, 60, 2));
  if (frameCount % periode < periode / 2) image(imgLight, 120, 0);
}

//FOG
function drawFog(el) {
  if (!el.actif || el.valeur === 0) return;
  blendMode(ADD);
  const smoothness = 0.005;
  const unit = 5;
  let count = el.valeur * 255;
  noStroke();
  for (let y = 0; y < H; y += unit) {
    for (let x = 0; x < W; x += unit) {
      let c = noise(x * smoothness, y * smoothness) * count;
      fill(c, c, c);
      rect(x, y, unit, unit);
    }
  }
  blendMode(BLEND);
}

//FLOOR
function drawFloor(el) {
  if (!el.actif) return;
  let fx = (W - 709) / 2;
  let fy = 441;
  if (el.valeur === 0) { image(imgFloor, fx, fy); return; }
  let vitesse   = map(el.valeur, 0, 1, 0.005, 0.12);
  let amplitude = map(el.valeur, 0, 1, 2, 14);
  let ox = sin(frameCount * vitesse) * amplitude;
  let oy = cos(frameCount * vitesse * 0.7) * amplitude;
  image(imgFloor, fx + ox, fy + oy);
}

//WALLS
function drawWalls(el) {
  if (!el.actif) return;
  if (el.valeur === 0) { image(imgWalls, 0, 0); return; }
  let vitesse   = map(el.valeur, 0, 1, 0.005, 0.12);
  let amplitude = map(el.valeur, 0, 1, 2, 10);
  let ox = sin(frameCount * vitesse) * amplitude;
  let oy = cos(frameCount * vitesse * 0.8) * amplitude;
  image(imgWalls, ox, oy);
}

//CROWD
function drawCrowd(el) {
  if (!el.actif) return;
  let cx = (W - 760) / 2;
  let cy = 193;
  if (el.valeur === 0) { image(imgCrowd1, cx, cy); return; }
  let periode = floor(map(el.valeur, 0, 1, 120, 4));
  if (floor(frameCount / periode) % 2 === 0) {
    image(imgCrowd1, cx, cy);
  } else {
    image(imgCrowd2, (W - 704) / 2, cy);
  }
}

//SON
function drawSound(el) {
  if (!son) return;
  if (!el.actif) { if (son.isPlaying()) son.stop(); return; }
  let bpm = map(el.valeur, 0, 1, 60, 180);
  son.rate(bpm / BPM_ORIGINAL);
  if (!son.isPlaying()) son.loop();
}

//TEXTE
function animTexte(idx) {
  const txt = TEXTES[idx];
  if (!textComplete && frameCount % 2 === 0) {
    charIndex = min(charIndex + 1, txt.length);
    if (charIndex >= txt.length) {
      textComplete   = true;
      completedFrame = frameCount;
    }
  }
  fill(255);
  noStroke();
  textSize(30);
  textLeading(30);
  let boxW = W * 0.6;
  let boxH = H * 0.4;
  text(txt.substring(0, charIndex), CENTER_X - boxW / 2, CENTER_Y - boxH / 2, boxW, boxH);
}

//PHRASE3
function animPhrase3() {
  if (motIndex >= PHRASE3_MOTS.length) {
    changerEtat("finale");
    return;
  }

  let mot = PHRASE3_MOTS[motIndex];

  if (motArriveFrame === -1) {
    motArriveFrame = frameCount;
    if (mot.element) {
      let el = ELEMENTS.find(e => e.id === mot.element);
      if (el && !elementsVisibles.includes(el)) elementsVisibles.push(el);
    }
  }

  if (mot.element) {
    let el = ELEMENTS.find(e => e.id === mot.element);
    if (el && el.actif) avancerMot();
  } else {
    if (frameCount - motArriveFrame >= PAUSE_MOT) avancerMot();
  }

  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text(mot.mot, CENTER_X, 150);
}

function avancerMot() {
  motIndex++;
  motArriveFrame = -1;
}

//UI
function drawInterrupteur(el) {
  if (el.actif) {
    image(imgOn,  el.x - 17, el.switchY - 12);
  } else {
    image(imgOff, el.x - 18, el.switchY - 22);
  }
}

function drawSlider(el) {
  image(imgRail, el.x - 46, el.sliderY - 6);
  let bx = map(el.valeur, 0, 1, el.x - 34, el.x + 34);
  image(imgBouton, bx - 12, el.sliderY - 12);
}

function surInterrupteur(el) {
  return mouseX > el.x - 17 && mouseX < el.x + 18 &&
         mouseY > el.switchY - 22 && mouseY < el.switchY + 22;
}

function surSlider(el) {
  return mouseX > el.x - 46 && mouseX < el.x + 46 &&
         mouseY > el.sliderY - 12 && mouseY < el.sliderY + 12;
}

//INTERACTION
function mousePressed() {
  if (frameCount - dernierChangement < 10) return;

  if (etat === "intro") {
    if (!textComplete) {
      charIndex      = TEXTES[0].length;
      textComplete   = true;
      completedFrame = frameCount;
    } else {
      changerEtat("phrase3");
    }
    return;
  }

  for (let el of elementsVisibles) {
    if (surInterrupteur(el)) el.actif = !el.actif;
  }
}

function mouseDragged() {
  for (let el of elementsVisibles) {
    if (surSlider(el)) {
      el.valeur = constrain(map(mouseX, el.x - 34, el.x + 34, 0, 1), 0, 1);
    }
  }
}

//ÉTATS
function changerEtat(nouvel) {
  etat              = nouvel;
  charIndex         = 0;
  textComplete      = false;
  completedFrame    = -1;
  dernierChangement = frameCount;

  if (nouvel === "finale") {
    document.getElementById('btn-restart').style.display = 'block';
  }

  if (nouvel === 'intro') {
    motIndex         = 0;
    motArriveFrame   = -1;
    elementsVisibles = [];
    for (let el of ELEMENTS) {
      el.actif  = false;
      el.valeur = 0.5;
    }
    if (son && son.isPlaying()) son.stop();
    document.getElementById('btn-restart').style.display = 'none';
  }
}