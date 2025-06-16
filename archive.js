document.addEventListener("DOMContentLoaded", () => {
  const archiveGrid = document.getElementById("archiveGrid");
  const modal = document.getElementById("modal");
  const modalSvgContainer = document.getElementById("modalSvgContainer");
  const closeModal = document.getElementById("closeModal");
  const exportModalBtn = document.getElementById("exportModalBtn");
  const deleteBtn = document.getElementById("deleteModeBtn");

  let deleteMode = false;
  let compositions = JSON.parse(localStorage.getItem("compositions") || "[]");

  if (!compositions.length) {
    archiveGrid.innerHTML = "<p style='text-align:center'>Aucune composition sauvegardée</p>";
    return;
  }

  compositions.forEach((comp, index) => {
    const div = document.createElement("div");
    div.className = "grid-item";
    div.dataset.index = index;

    const svgDoc = new DOMParser().parseFromString(comp.svg, "image/svg+xml").documentElement;
    if (!svgDoc.getAttribute("viewBox")) {
      const width = svgDoc.getAttribute("width") || "1000";
      const height = svgDoc.getAttribute("height") || "1000";
      svgDoc.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    svgDoc.setAttribute("width", "300");
    svgDoc.setAttribute("height", "300");

    const serialized = new XMLSerializer().serializeToString(svgDoc);
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

    div.addEventListener("click", () => {
      if (deleteMode) {
        div.classList.toggle("selected");
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
    if (!deleteMode) {
      deleteMode = true;
      deleteBtn.textContent = "Annuler";
      deleteBtn.classList.add("active-delete");
      document.body.classList.add("delete-mode");
    } else {
      // Annule la sélection
      deleteMode = false;
      deleteBtn.textContent = "Supprimer";
      deleteBtn.classList.remove("active-delete");
      document.body.classList.remove("delete-mode");
      document.querySelectorAll(".grid-item.selected").forEach(el => el.classList.remove("selected"));
    }
  };

  // Double clic pour confirmer la suppression
  deleteBtn.addEventListener("dblclick", () => {
    if (!deleteMode) return;
    const selected = document.querySelectorAll(".grid-item.selected");
    if (!selected.length) return;
    if (confirm("Supprimer les éléments sélectionnés ?")) {
      const indices = Array.from(selected).map(el => parseInt(el.dataset.index));
      compositions = compositions.filter((_, i) => !indices.includes(i));
      localStorage.setItem("compositions", JSON.stringify(compositions));
      location.reload();
    }
  });
});
