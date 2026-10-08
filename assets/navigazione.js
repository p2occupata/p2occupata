// Apre e chiude il menu della navigazione su schermi piccoli.
const bottoneMenu = document.querySelector('.navigazione-apri');
const vociMenu = document.querySelector('.navigazione-voci');

if (bottoneMenu && vociMenu) {
    const chiudiMenu = () => {
        bottoneMenu.setAttribute('aria-expanded', 'false');
        bottoneMenu.setAttribute('aria-label', 'Apri il menu');
        vociMenu.classList.remove('is-aperta');
    };

    bottoneMenu.addEventListener('click', () => {
        const aperto = bottoneMenu.getAttribute('aria-expanded') === 'true';
        bottoneMenu.setAttribute('aria-expanded', String(!aperto));
        bottoneMenu.setAttribute('aria-label', aperto ? 'Apri il menu' : 'Chiudi il menu');
        vociMenu.classList.toggle('is-aperta', !aperto);
    });

    vociMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', chiudiMenu));
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') chiudiMenu();
    });
}
