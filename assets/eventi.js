(() => {
    const dayMilliseconds = 24 * 60 * 60 * 1000;
    const months = [
        'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
        'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
    ];
    const categoryNames = {
        concerto: 'Concerto',
        dibattito: 'Dibattito',
        proiezione: 'Proiezione',
        workshop: 'Workshop',
        assemblea: 'Assemblea',
        altro: 'Evento'
    };
    const categoryTones = {
        concerto: 0,
        dibattito: 1,
        proiezione: 2,
        workshop: 3,
        assemblea: 4
    };

    const categoryTone = (name) => {
        const normalized = name.trim().normalize('NFKC').toLocaleLowerCase('it');
        if (Object.prototype.hasOwnProperty.call(categoryTones, normalized)) {
            return categoryTones[normalized];
        }
        let hash = 2166136261;
        for (const character of normalized) {
            hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
        }
        return (hash >>> 0) % 5;
    };

    const normalizeCategories = (event) => {
        const entries = Array.isArray(event.categorie) && event.categorie.length
            ? event.categorie
            : [{ id: event.categoria || 'altro', nome: event.categoria_nome }];
        return entries.map((entry) => {
            const id = typeof entry === 'string' ? entry : entry?.id;
            if (typeof id !== 'string' || !id.trim()) return null;
            const fallback = categoryNames[id] || id.replace(/-/g, ' ').replace(/^./, (letter) => letter.toLocaleUpperCase('it'));
            const name = typeof entry === 'string' ? fallback : entry.nome || fallback;
            return { name: String(name).trim() };
        }).filter(Boolean);
    };

    const formatDay = (day) => new Date(day * dayMilliseconds).toISOString().slice(0, 10);

    const parseDay = (value) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const [year, month, day] = value.split('-').map(Number);
        const number = Date.UTC(year, month - 1, day) / dayMilliseconds;
        return formatDay(number) === value ? number : null;
    };

    const localDay = (date) =>
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayMilliseconds;
    let todayDay = localDay(new Date());

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

        return { ...raw, start, dates, interval: recurring ? interval : null, until,
            categories: normalizeCategories(raw) };
    };

    const eventMinutes = (event) => {
        const time = /^(\d{1,2}):([0-5]\d)$/.exec(event.ora || '');
        if (!time || Number(time[1]) > 23) return null;
        return Number(time[1]) * 60 + Number(time[2]);
    };

    const compareOccurrences = (left, right) =>
        left.day - right.day ||
        (eventMinutes(left.event) ?? 1440) - (eventMinutes(right.event) ?? 1440) ||
        left.event.titolo.localeCompare(right.event.titolo);

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

    /* Un evento di oggi con l'orario già trascorso non è più in programma. */
    const hasStarted = (event, day) => {
        if (day !== todayDay) return false;
        const minutes = eventMinutes(event);
        if (minutes === null) return false;
        const now = new Date();
        return minutes <= now.getHours() * 60 + now.getMinutes();
    };

    const futureOccurrences = (events) => events.flatMap((event) => {
        if (event.interval) {
            const next = nextFeaturedOccurrence(event);
            return next ? [next] : [];
        }
        return event.dates.flatMap((day, index) =>
            day >= todayDay && !hasStarted(event, day) ? [{ event, day, index }] : []
        );
    }).sort(compareOccurrences);

    const occurrencesInRange = (events, firstDay, lastDay) => events.flatMap((event) => {
        if (event.interval) {
            const firstIndex = Math.max(0, Math.ceil((firstDay - event.start) / event.interval));
            const occurrences = [];
            for (let index = firstIndex; ; index += 1) {
                const day = event.start + index * event.interval;
                if (day > lastDay || (event.until !== null && day > event.until)) break;
                occurrences.push({ event, day, index });
            }
            return occurrences;
        }
        return event.dates.flatMap((day, index) =>
            day >= firstDay && day <= lastDay ? [{ event, day, index }] : []
        );
    }).sort(compareOccurrences);

    const nextFeaturedOccurrence = (event) => {
        const occurrence = nextOccurrence(event);
        if (!occurrence || !hasStarted(event, occurrence.day)) return occurrence;
        if (event.interval) {
            const day = occurrence.day + event.interval;
            return event.until === null || day <= event.until
                ? { event, day, index: occurrence.index + 1 } : null;
        }
        const index = occurrence.index + 1;
        return index < event.dates.length
            ? { event, day: event.dates[index], index } : null;
    };

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
            shortMonth: months[date.getUTCMonth()].slice(0, 3),
            monthYear: `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
        };
    };

    const fullDate = (day) => new Intl.DateTimeFormat('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(day * dayMilliseconds));

    const shortWeekday = (day) => new Intl.DateTimeFormat('it-IT', {
        weekday: 'short', timeZone: 'UTC'
    }).format(new Date(day * dayMilliseconds));

    const longWeekday = (day) => new Intl.DateTimeFormat('it-IT', {
        weekday: 'long', timeZone: 'UTC'
    }).format(new Date(day * dayMilliseconds));

    const rangeLabel = (firstDay, lastDay) => {
        const first = new Date(firstDay * dayMilliseconds);
        const last = new Date(lastDay * dayMilliseconds);
        const firstYear = first.getUTCFullYear() === last.getUTCFullYear() ? '' : ` ${first.getUTCFullYear()}`;
        return `${first.getUTCDate()} ${months[first.getUTCMonth()]}${firstYear} – ` +
            `${last.getUTCDate()} ${months[last.getUTCMonth()]} ${last.getUTCFullYear()}`;
    };

    const addCategoryChips = (parent, event) => {
        const group = addElement(parent, 'span', 'categorie-etichette');
        event.categories.forEach(({ name }) => {
            const chip = addElement(group, 'span', `etichetta categoria-chip categoria-chip--tono-${categoryTone(name)}`, name);
            chip.dataset.categoriaNome = name;
        });
        if (event.esempio) addElement(group, 'span', 'etichetta', 'Evento di esempio');
    };

    /* La locandina è facoltativa: senza, le schede restano come sono. */
    const addPoster = (parent, event, className) => {
        if (!event.locandina) return null;
        const image = addElement(parent, 'img', `locandina ${className}`);
        image.src = event.locandina;
        image.alt = '';
        image.loading = 'lazy';
        return image;
    };

    const occurrenceLabel = ({ event, index }) => {
        if (event.interval) return event.interval === 1 ? 'Ogni giorno' : `Ogni ${event.interval} giorni`;
        return event.dates.length > 1 ? `Incontro ${index + 1} di ${event.dates.length}` : '';
    };

    const occurrenceDetails = (occurrence) => {
        const { event } = occurrence;
        const time = event.ora ? `Ore ${event.ora}` : '';
        return [occurrenceLabel(occurrence), time, event.luogo].filter(Boolean).join(' · ');
    };

    const createArchiveRow = (occurrence) => {
        const { event, day } = occurrence;
        const parts = dateParts(day);
        const item = document.createElement('li');
        item.dataset.dataEvento = parts.iso;
        item.dataset.urlEvento = event.url;

        const row = addElement(item, 'a', 'archivio-riga');
        row.href = event.url;
        const date = addElement(row, 'time', 'archivio-data');
        date.dateTime = parts.iso;
        addElement(date, 'span', 'archivio-giorno', parts.number);
        addElement(date, 'span', 'archivio-mese', parts.shortMonth);

        if (addPoster(row, event, 'archivio-locandina')) row.classList.add('archivio-riga--locandina');
        const text = addElement(row, 'span', 'archivio-testo');
        addElement(text, 'h4', 'archivio-titolo', event.titolo);
        const details = occurrenceDetails(occurrence);
        if (details) addElement(text, 'span', 'archivio-dettagli', details);
        addCategoryChips(row, event);
        const arrow = addElement(row, 'span', 'archivio-freccia', '→');
        arrow.setAttribute('aria-hidden', 'true');
        return item;
    };

    const appendPast = (container, occurrences) => {
        occurrences.forEach((occurrence) => {
            const year = String(new Date(occurrence.day * dayMilliseconds).getUTCFullYear());
            let group = container.lastElementChild;
            if (!group || group.dataset.anno !== year) {
                group = addElement(container, 'div', 'archivio-anno');
                group.dataset.anno = year;
                addElement(group, 'h3', 'archivio-anno-titolo', year);
                addElement(group, 'ol', 'archivio-elenco');
            }
            group.querySelector('.archivio-elenco').append(createArchiveRow(occurrence));
        });
    };

    const createVolantino = (occurrence, past, withLabel) => {
        const { event, day } = occurrence;
        const parts = dateParts(day);
        const item = document.createElement('li');
        item.dataset.dataEvento = parts.iso;
        const card = addElement(item, 'a', `volantino${past ? ' volantino--passato' : ''}`);
        card.href = event.url;
        addCategoryChips(card, event);
        const date = addElement(card, 'span', 'volantino-data');
        addElement(date, 'span', 'volantino-giorno', parts.number);
        addElement(date, 'span', 'volantino-mese', parts.monthYear);
        const text = addElement(card, 'span', 'volantino-testo');
        addElement(text, 'span', 'volantino-titolo', event.titolo);
        const label = withLabel ? occurrenceLabel(occurrence) : '';
        if (label) addElement(text, 'span', 'volantino-dove', label);
        if (event.ora || event.luogo) {
            const time = event.ora ? `Ore ${event.ora}` : '';
            addElement(text, 'span', 'volantino-dove', [time, event.luogo].filter(Boolean).join(', '));
        }
        if (addPoster(card, event, 'volantino-locandina')) card.classList.add('volantino--locandina');
        return item;
    };

    const occurrenceKey = (occurrence) => `${occurrence.event.url}|${occurrence.day}`;

    /* In evidenza vanno tutti gli eventi del primo giorno utile, non solo il primo. */
    const renderFeatured = (section, featured) => {
        const host = section.querySelector('[data-prossimo-evento]');
        host.replaceChildren();
        host.hidden = featured.length === 0;
        const empty = section.querySelector('[data-prossimo-vuoto]');
        if (empty) empty.hidden = featured.length > 0;
        section.querySelector('[data-prossimo-titolo]').textContent =
            featured.length > 1 ? 'I prossimi eventi' : 'Il prossimo evento';
        if (!featured.length) return;

        const { day } = featured[0];
        const parts = dateParts(day);
        const card = addElement(host, 'article', 'prossimo-scheda');
        const date = addElement(card, 'time', 'prossimo-data');
        date.dateTime = parts.iso;
        date.setAttribute('aria-label', fullDate(day));
        addElement(date, 'span', 'prossimo-settimana',
            day === todayDay ? `Oggi, ${longWeekday(day)}` : longWeekday(day));
        addElement(date, 'span', 'prossimo-giorno', parts.number);
        addElement(date, 'span', 'prossimo-mese', parts.monthYear);

        if (featured.length === 1) {
            const [occurrence] = featured;
            const { event } = occurrence;
            const text = addElement(card, 'div', 'prossimo-testo');
            addCategoryChips(text, event);
            addElement(text, 'h3', 'titolo-l', event.titolo);
            if (event.descrizione) addElement(text, 'p', 'attacco', event.descrizione);
            const facts = [
                [event.interval ? 'Ricorrenza' : 'Ciclo', occurrenceLabel(occurrence)],
                ['Ora', event.ora],
                ['Dove', event.luogo]
            ].filter(([, value]) => value);
            if (facts.length) {
                const factList = addElement(text, 'ul', 'dati-evento');
                facts.forEach(([name, value]) => {
                    const fact = addElement(factList, 'li');
                    addElement(fact, 'span', '', name);
                    addElement(fact, 'strong', '', value);
                });
            }
            const link = addElement(text, 'a', 'bottone bottone--su-scuro', "Scopri l'evento");
            link.href = event.url;
            if (addPoster(card, event, 'prossimo-locandina')) card.classList.add('prossimo-scheda--locandina');
            return;
        }

        /* Più eventi nello stesso giorno: la data una volta sola, un foglio per evento. */
        card.classList.add('prossimo-scheda--piu');
        const sheets = addElement(card, 'ul', 'prossimo-fogli');
        sheets.dataset.eventi = String(featured.length);
        featured.forEach((occurrence) => {
            const { event } = occurrence;
            const sheet = addElement(sheets, 'li', 'prossimo-foglio');
            addElement(sheet, 'span', 'prossimo-ora', event.ora ? `Ore ${event.ora}` : 'In giornata');
            addCategoryChips(sheet, event);
            addElement(sheet, 'h3', 'titolo-s', event.titolo);
            if (event.descrizione) addElement(sheet, 'p', '', event.descrizione);
            const details = [occurrenceLabel(occurrence), event.luogo].filter(Boolean).join(' · ');
            if (details) addElement(sheet, 'span', 'prossimo-dettagli', details);
            const link = addElement(sheet, 'a', 'bottone bottone--piccolo', "Scopri l'evento");
            link.href = event.url;
            if (addPoster(sheet, event, 'prossimo-foglio-locandina')) sheet.classList.add('prossimo-foglio--locandina');
        });
    };

    /* Gli eventi in evidenza: tutti quelli del primo giorno utile. Restituisce false se non è cambiato nulla. */
    const updateFeatured = (section, events) => {
        const host = section.querySelector('[data-prossimo-evento]');
        const upcoming = events.map(nextFeaturedOccurrence).filter(Boolean).sort(compareOccurrences);
        const featured = upcoming.filter((occurrence) => occurrence.day === upcoming[0].day);
        const key = `${todayDay}|${featured.map(occurrenceKey).join(',') || 'vuoto'}`;
        if (host.dataset.occurrenceKey === key) return false;
        host.dataset.occurrenceKey = key;
        renderFeatured(section, featured);
        return featured;
    };

    /* Pagina eventi: in evidenza e bacheca cambiano insieme, la bacheca non ripete gli eventi in evidenza. */
    const renderProgramma = (section, events) => {
        const featured = updateFeatured(section, events);
        if (!featured) return;
        const featuredKeys = featured.map(occurrenceKey);
        const others = futureOccurrences(events)
            .filter((occurrence) => !featuredKeys.includes(occurrenceKey(occurrence)));
        section.querySelector('[data-eventi-futuri]')
            .replaceChildren(...others.map((occurrence) => createVolantino(occurrence, false, true)));
        section.querySelector('[data-gruppo-futuri]').hidden = others.length === 0;
    };

    /* Home: la fascia del prossimo evento compare solo se c'è qualcosa in programma. */
    const renderProssimo = (section, events) => {
        const featured = updateFeatured(section, events);
        if (featured) section.hidden = featured.length === 0;
    };

    const renderCalendar = (section, events) => {
        const grid = section.querySelector('[data-calendario]');
        if (!grid) return;
        /* Cinque settimane da lunedì a domenica, con quella di oggi al centro. */
        const firstDay = todayDay - ((todayDay + 3) % 7) - 14;
        const lastDay = firstDay + 34;
        section.querySelector('[data-calendario-intervallo]').textContent = rangeLabel(firstDay, lastDay);
        const byDay = new Map();
        const occurrences = occurrencesInRange(events, firstDay, lastDay);
        occurrences.forEach((occurrence) => {
            if (!byDay.has(occurrence.day)) byDay.set(occurrence.day, []);
            byDay.get(occurrence.day).push(occurrence);
        });

        /* Il giorno scelto mostra i suoi eventi nel pannello: all'inizio oggi, o il primo giorno utile. */
        const panel = section.querySelector('[data-calendario-elenco]');
        const eventDays = [...byDay.keys()];
        const showDay = (day) => {
            grid.dataset.giornoScelto = String(day);
            grid.querySelectorAll('.calendario-giorno').forEach((cell) => {
                const chosen = cell.dataset.dataCalendario === formatDay(day);
                cell.classList.toggle('calendario-giorno--scelto', chosen);
                const button = cell.querySelector('button');
                if (button) button.setAttribute('aria-pressed', String(chosen));
            });
            panel.replaceChildren();
            const heading = addElement(panel, 'h3', 'titolo-s agenda-data');
            const date = addElement(heading, 'time', '', fullDate(day));
            date.dateTime = formatDay(day);
            if (day === todayDay) addElement(heading, 'span', 'agenda-oggi', 'Oggi');
            const list = addElement(panel, 'ul', 'agenda-eventi');
            byDay.get(day).forEach(({ event }) => {
                const item = addElement(list, 'li');
                const link = addElement(item, 'a');
                link.href = event.url;
                addElement(link, 'span', 'agenda-ora', event.ora || '—');
                const text = addElement(link, 'span', 'agenda-testo');
                addElement(text, 'span', 'agenda-titolo', event.titolo);
                if (event.luogo) addElement(text, 'span', 'agenda-luogo', event.luogo);
                const arrow = addElement(link, 'span', 'agenda-freccia', '→');
                arrow.setAttribute('aria-hidden', 'true');
            });
        };

        const cells = [];
        for (let day = firstDay; day <= lastDay; day += 1) {
            const parts = dateParts(day);
            const dayEvents = byDay.get(day) || [];
            const cell = document.createElement('li');
            cell.className = 'calendario-giorno';
            if (day === todayDay) cell.classList.add('calendario-giorno--oggi');
            if (day < todayDay) cell.classList.add('calendario-giorno--passato');
            if (dayEvents.length) cell.classList.add('calendario-giorno--con-eventi');
            cell.dataset.dataCalendario = parts.iso;
            if (day === todayDay) cell.setAttribute('aria-current', 'date');

            const box = addElement(cell, dayEvents.length ? 'button' : 'span', 'calendario-casella');
            const date = addElement(box, 'time', 'calendario-numero', parts.number);
            date.dateTime = parts.iso;
            if (dayEvents.length) {
                box.type = 'button';
                box.setAttribute('aria-label',
                    `${fullDate(day)}, ${dayEvents.length} ${dayEvents.length === 1 ? 'evento' : 'eventi'}`);
                box.addEventListener('click', () => showDay(day));
            } else {
                date.setAttribute('aria-label', fullDate(day));
            }
            if (day === todayDay) addElement(box, 'span', 'calendario-mese', 'oggi');
            else if (day === firstDay || parts.number === '1') addElement(box, 'span', 'calendario-mese', parts.shortMonth);
            if (dayEvents.length) {
                const marks = addElement(box, 'span', 'calendario-segni');
                marks.setAttribute('aria-hidden', 'true');
                dayEvents.slice(0, 4).forEach(() => addElement(marks, 'i'));
            }
            cells.push(cell);
        }
        const previous = Number(grid.dataset.giornoScelto);
        grid.replaceChildren(...cells);

        if (!eventDays.length) {
            panel.replaceChildren();
            addElement(panel, 'p', 'nota', 'Nessun evento in queste cinque settimane.');
            return;
        }
        const chosen = byDay.has(previous) ? previous
            : eventDays.find((day) => day >= todayDay) ?? eventDays[eventDays.length - 1];
        showDay(chosen);
    };

    const renderEventi = (section, events) => {
        const streams = pastStreams(events);
        const firstPast = takePast(streams, 8);
        const pastList = section.querySelector('[data-eventi-passati]');
        const loadButton = section.querySelector('[data-carica-eventi]');

        renderProgramma(section, events);
        renderCalendar(section, events);

        pastList.replaceChildren();
        appendPast(pastList, firstPast);
        section.querySelector('[data-gruppo-passati]').hidden = firstPast.length === 0;
        loadButton.disabled = false;
        loadButton.hidden = !hasPast(streams);
        loadButton.onclick = () => {
            appendPast(pastList, takePast(streams, 8));
            loadButton.hidden = !hasPast(streams);
        };
    };

    const renderHome = (section, events) => {
        const future = events.map(nextFeaturedOccurrence).filter(Boolean).sort(compareOccurrences);
        const past = events.filter((event) => !nextOccurrence(event))
            .map((event) => takePast(pastStreams([event]), 1)[0])
            .filter(Boolean)
            .sort((left, right) => compareOccurrences(right, left))
            .slice(0, 4);
        const futureList = section.querySelector('[data-eventi-futuri]');
        const pastList = section.querySelector('[data-eventi-passati]');
        const key = `${todayDay}|${future.map(occurrenceKey).join(',')}`;
        if (futureList.dataset.occurrenceKey === key) return;
        futureList.dataset.occurrenceKey = key;
        futureList.replaceChildren(...future.map((item) => createVolantino(item, false)));
        pastList.replaceChildren(...past.map((item) => createVolantino(item, true)));
        futureList.hidden = future.length === 0;
        section.querySelector('[data-vuoto-futuri]').hidden = future.length > 0;
        section.querySelector('[data-gruppo-passati]').hidden = past.length === 0;
    };

    document.querySelectorAll('.categoria-chip').forEach((chip) => {
        chip.classList.add(`categoria-chip--tono-${categoryTone(chip.dataset.categoriaNome || chip.textContent)}`);
    });

    /* Tre tipi di sezione: la pagina eventi, la fascia del prossimo evento in home, la bacheca in home. */
    const sectionKind = (section) => {
        if (section.querySelector('[data-calendario]')) return 'eventi';
        return section.querySelector('[data-prossimo-evento]') ? 'prossimo' : 'home';
    };
    const renderers = { eventi: renderEventi, prossimo: renderProssimo, home: renderHome };
    const refreshers = { eventi: renderProgramma, prossimo: renderProssimo, home: renderHome };

    const downloads = new Map();
    const loadEvents = (url) => {
        if (!downloads.has(url)) {
            downloads.set(url, fetch(url, { cache: 'no-store' }).then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            }));
        }
        return downloads.get(url);
    };

    const loadedSections = [];
    document.querySelectorAll('[data-eventi]').forEach(async (section) => {
        const loadButton = section.querySelector('[data-carica-eventi]');
        if (loadButton) loadButton.disabled = true;
        try {
            const events = (await loadEvents(section.dataset.eventiUrl)).map(normalizeEvent).filter(Boolean);
            loadedSections.push({ section, events });
            renderers[sectionKind(section)](section, events);
        } catch (error) {
            const featured = section.querySelector('[data-prossimo-evento]');
            if (featured) {
                featured.replaceChildren();
                addElement(featured, 'p', '', 'Non siamo riusciti a caricare gli eventi. Riprova aggiornando la pagina.');
            }
            const status = section.querySelector('[data-stato-archivio]');
            if (status) {
                status.textContent = 'Non siamo riusciti a caricare gli eventi. Riprova aggiornando la pagina.';
                status.hidden = false;
            }
        }
    });

    const refreshAtMidnight = () => {
        const nextMidnight = new Date();
        nextMidnight.setHours(24, 0, 0, 50);
        setTimeout(() => {
            todayDay = localDay(new Date());
            loadedSections.forEach(({ section, events }) => renderers[sectionKind(section)](section, events));
            refreshAtMidnight();
        }, nextMidnight.getTime() - Date.now());
    };
    refreshAtMidnight();
    setInterval(() => {
        loadedSections.forEach(({ section, events }) => refreshers[sectionKind(section)](section, events));
    }, 60000);
})();
