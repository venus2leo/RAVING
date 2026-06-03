//CONST
const W = 800;
const H = 600;

const TEXTES = [
  "It's better than the world outside. Rewind back to that first night, the night of my reentry into rave culture after a twenty year absence, Q and Z and I stand on a Brooklyn street, waiting for a car service to come pick us up and take us to it...",
  "Z tracks the car on her phone as it approaches. We watch it arrive. The driver slows, clocks the three transsexuals waiting for him—and speeds away. \n One star.",
  "Such insults are unpleasant but minor compared to what many other queer or trans people, particularly if they aren't white, endure every day, everywhere. But I want to write not about trans pain but glory."
];

const CAR_W = 130;
const CAR_H = 55;
const CAR_Y = H * 0.6;
const CENTER_X = W / 2;

//VAR
let etat = "telephone1";
let charIndex = 0;
let textComplete = false;
let completedFrame = -1;

let voitureX;
let voitureSpeed;
let voiturePhase;
let imgVoiture;
let imgTelephoneNow;
let imgTelephoneAgain;

//PRELOAD
function preload() {
  font = loadFont('../terminal-grotesque-webfont.ttf');
  imgVoiture      = loadImage('assets/voiture.png');
  imgTelephoneNow = loadImage('assets/telephone.png');
  imgTelephoneAgain = loadImage('assets/telephoneagain.png');
}

//SETUP
function setup() {
  let cnv = createCanvas(W, H);
  cnv.parent('sketch-container');
  cnv.elt.style.width  = '';
  cnv.elt.style.height = '';
  textFont(font);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
}

//DRAW
function draw() {
  background(0);

  switch (etat) {
    case "telephone1": dessinerTelephone1(); break;
    case "attente1":   animerTexte(0, "voiture1"); break;
    case "voiture1":   animerVoiture(false, "telephone2"); break;

    case "telephone2": dessinerTelephone2(); break;
    case "attente2":   animerTexte(1, "voiture2"); break;
    case "voiture2":   animerVoiture(false, "telephone3"); break;

    case "telephone3": dessinerTelephone2(); break;
    case "attente3":   animerTexte(2, "voiture3"); break;
    case "voiture3":   animerVoiture (true); break;
  }
}

//SCENE
function dessinerTelephone1() {
  imageMode(CENTER);
  image(imgTelephoneNow, W / 2, H / 2, 800, 600);
}

function dessinerTelephone2() {
  imageMode(CENTER);
  image(imgTelephoneAgain, W / 2, H / 2, 800, 600);
}

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
  textAlign(CENTER, CENTER);
  textSize(30);
  textLeading(30);
  text(txt.substring(0, charIndex), W / 2, H / 2, W * 0.8, H * 0.6);
}

function initVoiture() {
  voitureX     = -CAR_W;
  voitureSpeed = 2;
  voiturePhase = "arriving";
}

function animerVoiture(arrete, prochainEtat) {
  if (voiturePhase === "arriving") {
    const dist = CENTER_X - voitureX;
    if (dist > 180) {
      voitureSpeed = min(voitureSpeed + 5, 9);
    } else {
      voitureSpeed = max(voitureSpeed - (arrete ? 0.3 : 0.7), arrete ? 0 : 1);
    }
    voitureX += voitureSpeed;
    if (arrete && voitureX >= CENTER_X) {
      voitureX     = CENTER_X;
      voitureSpeed = 0;
      voiturePhase = "stopped";
    } else if (!arrete && voitureX >= CENTER_X + 30) {
      voiturePhase = "leaving";
    }
  } else if (voiturePhase === "leaving") {
    voitureSpeed = min(voitureSpeed + 5, 14);
    voitureX += voitureSpeed;
    if (voitureX > W + CAR_W) {
      changerEtat(prochainEtat);
    }
  }
  dessinerVoiture(voitureX, CAR_Y);
}

function dessinerVoiture(x, y) {
  imageMode(CENTER);
  let s = 0.4;
  image(imgVoiture, x, y, imgVoiture.width * s, imgVoiture.height * s);
}

//ETAT
function changerEtat(nouvel) {
  etat          = nouvel;
  charIndex     = 0;
  textComplete  = false;
  completedFrame = -1;

  if (nouvel.startsWith("voiture")) initVoiture();

  if (nouvel === "voiture3") {
    document.getElementById('btn-next').style.display    = 'block';
    document.getElementById('btn-restart').style.display = 'block';
  }

  if (nouvel === "telephone1") {
    document.getElementById('btn-next').style.display    = 'none';
    document.getElementById('btn-restart').style.display = 'none';
  }
}

//INTERACTION
function mousePressed() {
  if (etat.startsWith("attente")) {
    const idx = parseInt(etat.slice(-1)) - 1;
    if (!textComplete) {
      charIndex    = TEXTES[idx].length;
      textComplete = true;
    } else {
      if (etat === "attente1") changerEtat("voiture1");
      else if (etat === "attente2") changerEtat("voiture2");
      else if (etat === "attente3") changerEtat("voiture3");
    }
    return;
  }

  if (etat.startsWith("telephone")) {
    const bx = W / 2;
    const by = H / 2 + 130;
    if (
      mouseX > bx - 75 && mouseX < bx + 75 &&
      mouseY > by - 19 && mouseY < by + 19
    ) {
      if (etat === "telephone1") changerEtat("attente1");
      if (etat === "telephone2") changerEtat("attente2");
      if (etat === "telephone3") changerEtat("attente3");
    }
  }
}