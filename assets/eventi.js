(() => {
    const dayMilliseconds = 24 * 60 * 60 * 1000;
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

    const formatDay = (day) => new Date(day * dayMilliseconds).toISOString().slice(0, 10);

    const parseDay = (value) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const [year, month, day] = value.split('-').map(Number);
        const number = Date.UTC(year, month - 1, day) / dayMilliseconds;
        return formatDay(number) === value ? number : null;
    };

    const today = new Date();
    const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / dayMilliseconds;

    const normalizeEvent = (raw) => {
        const start = parseDay(raw.data);
        if (start === null || !raw.url) return null;

        const interval = Number(raw.ricorrenza?.ogni_giorni);
        const recurring = Number.isSafeInteger(interval) && interval > 0;
        const until = raw.ricorrenza?.fino ? parseDay(raw.ricorrenza.fino) : null;
        const dates = recurring ? [] : [...new Set([
            start,
            ...(Array.isArray(raw.date_aggiuntive) ? raw.date_aggiuntive : [])
                .map(parseDay)
                .filter((day) => day !== null)
        ])].sort((a, b) => a - b);

        return { ...raw, start, dates, interval: recurring ? interval : null, until };
    };

    const compareOccurrences = (left, right) =>
        left.day - right.day || left.event.titolo.localeCompare(right.event.titolo);

    const nextOccurrence = (event) => {
        if (event.interval) {
            const index = Math.max(0, Math.ceil((todayDay - event.start) / event.interval));
            const day = event.start + index * event.interval;
            if (event.until !== null && day > event.until) return null;
            return { event, day, index };
        }
        const index = event.dates.findIndex((day) => day >= todayDay);
        return index === -1 ? null : { event, day: event.dates[index], index };
    };

    const futureOccurrences = (events) => events.flatMap((event) => {
        if (event.interval) {
            const next = nextOccurrence(event);
            return next ? [next] : [];
        }
        return event.dates.flatMap((day, index) =>
            day >= todayDay ? [{ event, day, index }] : []
        );
    }).sort(compareOccurrences);

    const pastStreams = (events) => events.flatMap((event) => {
        if (event.interval) {
            const lastAllowed = Math.min(todayDay - 1, event.until ?? todayDay - 1);
            if (lastAllowed < event.start) return [];
            const index = Math.floor((lastAllowed - event.start) / event.interval);
            return [{ event, index, day: event.start + index * event.interval }];
        }
        const index = event.dates.findLastIndex
            ? event.dates.findLastIndex((day) => day < todayDay)
            : event.dates.reduce((last, day, position) => day < todayDay ? position : last, -1);
        return index === -1 ? [] : [{ event, index, day: event.dates[index] }];
    });

    const takePast = (streams, amount) => {
        const result = [];
        while (result.length < amount) {
            let latest = null;
            for (const stream of streams) {
                if (stream.index < 0) continue;
                if (!latest || stream.day > latest.day ||
                    (stream.day === latest.day && stream.event.titolo.localeCompare(latest.event.titolo) < 0)) {
                    latest = stream;
                }
            }
            if (!latest) break;
            result.push({ event: latest.event, day: latest.day, index: latest.index });
            latest.index -= 1;
            if (latest.index >= 0) {
                latest.day = latest.event.interval
                    ? latest.event.start + latest.index * latest.event.interval
                    : latest.event.dates[latest.index];
            }
        }
        return result;
    };

    const hasPast = (streams) => streams.some((stream) => stream.index >= 0);

    const addElement = (parent, tag, className, value) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (value !== undefined) element.textContent = value;
        parent.append(element);
        return element;
    };

    const dateParts = (day) => {
        const date = new Date(day * dayMilliseconds);
        return {
            iso: formatDay(day),
            number: String(date.getUTCDate()),
            monthYear: `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
        };
    };

    const categoryName = (event) => event.categoria_nome || categories[event.categoria] || 'Evento';

    const occurrenceLabel = ({ event, index }) => {
        if (event.interval) return event.interval === 1 ? 'Ogni giorno' : `Ogni ${event.interval} giorni`;
        return event.dates.length > 1 ? `Incontro ${index + 1} di ${event.dates.length}` : '';
    };

    const createTimelineEvent = (occurrence) => {
        const { event, day } = occurrence;
        const parts = dateParts(day);
        const item = document.createElement('li');
        item.className = 'timeline-elemento';
        item.dataset.dataEvento = parts.iso;
        item.dataset.urlEvento = event.url;

        const date = addElement(item, 'time', 'timeline-data');
        date.dateTime = parts.iso;
        addElement(date, 'span', 'timeline-giorno', parts.number);
        addElement(date, 'span', 'timeline-mese', parts.monthYear);

        const card = addElement(item, 'a', 'timeline-scheda');
        card.href = event.url;
        addElement(card, 'span', `etichetta etichetta--${event.categoria || 'altro'}`, categoryName(event));
        if (event.esempio) addElement(card, 'span', 'etichetta', 'Evento di esempio');
        addElement(card, 'h3', 'titolo-s', event.titolo);
        if (event.descrizione) addElement(card, 'p', '', event.descrizione);
        const label = occurrenceLabel(occurrence);
        if (label) addElement(card, 'span', 'timeline-dettagli', label);
        if (event.ora || event.luogo) {
            const time = event.ora ? `Ore ${event.ora}` : '';
            addElement(card, 'span', 'timeline-dettagli', [time, event.luogo].filter(Boolean).join(' · '));
        }
        const link = addElement(card, 'span', 'timeline-link', "Scopri l'evento ");
        const arrow = addElement(link, 'span', '', '→');
        arrow.setAttribute('aria-hidden', 'true');
        return item;
    };

    const createVolantino = (occurrence, past) => {
        const { event, day } = occurrence;
        const parts = dateParts(day);
        const item = document.createElement('li');
        item.dataset.dataEvento = parts.iso;
        const card = addElement(item, 'a', `volantino${past ? ' volantino--passato' : ''}`);
        card.href = event.url;
        const labels = addElement(card, 'span', 'volantino-etichette');
        addElement(labels, 'span', `etichetta etichetta--${event.categoria || 'altro'}`, categoryName(event));
        const date = addElement(card, 'span', 'volantino-data');
        addElement(date, 'span', 'volantino-giorno', parts.number);
        addElement(date, 'span', 'volantino-mese', parts.monthYear);
        const text = addElement(card, 'span');
        addElement(text, 'span', 'volantino-titolo', event.titolo);
        if (event.ora || event.luogo) {
            const time = event.ora ? `Ore ${event.ora}` : '';
            addElement(text, 'span', 'volantino-dove', [time, event.luogo].filter(Boolean).join(', '));
        }
        return item;
    };

    const renderTimeline = (section, events) => {
        const future = futureOccurrences(events);
        const streams = pastStreams(events);
        const firstPast = takePast(streams, 8);
        const futureList = section.querySelector('[data-eventi-futuri]');
        const pastList = section.querySelector('[data-eventi-passati]');
        const loadButton = section.querySelector('[data-carica-eventi]');

        futureList.replaceChildren(...future.map(createTimelineEvent));
        pastList.replaceChildren(...firstPast.map(createTimelineEvent));
        futureList.hidden = future.length === 0;
        section.querySelector('[data-vuoto-futuri]').hidden = future.length > 0;
        section.querySelector('[data-gruppo-passati]').hidden = firstPast.length === 0;
        loadButton.disabled = false;
        loadButton.hidden = !hasPast(streams);
        loadButton.addEventListener('click', () => {
            pastList.append(...takePast(streams, 8).map(createTimelineEvent));
            loadButton.hidden = !hasPast(streams);
        });
    };

    const renderHome = (section, events) => {
        const future = events.map(nextOccurrence).filter(Boolean).sort(compareOccurrences);
        const past = events.filter((event) => !nextOccurrence(event))
            .map((event) => takePast(pastStreams([event]), 1)[0])
            .filter(Boolean)
            .sort((left, right) => compareOccurrences(right, left))
            .slice(0, 4);
        const futureList = section.querySelector('[data-eventi-futuri]');
        const pastList = section.querySelector('[data-eventi-passati]');
        futureList.replaceChildren(...future.map((item) => createVolantino(item, false)));
        pastList.replaceChildren(...past.map((item) => createVolantino(item, true)));
        futureList.hidden = future.length === 0;
        section.querySelector('[data-vuoto-futuri]').hidden = future.length > 0;
        section.querySelector('[data-gruppo-passati]').hidden = past.length === 0;
    };

    document.querySelectorAll('[data-eventi]').forEach(async (section) => {
        const loadButton = section.querySelector('[data-carica-eventi]');
        if (loadButton) loadButton.disabled = true;
        try {
            const response = await fetch(section.dataset.eventiUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const events = (await response.json()).map(normalizeEvent).filter(Boolean);
            if (section.querySelector('.timeline')) renderTimeline(section, events);
            else renderHome(section, events);
        } catch (error) {
            const status = section.querySelector('[data-stato-archivio]');
            if (status) {
                status.textContent = 'Non siamo riusciti a caricare gli eventi. Riprova aggiornando la pagina.';
                status.hidden = false;
            }
        }
    });
})();
