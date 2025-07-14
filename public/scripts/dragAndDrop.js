document.addEventListener("DOMContentLoaded", () => {
  //--- Draggables: Individual Exercises ---
  document.querySelectorAll(".draggable-exercise").forEach((card) => {
    card.setAttribute("draggable", true);
    card.addEventListener("dragstart", (e) => {
      card.classList.add("dragging");
      const groupEl = card.closest(".dropzone");
      const fromGroupId = groupEl?.dataset.groupId || "search";
      e.dataTransfer.setData("exerciseId", card.dataset.exerciseId);
      e.dataTransfer.setData("fromGroupId", fromGroupId);
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  //--- Draggables: Workout-Groups Tiles ---
  document.querySelectorAll(".draggable-group").forEach((tile) => {
    tile.setAttribute("draggable", true);
    tile.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("groupId", tile.dataset.groupId);
    });
  });

  //--- Dropzones: Exercises & Scheduling (Calendar)---
  document.querySelectorAll(".dropzone").forEach((zone) => {
    //--- Common visual highlight
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

      //--- Exercise Assignment & saving
      const exerciseId = e.dataTransfer.getData("exerciseId");
      if (exerciseId) {
        const fromGroupId = e.dataTransfer.getData("fromGroupId");
        const toGroupId = zone.dataset.groupId;

      //--- Save new exercise from search results
      if (toGroupId === "saved") {
        //--- Move card into the saved zone
        const card = document.querySelector(
            `[data-exercise-id="${exerciseId}"]`
          );
        const name = card.dataset.name;
        const bodyPart = card.dataset.bodyPart;
        const equipment = card.dataset.equipment; // API lacks equipment data
        const image = card.dataset.image;

          try {
        const res = await fetch("/gymWorkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                apiId: exerciseId,
                name,
                bodyPart,
                equipment,
                image,
              }),
            });
            if (!res.ok) throw new Error("Save failed");

            //--- DOM move + tick feedback
            const container = 
              zone.id === "saved-exercises" ? zone : zone.querySelector( "#saved-exercises");
            if (card && container) {
              container.appendChild(card);
              //-- Feedback tick
              const tick = document.createElement("span");
              tick.className = "has-text-success is-size-7 ml-2";
              tick.textContent = "✔️";
              card.querySelector(".box").appendChild(tick);
              setTimeout(() => tick.remove(), 1000);
            }
          } catch (err) {
            console.error("Save error:", err);
            alert("Could not save exercise.");
          }
          return;
        }

        // --- Direct drag & drop “search to workout‐group”: create & assign in one go ---
        if (fromGroupId === "search" && toGroupId && toGroupId !== "saved") {
          try {
            // Create the new exercise in Mongo
            const resCreate = await fetch("/gymWorkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ apiId: exerciseId }),
            });
            if (!resCreate.ok) throw new Error("Create failed");
            const newEx = await resCreate.json();
            const newId = newEx._id;

            // Add that new ID to the chosen workout group
            await fetch(`/workoutGroup/${toGroupId}/add-exercise`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ exerciseId: newId }),
            });

            // Move the tile in the DOM & show feedback
            const card = document.querySelector(
              `[data-exercise-id="${exerciseId}"]`
            );
            const container = zone.querySelector(".group-exercise-list");
            if (card && container) {
              container.appendChild(card);
              const tick = document.createElement("span");
              tick.className = "has-text-success is-size-7 ml-2";
              tick.textContent = "✔️";
              card.querySelector(".box").appendChild(tick);
              setTimeout(() => tick.remove(), 1000);
            }
          } catch (err) {
            console.error("Create+assign error:", err);
            alert("Could not add exercise directly to group.");
          }
          return;
        }

        //--- Reassign between workout groups
        if (fromGroupId === toGroupId) return;
        try {
          //--- Remove from old group
          if (fromGroupId !== "search") {
            await fetch(`/workoutGroup/${fromGroupId}/remove-exercise`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ exerciseId }),
            });
          }
          //--- Add to new group
          if (toGroupId && toGroupId !== "saved") {
            await fetch(`/workoutGroup/${toGroupId}/add-exercise`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ exerciseId }),
            });
          }

          //--- DOM move with feedback
          const card = document.querySelector(
            `[data-exercise-id="${exerciseId}"]`
          );
          const container = zone.querySelector(".group-exercise-list");
          if (card && container) {
            container.appendChild(card);
            const tick = document.createElement("span");
            tick.className = "has-text-success is-size-7 ml-2";
            tick.textContent = "✔️";
            card.querySelector(".box").appendChild(tick);
            setTimeout(() => tick.remove(), 1000);
          }
        } catch (err) {
          console.error("Group reassign error:", err);
          alert("Something went wrong updating the exercise group.");
        }
        return;
      }

      // --- Workout-Group Scheduling ---
      const groupId = e.dataTransfer.getData("groupId");
      if (groupId) {
        const date = zone.dataset.date; // "" or "YYYY-MM-DD"
        try {
          const res = await fetch("/schedule/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId, date }),
          });
          if (res.ok) {
            window.location.reload();
          } else {
            const err = await res.json();
            console.error("Failed to assign:", err);
            alert("Could not save your schedule. See console for details.");
          }
        } catch (err) {
          console.error("Network error:", err);
          alert("Network error while saving schedule.");
        }
      }
    });
  });
});
