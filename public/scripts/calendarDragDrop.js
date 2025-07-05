document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll(".draggable-group");
  const dropzones = document.querySelectorAll(".dropzone");

  draggables.forEach(group => {
    group.addEventListener("dragstart", e => {
      e.dataTransfer.setData("groupId", group.dataset.groupId);
    });
  });

  dropzones.forEach(zone => {
    zone.addEventListener("dragover", e => {
      e.preventDefault();
      zone.classList.add("has-background-info-light");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("has-background-info-light");
    });

    zone.addEventListener("drop", async e => {
      e.preventDefault();
      zone.classList.remove("has-background-info-light");

      const groupId = e.dataTransfer.getData("groupId");
      const date = zone.dataset.date; // Might be empty for unscheduled

      try {
        const res = await fetch("/schedule/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId, date }), // date = "" unassigns
        });

        if (res.ok) {
          const groupBox = document.querySelector(`.draggable-group[data-group-id="${groupId}"]`);
          if (groupBox) {
            const clone = groupBox.cloneNode(true);
            clone.classList.remove("draggable-group");
            clone.classList.add("tag", "is-link", "is-light", "is-small", "mb-1");

            if (date) {
              // Dropped into calendar box
              const targetList = zone.querySelector(".group-exercise-list");
              if (targetList) targetList.appendChild(clone);
            } else {
              // Dropped into unscheduled area
              const targetCol = document.createElement("div");
              targetCol.classList.add("column", "is-one-quarter");

              const unscheduledBox = document.createElement("div");
              unscheduledBox.classList.add("box", "draggable-group");
              unscheduledBox.setAttribute("draggable", "true");
              unscheduledBox.dataset.groupId = groupId;
              unscheduledBox.innerHTML = groupBox.innerHTML;

              targetCol.appendChild(unscheduledBox);
              zone.appendChild(targetCol);
            }

            groupBox.remove();
          }
        } else {
          alert("Failed to assign group");
        }
      } catch (err) {
        console.error("Drop error:", err);
      }
    });
  });
});
