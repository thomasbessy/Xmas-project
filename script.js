
// --- Variables principales ---
const FINAL_PHONE = "+33 6 12 34 56 78"; // <-- personnalise ici
const CORRECT = { p1: "JEAN CHRISTOPHE", p2: "", p3: "9" };
let solved = { p1: false, p2: false, p3: false };
let hintsLeft = 3;


// --- Gestion des clics ---
document.addEventListener('click', e => {
  const a = e.target.closest('[data-action]');
  if (!a) return;
  const action = a.dataset.action;
  const target = a.dataset.target;
  if (action === 'start') start();
  if (action === 'show') showSection(target);
  if (action === 'submit') submit(target);
  if (action === 'hint') giveHint(target);
  if (action === 'shuffle') shuffleSlider();
});

// --- Fonctions principales ---

function start() {
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('puzzle-area').classList.remove('hidden');
  showSection('p1');
  setup_slider(); 
}

function showSection(id) {
  document.querySelectorAll('.puzzle, #final').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
  if (id === 'final') updateFinal();
}

function submit(target) {
  if (target === 'p1') {
    const val = (document.getElementById('p1-answer').value || '').trim().toUpperCase();
    const fb = document.getElementById('p1-feedback');
    if (val === CORRECT.p1) {
      fb.textContent = 'Correct — code enregistré.';
      solved.p1 = true;
      fb.style.color = '#114b3b';
    } else {
      fb.textContent = 'Ce n\'est pas ça. Réessaie.';
      fb.style.color = '#8b1010';
    }
  }
  if (target === 'p2') {
    // La validation se fait automatiquement quand le puzzle est résolu
    const fb = document.getElementById('p2-feedback');
    if (solved.p2) {
      fb.textContent = 'Image reconstituée ! Bravo.';
      fb.style.color = '#114b3b';
    } else {
      fb.textContent = 'Le puzzle n\'est pas encore résolu.';
      fb.style.color = '#8b1010';
    }
  }
  if (target === 'p3') {
    const val = (document.getElementById('p3-answer').value || '').trim().toUpperCase();
    const fb = document.getElementById('p3-feedback');
    if (val === CORRECT.p3) {
      fb.textContent = 'Exact — tu sembles être la bonne personne.';
      solved.p3 = true;
      fb.style.color = '#114b3b';
    } else {
      fb.textContent = 'Mauvaise réponse.';
      fb.style.color = '#8b1010';
    }
  }
  updateFinal();
}

function giveHint(target) {
  if (hintsLeft <= 0) { alert('Plus d\'indices disponibles.'); return; }
  hintsLeft--; document.getElementById('hints-left').textContent = hintsLeft;
  if (target === 'p1') alert('Indice p1 : "Vers la gauche pas la droite banane"');
  if (target === 'p2') alert('Indice p2 : "Commence par la ligne du haut !"');
  if (target === 'p3') alert('Indice p3 : "Toute famille vient par deux"');
}

function updateFinal() {
  const all = solved.p1 && solved.p2 && solved.p3;
  const ft = document.getElementById('final-text');
  const fc = document.getElementById('final-content');
  const list = document.getElementById('codes-list');
  list.innerHTML = '';
  if (solved.p1) list.innerHTML += '<li>A47</li>';
  if (solved.p2) list.innerHTML += '<li>B12</li>';
  if (solved.p3) list.innerHTML += '<li>C9</li>';
  if (all) {
    ft.textContent = 'Bravo — tu as résolu les trois énigmes.';
    fc.classList.remove('hidden');
    document.getElementById('phone-number').textContent = FINAL_PHONE;
  } else {
    ft.textContent = 'Tu dois d\'abord résoudre les 3 énigmes.';
    fc.classList.add('hidden');
  }
}

// --- Taquin ---

const TILE_SIZE = 320 / 3;
const IMAGE_PATH = "https://raw.githubusercontent.com/thomasbessy/Xmas-project/main/image.jpg";
let slide_state_solved = [0,1,2,3,4,5,6,7,8];
let slide_state = [];

// --- Initialisation du puzzle au démarrage ---
function setup_slider() {
  const slider = document.getElementById('slider');
  slider.innerHTML = '';
  // Création des tuiles en état résolu
  for (let i = 0; i < 9; i++) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.dataset.index = i;
    div.addEventListener('click', function() {
      slide_tile(i); // i = position dans la grille
    });
    slider.appendChild(div);
  }
  // Mélange légal pour obtenir slide_state
  slide_state = slide_state_solved.slice();
  for (let k = 0; k < 200; k++) {
    const emptyIndex = slide_state.indexOf(8);
    const moves = possible_moves(emptyIndex);
    const pick = moves[Math.floor(Math.random() * moves.length)];
    [slide_state[emptyIndex], slide_state[pick]] = [slide_state[pick], slide_state[emptyIndex]];
  }
  console.log(slide_state);
  render_slider(slide_state);
}

// --- Affichage du puzzle selon l'ordre donné ---
function render_slider(state) {
  const slider = document.getElementById('slider');
  const tiles = slider.querySelectorAll('.tile');
  for (let i = 0; i < 9; i++) {
    const tileID = state[i]; // identité de la tuile à la position i
    const tile = tiles[i];
    if (tileID === 8) {
      tile.style.background = "#222";
      tile.style.backgroundImage = "";
    } else {
      const row = Math.floor(tileID / 3), col = tileID % 3;
      tile.style.background = "";
      tile.style.backgroundImage = `url('${IMAGE_PATH}')`;
      tile.style.backgroundSize = "320px 320px";
      tile.style.backgroundPosition = `-${col * TILE_SIZE}px -${row * TILE_SIZE}px`;
    }
  }
}

// --- Calcul des mouvements légaux ---
function possible_moves(emptyIndex) {
  const moves = [];
  const r = Math.floor(emptyIndex / 3), c = emptyIndex % 3;
  const neighbors = [
    [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
  ];
  neighbors.forEach(n => {
    if (n[0] >= 0 && n[0] < 3 && n[1] >= 0 && n[1] < 3) {
      moves.push(n[0] * 3 + n[1]);
    }
  });
  return moves;
}

// --- Déplacement d'une tuile lors d'un clic ---
function slide_tile(clickedPos) {
  
  console.log("Tuile cliquée : pos ", clickedPos);
  const emptyIndex = slide_state.indexOf(8);
  const rClicked = Math.floor(clickedPos / 3), cClicked = clickedPos % 3;
  const rEmpty = Math.floor(emptyIndex / 3), cEmpty = emptyIndex % 3;
  const dist = Math.abs(rClicked - rEmpty) + Math.abs(cClicked - cEmpty);

  if (dist === 1) {
    [slide_state[clickedPos], slide_state[emptyIndex]] = [slide_state[emptyIndex], slide_state[clickedPos]];
    render_slider(slide_state);
    // Vérification de la résolution
    if (isPuzzleSolved(slide_state)) {
      document.getElementById('p2-feedback').textContent = 'Image reconstituée ! Bravo.';
      solved.p2 = true;
      updateFinal();
    }
  }
}
function isPuzzleSolved(state) {
  for (let i = 0; i < 8; i++) {
    if (state[i] !== i) return false;
  }
  return true;
}
// --- Appelle setup_slider au démarrage du jeu ---
document.addEventListener('DOMContentLoaded', setup_slider);

