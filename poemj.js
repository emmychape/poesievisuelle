// Sélection des éléments DOM
const svg = document.getElementById("svgCanvas");
const modeSelect = document.getElementById("modeSelect");
const shapeSelect = document.getElementById("shapeSelect");
const textInput = document.getElementById("textInput");
const textColor = document.getElementById("textColor");
const fontSize = document.getElementById("fontSize");
const letterSpacing = document.getElementById("letterSpacing");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const saveBtn = document.getElementById("saveBtn");

let currentPathElement = null;
let currentPoints = [];
let drawingTimeout = null;
let lastDrawTime = 0;

// Fonction pour capturer les paramètres actuels
function captureSettings() {
  return {
    text: textInput.value,
    color: textColor.value,
    size: parseFloat(fontSize.value),
    spacing: letterSpacing.value
  };
}

// Fonction pour dessiner le texte le long d'un chemin avec des variations
function drawTextOnPathWithVariation(d, settings) {
  const id = `path-${Date.now()}`;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("id", id);
  path.setAttribute("fill", "none");
  svg.appendChild(path);

  const baseText = (settings.text + " ").repeat(100).slice(0, 500);

  const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
  textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${id}`);
  textPath.setAttribute("startOffset", "0%");

  for (let i = 0; i < baseText.length; i += 2) {
    const span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    const scale = 0.8 + Math.random() * 0.6;
    span.setAttribute("font-size", (settings.size * scale).toFixed(1));
    span.textContent = baseText[i] + (baseText[i + 1] || '');
    textPath.appendChild(span);
  }

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("fill", settings.color);
  text.setAttribute("letter-spacing", settings.spacing);
  text.setAttribute("font-family", "ABC Diatype, sans-serif");
  text.appendChild(textPath);
  svg.appendChild(text);
}

// Fonction pour générer différentes formes
function generateShape(type) {
  const { width, height } = svg.getBoundingClientRect();
  const cx = Math.random() * width;
  const cy = Math.random() * height;

  switch (type) {
    case "serpent":
      let d = "";
      let x = cx - 150;
      let y = cy - 100;
      let direction = 1;
      for (let i = 0; i < 12; i++) {
        d += i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        x += 100 * direction;
        if (x > width - 100 || x < 100) {
          direction *= -1;
          y += 80;
        }
      }
      return d;
    case "spirale":
      let spiral = "";
      for (let i = 0, a = 0; i < 300; i++) {
        const r = 0.5 * i;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        spiral += i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        a += 0.15;
      }
      return spiral;
    case "cercle":
      return `M ${cx + 100} ${cy} A 100 100 0 1 1 ${cx - 100} ${cy} A 100 100 0 1 1 ${cx + 100} ${cy}`;
    case "rectangle":
      return `M ${cx - 100} ${cy - 50} H ${cx + 100} V ${cy + 50} H ${cx - 100} Z`;
    case "vague":
      return `M ${cx - 200} ${cy} Q ${cx - 150} ${cy - 40}, ${cx - 100} ${cy} T ${cx} ${cy} T ${cx + 100} ${cy} T ${cx + 200} ${cy}`;
    case "coeur":
      return `M ${cx} ${cy} C ${cx - 50} ${cy - 80}, ${cx - 150} ${cy - 10}, ${cx} ${cy + 100} C ${cx + 150} ${cy - 10}, ${cx + 50} ${cy - 80}, ${cx} ${cy}`;
    case "etoile":
      return `M ${cx} ${cy - 100} L ${cx + 30} ${cy - 30} L ${cx + 100} ${cy - 30} L ${cx + 50} ${cy + 20}
              L ${cx + 70} ${cy + 100} L ${cx} ${cy + 50} L ${cx - 70} ${cy + 100} L ${cx - 50} ${cy + 20}
              L ${cx - 100} ${cy - 30} L ${cx - 30} ${cy - 30} Z`;
    case "infini":
      return `M ${cx - 100} ${cy} C ${cx - 150} ${cy - 50}, ${cx - 50} ${cy - 50}, ${cx} ${cy}
              C ${cx + 50} ${cy + 50}, ${cx + 150} ${cy + 50}, ${cx + 100} ${cy}
              C ${cx + 50} ${cy - 50}, ${cx - 50} ${cy + 50}, ${cx - 100} ${cy}`;
    case "zigzag":
      return `M ${cx - 100} ${cy} L ${cx - 75} ${cy - 40} L ${cx - 50} ${cy} L ${cx - 25} ${cy - 40}
              L ${cx} ${cy} L ${cx + 25} ${cy - 40} L ${cx + 50} ${cy}`;
    default:
      return "";
  }
}

// Événement pour le mode "souris"
svg.addEventListener("mousemove", (e) => {
  if (modeSelect.value !== "souris") return;

  const now = Date.now();
  if (now - lastDrawTime < 30) return; // Réduit la fréquence
  lastDrawTime = now;

  const rect = svg.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentPoints.push({ x, y });

  if (!currentPathElement) {
    currentPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    currentPathElement.setAttribute("fill", "none");
    currentPathElement.setAttribute("stroke", "rgba(0,0,0,0.1)");
    svg.appendChild(currentPathElement);
  }

  const d = `M ${currentPoints.map(p => `${p.x},${p.y}`).join(" L ")}`;
  currentPathElement.setAttribute("d", d);

  clearTimeout(drawingTimeout);
  drawingTimeout = setTimeout(() => {
    const finalD = currentPathElement.getAttribute("d");
    currentPathElement.remove();
    drawTextOnPathWithVariation(finalD, captureSettings());
    currentPathElement = null;
    currentPoints = [];
  }, 300);
});

// Bouton "Générer"
generateBtn.onclick = () => {
  if (modeSelect.value !== "forme") return;
  const d = generateShape(shapeSelect.value);
  drawTextOnPathWithVariation(d, captureSettings());
};

// Bouton "Effacer"
clearBtn.onclick = () => {
  svg.innerHTML = '';
  currentPoints = [];
  currentPathElement = null;
};

// Bouton "Exporter SVG"
exportBtn.onclick = () => {
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "poesie-visuelle.svg";
  link.click();

  URL.revokeObjectURL(url);
};

// Bouton "Sauvegarder"
saveBtn.onclick = () => {
  const svgData = new XMLSerializer().serializeToString(svg);
  const compositions = JSON.parse(localStorage.getItem("compositions") || "[]");
  compositions.push({
    svg: svgData,
    timestamp: Date.now()
  });
  localStorage.setItem("compositions", JSON.stringify(compositions));
  alert("Composition sauvegardée dans l'archive.");
};
// À la fin du fichier, pour gérer la visibilité
const generateBtn = document.getElementById("generateBtn");
const modeSelect = document.getElementById("modeSelect");

function updateGenerateVisibility() {
  generateBtn.style.display = modeSelect.value === "forme" ? "inline-block" : "none";
}
window.addEventListener("DOMContentLoaded", updateGenerateVisibility);
modeSelect.addEventListener("change", updateGenerateVisibility);
