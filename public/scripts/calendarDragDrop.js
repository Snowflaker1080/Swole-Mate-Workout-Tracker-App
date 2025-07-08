document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Keep track of the element currently being dragged
  let draggedEl = null;

  /**
   * Make an element draggable and wire up dragstart/dragend.
   * @param {HTMLElement} el
   */
  function addDragListeners(el) {
    el.setAttribute('draggable', 'true');

    el.addEventListener('dragstart', e => {
      draggedEl = el;
      // Store its ID so we can identify it on drop if needed
      e.dataTransfer.setData('text/plain', el.dataset.groupId);
      // (Optional) Visual feedback
      el.classList.add('is-being-dragged');
    });

    el.addEventListener('dragend', () => {
      draggedEl?.classList.remove('is-being-dragged');
      draggedEl = null;
    });
  }

  // 1️⃣ Initialize every existing .draggable-group
  document.querySelectorAll('.draggable-group').forEach(addDragListeners);

  // 2️⃣ Treat ALL .dropzone[data-date] as drop targets,
  //    including Unscheduled (data-date="") and calendar days (data-date="YYYY-MM-DD")
  const dropzones = document.querySelectorAll('.dropzone[data-date]');

  dropzones.forEach(zone => {
    // Highlight on dragover
    zone.addEventListener('dragover', e => {
      e.preventDefault();               // Required to allow a drop
      zone.classList.add('has-background-light');
    });

    // Remove highlight on leave
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('has-background-light');
    });

    // Handle the drop
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('has-background-light');

      if (!draggedEl) return;          // Nothing to do if we lost the reference

      const isUnscheduled = zone.dataset.date === '';

      if (isUnscheduled) {
        // — Unscheduled panel —
        // If we’re dropping a clone back onto Unscheduled, simply remove it
        // (the original unscheduled .box never went away)
        if (!draggedEl.closest('#unscheduled-groups')) {
          draggedEl.remove();
        }
      } else {
        // — Calendar day drop —
        const list = zone.querySelector('.group-exercise-list');
        // If dragging from Unscheduled, clone & append; 
        // otherwise (dragging a scheduled clone) just move it
        if (draggedEl.closest('#unscheduled-groups')) {
          const clone = draggedEl.cloneNode(true);
          addDragListeners(clone);
          list.appendChild(clone);
        } else {
          list.appendChild(draggedEl);
        }
      }
    });
  });
});