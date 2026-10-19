let titleFont;
let textes = [
  { contenu: "RAVING",   taille: 200 },
  { contenu: "an interactive experience by Léo Rossmann",  taille: 40 },
  { contenu: "inspired by McKenzie Wark's 2023 essay", taille: 40 }
];
let index = 0;
let beat;


function preload() {
  titleFont = loadFont('../terminal-grotesque-webfont.ttf'); 
  beat = loadSound('assets/spingirl.mp3');
}

  function setup() {
  let cnv = createCanvas(800, 600);
  cnv.parent('sketch-container');
  cnv.elt.style.width  = '';
  cnv.elt.style.height = '';
  beat.setVolume(2);        
  }

function mousePressed() {
  userStartAudio();
  if (!beat.isPlaying()) {
    beat.loop();
  }


function draw() {
  background('black');
  fill('white');
  rectMode(CENTER)
  textFont(titleFont);
  textAlign(CENTER,CENTER);
  textSize(textes[index].taille);  

  if (frameCount % 30 < 15) {
    text(textes[index].contenu, width/2, height/2);
  }
}

function mousePressed() {
  index = (index + 1) % textes.length;
  if (index === 0) {
    document.getElementById('btn-next').style.display = 'block';
  }
}
