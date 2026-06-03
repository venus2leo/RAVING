//CONST
const W = 800;
const H = 600;

const TEXTES = [
  "Murmuration of thought, flocking and flying, whistling by as this body splashes into the squelching acid sonic goo that Volvox resurrects from the deck.",
  "The acid Nick was talking about:",
  "\"Acid sound is analog. You twist the knob like you twist a nipple. The sounds all come out of fucking with machines.\"",
  "\"You use the sounds of capitalism to destroy the economy of taste.\""
];

//VAR
let etat = "texte1";
let charIndex = 0;
let textComplete = false;

let filter, synth, seq, kick, kickSeq;
let audioStarted = false;

let imgKnob, imgNipple, titleFont;

//PRELOAD
function preload() {
  titleFont = loadFont('../terminal-grotesque-webfont.ttf');
  imgKnob   = loadImage('assets/KNOB.png');
  imgNipple = loadImage('assets/NIPPLE.png');
}

//SETUP
function setup() {
  let cnv = createCanvas(W, H);
  cnv.parent('sketch-container');
  imageMode(CENTER);
  textFont(titleFont);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
}

//SYNTH
function initAudio() {
  filter = new Tone.Filter({ type: 'lowpass', frequency: 300, Q: 8 }).toDestination();

  synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.25, release: 1 }
  }).connect(filter);

  const pattern = ['A2','A3','F#1',null,'C2','A2','A3',null,'G2','A2',null,'A2','A#2','C2','F#1','G1','A2','A3','F#1',null,'C2','A2','A3',null,'G2','A2','C1',null,'A#2','C2','F#2','G2'];
  seq = new Tone.Sequence((time, note) => {
    if (note) synth.triggerAttackRelease(note, '16n', time);
  }, pattern, '16n');

  kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 6,
    envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 1 }
  }).toDestination();

  kickSeq = new Tone.Sequence((time, note) => {
    if (note) kick.triggerAttackRelease(note, '8n', time);
  }, [null, null, 'C2', null, null, null, 'C2', null], '16n');

  Tone.Transport.bpm.value = 150;
}

//DRAW
function draw() {
  background(0);

  switch (etat) {
    case "texte1": animerTexte(0, "texte2"); break;
    case "texte2": animerTexte(1, "texte3"); break;
    case "texte3": animerTexte(2, "texte4"); break;
    case "texte4": animerTexte(3, "synth");  break;
    case "synth":  dessinerSynth();          break;
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

//SYNTH
function dessinerSynth() {
  const x = W / 2;
  const y = H / 2;
  const angle = atan2(mouseY - y, mouseX - x);
  const normalized = map(angle, -PI, PI, 0, 1);

  if (filter) {
    filter.frequency.value = 150 + pow(normalized, 1.5) * 6000;
    filter.Q.value = 1 + normalized * 28;
  }

  push();
  translate(x, y);
  image(imgNipple, 0, 0, imgNipple.width / 3, imgNipple.height / 3);
  pop();

  push();
  translate(x, y);
  rotate(angle);
  image(imgKnob, 0, 0, imgKnob.width / 3, imgKnob.height / 3);
  pop();

  if (!audioStarted) {
    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(22);
    text('click to start', W / 2, H - 55);
  }
}

//ETATS
function changerEtat(nouvel) {
  etat = nouvel;
  charIndex = 0;
  textComplete = false;

  if (nouvel === "synth") {
    document.getElementById('btn-next').style.display    = 'block';
    document.getElementById('btn-restart').style.display = 'block';
  }

  if (nouvel === "texte1") {
    document.getElementById('btn-next').style.display    = 'none';
    document.getElementById('btn-restart').style.display = 'none';
  }
}

//INTERACTION
async function mousePressed() {
  if (etat.startsWith("texte")) {
    await Tone.start(); 
    const idx = parseInt(etat.slice(-1)) - 1;
    if (!textComplete) {
      charIndex = TEXTES[idx].length;
      textComplete = true;
    } else {
      if (etat === "texte1") changerEtat("texte2");
      else if (etat === "texte2") changerEtat("texte3");
      else if (etat === "texte3") changerEtat("texte4");
      else if (etat === "texte4") {
        initAudio();        
        changerEtat("synth");
      }
    }
    return;
  }

  if (etat === "synth") {
    audioStarted = true;
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      seq.stop();
      kickSeq.stop();
    } else {
      seq.start(0);
      kickSeq.start(0);
      Tone.Transport.start();
    }
  }
}