document.addEventListener("DOMContentLoaded", () => {
  const archiveGrid = document.getElementById("archiveGrid");
  const modal = document.getElementById("modal");
  const modalSvgContainer = document.getElementById("modalSvgContainer");
  const closeModal = document.getElementById("closeModal");
  const exportModalBtn = document.getElementById("exportModalBtn");
  const deleteBtn = document.getElementById("deleteModeBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn"); // à créer dans HTML
  const generateBtn = document.getElementById("generateBtn"); // bouton "Générer"

  let deleteMode = false;
  let compositions = JSON.parse(localStorage.getItem("compositions") || "[]").sort(() => Math.random() - 0.5);

  if (!compositions.length) {
    archiveGrid.innerHTML = "<p style='text-align:center'>Aucune composition sauvegardée</p>";
    return;
  }

  compositions.forEach((comp, index) => {
    const div = document.createElement("div");
    div.className = "grid-item";

    // Checkbox pour sélection
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "delete-checkbox hidden";
    checkbox.dataset.index = index;
    div.appendChild(checkbox);

    // Crée la preview image
    const svgDoc = new DOMParser().parseFromString(comp.svg, "image/svg+xml").documentElement;
    const cloneSvg = svgDoc.cloneNode(true);

    if (!cloneSvg.getAttribute("viewBox")) {
      const width = cloneSvg.getAttribute("width") || "1000";
      const height = cloneSvg.getAttribute("height") || "1000";
      cloneSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    cloneSvg.setAttribute("width", "300");
    cloneSvg.setAttribute("height", "300");

    const serialized = new XMLSerializer().serializeToString(cloneSvg);
    const blob = new Blob([serialized], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const preview = new Image();
      preview.src = canvas.toDataURL("image/png");
      preview.style.width = "100%";
      preview.style.height = "100%";
      div.appendChild(preview);
    };
    img.src = url;

    div.addEventListener("click", (e) => {
      if (deleteMode) {
        // Ne rien faire sur click si en mode suppression, à part cocher
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        return;
      }

      modalSvgContainer.innerHTML = comp.svg;
      const svgEl = modalSvgContainer.querySelector("svg");

      if (svgEl) {
        if (!svgEl.getAttribute("viewBox")) {
          const width = svgEl.getAttribute("width") || "1000";
          const height = svgEl.getAttribute("height") || "1000";
          svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);
        }

        svgEl.removeAttribute("width");
        svgEl.removeAttribute("height");
        svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svgEl.style.width = "100%";
        svgEl.style.height = "100%";
        svgEl.style.maxHeight = "100%";
        svgEl.style.maxWidth = "100%";
        svgEl.style.display = "block";
        svgEl.style.margin = "0 auto";
      }

      modal.classList.remove("hidden");

      exportModalBtn.onclick = () => {
        const blob = new Blob([comp.svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `composition-${index + 1}.svg`;
        link.click();
      };
    });

    archiveGrid.appendChild(div);
  });

  closeModal.onclick = () => {
    modal.classList.add("hidden");
    modalSvgContainer.innerHTML = "";
  };

  deleteBtn.onclick = () => {
    deleteMode = !deleteMode;
    document.body.classList.toggle("delete-mode", deleteMode);
    document.querySelectorAll(".delete-checkbox").forEach(cb => {
      cb.classList.toggle("hidden", !deleteMode);
      cb.checked = false;
    });

    confirmDeleteBtn.style.display = deleteMode ? "inline-block" : "none";
  };

  confirmDeleteBtn.onclick = () => {
    const checkedBoxes = document.querySelectorAll(".delete-checkbox:checked");
    if (!checkedBoxes.length) return;

    const indicesToDelete = [...checkedBoxes].map(cb => parseInt(cb.dataset.index));
    compositions = compositions.filter((_, idx) => !indicesToDelete.includes(idx));
    localStorage.setItem("compositions", JSON.stringify(compositions));
    location.reload();
  };

  // Afficher/Masquer le bouton Générer selon mode
  function switchMode(isForme) {
    document.body.classList.toggle("mode-forme", isForme);
    document.body.classList.toggle("mode-souris", !isForme);

    if (generateBtn) {
      generateBtn.style.display = isForme ? "block" : "none";
    }
  }

  // switchMode(true); // appel en forme
  // switchMode(false); // appel en souris
});
