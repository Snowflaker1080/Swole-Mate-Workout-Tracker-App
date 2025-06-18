document.addEventListener("DOMContentLoaded", () => {
  const displayNameInput = document.getElementById("DisplayName");
  const imagePreview = document.getElementById("imagePreview");
  const imageUrlInput = document.getElementById("imageUrl");
  const regenerateBtn = document.getElementById("regeneratePreview");

  let debounceTimer;

  // Fetch image URL from backend based on display name
  async function fetchImage(displayName) {
    try {
      const res = await fetch(`/cars/image?displayName=${encodeURIComponent(displayName)}`);
      const data = await res.json();
      const url = data.imageUrl || '/stylesheets/images/placeholder.jpg';

      // Update preview and hidden input
      imagePreview.src = url;
      imagePreview.style.display = 'block';
      imageUrlInput.value = url;
    } catch (err) {
      console.error("Image fetch failed", err);

      // Fallback to placeholder
      const fallback = '/stylesheets/images/placeholder.jpg';
      imagePreview.src = fallback;
      imagePreview.style.display = 'block';
      imageUrlInput.value = fallback;
    }
  }

  // Debounced fetch when typing in Display Name
  displayNameInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const displayName = displayNameInput.value.trim();

    debounceTimer = setTimeout(() => {
      if (displayName) {
        fetchImage(displayName);
      } else {
        const fallback = '/stylesheets/images/placeholder.jpg';
        imagePreview.src = fallback;
        imageUrlInput.value = '';
        imagePreview.style.display = 'block';
      }
    }, 500);
  });

  // Manual regenerate on button click
  regenerateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const displayName = displayNameInput.value.trim();
    if (displayName) {
      fetchImage(displayName);
    }
  });
});