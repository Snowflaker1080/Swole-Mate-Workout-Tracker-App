document.addEventListener("DOMContentLoaded", () => {
  const dropzones = document.querySelectorAll(".dropzone");

  function setupDraggables() {
    const draggables = document.querySelectorAll(".draggable-exercise");

    draggables.forEach((card) => {
      card.setAttribute("draggable", true);

      card.addEventListener("dragstart", (e) => {
        const groupEl = card.closest(".dropzone");
        const fromGroupId = groupEl ? groupEl.dataset.groupId : "unassigned";
        e.dataTransfer.setData("exerciseId", card.dataset.exerciseId);
        e.dataTransfer.setData("fromGroupId", fromGroupId);
      });
    });
  }

  dropzones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("has-background-light");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("has-background-light");
    });

    zone.addEventListener("drop", async (e) => {
      e.preventDefault();
      zone.classList.remove("has-background-light");

      const exerciseId = e.dataTransfer.getData("exerciseId");
      const fromGroupId = e.dataTransfer.getData("fromGroupId");
      const toGroupId = zone.dataset.groupId;

      // Avoid redundant move
      if (fromGroupId === toGroupId) return;

      try {
        // Remove from old group if needed
        if (fromGroupId !== "unassigned") {
          await fetch(`/workoutGroup/${fromGroupId}/remove-exercise`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exerciseId }),
          });
        }

        // Add to new group if needed
        if (toGroupId !== "unassigned") {
          await fetch(`/workoutGroup/${toGroupId}/add-exercise`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exerciseId }),
          });
        }

        // Move the DOM element
        const card = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
        const cardContainer = zone.querySelector(".group-exercise-list") || zone.querySelector("#saved-exercises");

        if (card && cardContainer) {
          cardContainer.appendChild(card);

          // show visual tick
          const tick = document.createElement("span");
          tick.className = "has-text-success is-size-7 ml-2";
          tick.textContent = "✔️";
          card.querySelector(".box").appendChild(tick);

          setTimeout(() => tick.remove(), 1000); // remove tick after 1s
        }

      } catch (err) {
        console.error("Drag error:", err);
        alert("Something went wrong while updating group assignment.");
      }
    });
  });

  // Initial setup
  setupDraggables();
});