(() => {
    const months = [
        'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
        'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
    ];
    const categories = {
        concerto: 'Concerto',
        dibattito: 'Dibattito',
        proiezione: 'Proiezione',
        workshop: 'Workshop',
        assemblea: 'Assemblea'
    };

    const addElement = (parent, tag, className, value) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (value) element.textContent = value;
        parent.append(element);
        return element;
    };

    const createTimelineEvent = (event) => {
        const [year, month, day] = event.data.split('-');
        const item = document.createElement('li');
        item.className = 'timeline-elemento';
        item.dataset.dataEvento = event.data;
        item.dataset.fineEvento = event.fine || event.data;
        item.dataset.urlEvento = event.url;

        const date = addElement(item, 'time', 'timeline-data');
        date.dateTime = event.data;
        addElement(date, 'span', 'timeline-giorno', String(Number(day)));
        addElement(date, 'span', 'timeline-mese', `${months[Number(month) - 1]} ${year}`);

        const card = addElement(item, 'a', 'timeline-scheda');
        card.href = event.url;
        const category = event.categoria_nome || categories[event.categoria] || 'Evento';
        addElement(card, 'span', `etichetta etichetta--${event.categoria}`, category);
        if (event.esempio) addElement(card, 'span', 'etichetta', 'Evento di esempio');
        addElement(card, 'h3', 'titolo-s', event.titolo);
        if (event.descrizione) addElement(card, 'p', '', event.descrizione);
        if (event.altre_date > 0) addElement(card, 'span', 'timeline-dettagli', `${event.altre_date + 1} date`);
        if (event.ora || event.luogo) {
            const time = event.ora ? `Ore ${event.ora}` : '';
            const place = event.luogo || '';
            addElement(card, 'span', 'timeline-dettagli', [time, place].filter(Boolean).join(' · '));
        }
        const link = addElement(card, 'span', 'timeline-link', "Scopri l'evento ");
        const arrow = addElement(link, 'span', '', '→');
        arrow.setAttribute('aria-hidden', 'true');
        return item;
    };

    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('-');

    document.querySelectorAll('[data-eventi]').forEach((section) => {
        const futureList = section.querySelector('[data-eventi-futuri]');
        const pastList = section.querySelector('[data-eventi-passati]');
        const pastGroup = section.querySelector('[data-gruppo-passati]');
        const futureEmpty = section.querySelector('[data-vuoto-futuri]');

        if (!futureList || !pastList || !pastGroup || !futureEmpty) return;

        const events = [...section.querySelectorAll('[data-data-evento]')];
        const future = events.filter((event) => (event.dataset.fineEvento || event.dataset.dataEvento) >= today);
        const past = events.filter((event) => (event.dataset.fineEvento || event.dataset.dataEvento) < today);

        future.sort((a, b) => a.dataset.dataEvento.localeCompare(b.dataset.dataEvento));
        past.sort((a, b) => b.dataset.dataEvento.localeCompare(a.dataset.dataEvento));

        future.forEach((event) => futureList.append(event));
        past.forEach((event) => pastList.append(event));

        future.forEach((event) => event.querySelector('.volantino')?.classList.remove('volantino--passato'));
        past.forEach((event) => event.querySelector('.volantino')?.classList.add('volantino--passato'));

        futureList.hidden = future.length === 0;
        futureEmpty.hidden = future.length > 0;
        pastGroup.hidden = past.length === 0;

        const loadButton = section.querySelector('[data-carica-eventi]');
        const archiveStatus = section.querySelector('[data-stato-archivio]');
        if (!loadButton || !archiveStatus) return;

        let archive;
        loadButton.addEventListener('click', async () => {
            loadButton.disabled = true;
            loadButton.textContent = 'Caricamento…';
            archiveStatus.hidden = true;

            try {
                if (!archive) {
                    const response = await fetch(loadButton.dataset.archivioUrl);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    archive = await response.json();
                }

                const knownUrls = new Set(
                    [...section.querySelectorAll('[data-url-evento]')].map((event) => event.dataset.urlEvento)
                );
                const remaining = archive.filter((event) => (event.fine || event.data) < today && !knownUrls.has(event.url));
                remaining.slice(0, 8).forEach((event) => pastList.append(createTimelineEvent(event)));
                loadButton.hidden = remaining.length <= 8;
            } catch (error) {
                archiveStatus.textContent = 'Non siamo riusciti a caricare gli altri eventi. Riprova.';
                archiveStatus.hidden = false;
            } finally {
                loadButton.disabled = false;
                loadButton.textContent = 'Mostra altri eventi';
            }
        });
    });
})();
