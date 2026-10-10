(() => {
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
        const future = events.filter((event) => event.dataset.dataEvento >= today);
        const past = events.filter((event) => event.dataset.dataEvento < today);

        future.sort((a, b) => a.dataset.dataEvento.localeCompare(b.dataset.dataEvento));
        past.sort((a, b) => b.dataset.dataEvento.localeCompare(a.dataset.dataEvento));

        future.forEach((event) => futureList.append(event));
        past.forEach((event) => pastList.append(event));

        future.forEach((event) => event.querySelector('.volantino')?.classList.remove('volantino--passato'));
        past.forEach((event) => event.querySelector('.volantino')?.classList.add('volantino--passato'));

        futureList.hidden = future.length === 0;
        futureEmpty.hidden = future.length > 0;
        pastGroup.hidden = past.length === 0;
    });
})();
