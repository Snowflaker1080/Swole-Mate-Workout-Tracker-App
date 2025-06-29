document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".goal-toggle");

  toggles.forEach(checkbox => {
    const targetId = checkbox.dataset.target;
    const target = document.getElementById(targetId);

    // Toggle visibility on load (in case of back button or resubmit)
    if (checkbox.checked) target.classList.remove('is-hidden');

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        target.classList.remove('is-hidden');
      } else {
        target.classList.add('is-hidden');
      }
    });
  });
});