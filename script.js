// --- Configuration principale ---
const CORRECT = { p1: "JEAN CHRISTOPHE", p2: true, p3: "9" };
let solved = { p1: false, p2: false, p3: false };
let hintsLeft = 3;

// --- Gestion des clics ---
document.addEventListener("click", (e) => {
  const a = e.target.closest('[data-action]');
  if (!a) return;

  const action = a.dataset.action;
  const target = a.dataset.target;

  switch (action) {
    case "start": start(); break;
    case "show": showSection(target); break;
    case "submit": submit(target); break;
    case "hint": giveHint(target); break;
    case "shuffle": shuffleSlider(); break;
    case "solve-puzzle": solvePuzzle(); break;
  }
});

// --- Navigation ---
function start() {
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("puzzle-area").classList.remove("hidden");
  showSection("p1");
  setupSlider();
}

function showSection(id) {
  document.querySelectorAll('.puzzle, #final').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
  if (id === "final") updateFinal();
}

// --- Soumission d'énigmes ---
function submit(target) {
  if (target === "p1") {
    const val = document.getElementById("p1-answer").value.trim().toUpperCase();
    const fb = document.getElementById("p1-feedback");
    if (val === CORRECT.p1) {
      fb.textContent = "Correct — code enregistré.";
      fb.style.color = "#114b3b";
      solved.p1 = true;
    } else {
      fb.textContent = "Ce n'est pas ça. Réessaie.";
      fb.style.color = "#8b1010";
    }
  }

  if (target === "p3") {
    const val = document.getElementById("p3-answer").value.trim().toUpperCase();
    const fb = document.getElementById("p3-feedback");
    if (val === CORRECT.p3) {
      fb.textContent = "Exact — tu sembles être la bonne personne.";
      fb.style.color = "#114b3b";
      solved.p3 = true;
    } else {
      fb.textContent = "Mauvaise réponse.";
      fb.style.color = "#8b1010";
    }
  }

  updateFinal();
}

// --- Indices ---
function giveHint(target) {
  if (hintsLeft <= 0) return alert("Plus d'indices disponibles.");
  hintsLeft--;
  document.getElementById("hints-left").textContent = hintsLeft;

  const hints = {
    p1: "Indice p1 : 'Vers la gauche pas la droite banane'",
    p2: "Indice p2 : 'Commence par la ligne du haut !'",
    p3: "Indice p3 : 'Toute famille vient par deux'"
  };

  alert(hints[target]);
  if (target === "p2") {
    const btn = document.getElementById("solve-button");
    if (btn) btn.style.display = "inline-block";
  }
}

// --- Final ---
function updateFinal() {
  const allSolved = solved.p1 && solved.p2 && solved.p3;
  const ft = document.getElementById("final-text");
  const fc = document.getElementById("final-content");

  if (allSolved) {
    ft.textContent = "Bravo — tu as résolu les trois énigmes.";
    fc.classList.remove("hidden");
  } else {
    ft.textContent = "Tu dois d'abord résoudre les 3 énigmes.";
    fc.classList.add("hidden");
  }
}

// --- Taquin ---
const TILE_SIZE = 320 / 3;
const IMAGE_PATH = "https://raw.githubusercontent.com/thomasbessy/Xmas-project/main/image.jpg";
let solvedState = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let slideState = [];

function setupSlider() {
  const slider = document.getElementById("slider");
  slider.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const div = document.createElement("div");
    div.className = "tile";
    div.dataset.index = i;
    div.onclick = () => slideTile(i);
    slider.appendChild(div);
  }

  shuffleSlider();
}

function shuffleSlider() {
  slideState = solvedState.slice();

  for (let k = 0; k < 200; k++) {
    const empty = slideState.indexOf(8);
    const moves = possibleMoves(empty);
    const pick = moves[Math.floor(Math.random() * moves.length)];
    [slideState[empty], slideState[pick]] = [slideState[pick], slideState[empty]];
  }

  renderSlider();
}

function renderSlider() {
  const tiles = document.querySelectorAll("#slider .tile");

  tiles.forEach((tile, i) => {
    const tileID = slideState[i];
    if (tileID === 8) {
      tile.style.background = "#222";
      tile.style.backgroundImage = "";
    } else {
      const r = Math.floor(tileID / 3);
      const c = tileID % 3;
      tile.style.backgroundImage = `url('${IMAGE_PATH}')`;
      tile.style.backgroundSize = "320px 320px";
      tile.style.backgroundPosition = `-${c * TILE_SIZE}px -${r * TILE_SIZE}px`;
    }
  });
}

function possibleMoves(empty) {
  const r = Math.floor(empty / 3), c = empty % 3;
  const neighbors = [ [r-1,c], [r+1,c], [r,c-1], [r,c+1] ];
  return neighbors.filter(([rr,cc]) => rr>=0 && rr<3 && cc>=0 && cc<3)
                  .map(([rr,cc]) => rr*3+cc);
}

// --- Déplacement d'une tuile ---
function slideTile(pos) {
  const empty = slideState.indexOf(8);
  const r1 = Math.floor(pos / 3), c1 = pos % 3;
  const r2 = Math.floor(empty / 3), c2 = empty % 3;
  if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;

  [slideState[pos], slideState[empty]] = [slideState[empty], slideState[pos]];
  renderSlider();

  if (isPuzzleSolved(slideState)) {
    solved.p2 = true;
    document.getElementById("p2-feedback").textContent = "Image reconstituée ! Bravo.";
    updateFinal();
  }
}

// --- Vérification puzzle résolu ---
function isPuzzleSolved(state) {
  for (let i = 0; i < 8; i++) {
    if (state[i] !== i) return false;
  }
  return true;
}

// --- Bouton : résoudre automatiquement ---
function solvePuzzle() {
  slideState = solvedState.slice();
  renderSlider();
  solved.p2 = true;
  document.getElementById("p2-feedback").textContent = "Résolu automatiquement.";
  updateFinal();
}
