document.addEventListener("DOMContentLoaded", function() {
    const headers = document.querySelectorAll('h1, h2');

    headers.forEach(function(header) {
      // Controlla se l'header ha un id, se no ne crea uno
      if (!header.id) {
        const id = header.textContent.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        header.id = id;
      }

      // Crea il link anchor
      const anchor = document.createElement('a');
      anchor.href = `#${header.id}`;
      anchor.innerHTML = '🔗'; // Simbolo per il link
      anchor.classList.add('anchor-link');
      anchor.setAttribute('aria-hidden', 'true'); // Accessibilità: nascosto agli screen readers

      // Aggiungi il link appena prima del contenuto dell'header
      header.appendChild(anchor);
    });
});
