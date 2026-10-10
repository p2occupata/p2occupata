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

    const futureOccurrences = (events) => events.flatMap((event) => {
        if (event.interval) {
            const next = nextOccurrence(event);
            return next ? [next] : [];
        }
        return event.dates.flatMap((day, index) =>
            day >= todayDay ? [{ event, day, index }] : []
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
        if (!occurrence || occurrence.day !== todayDay) return occurrence;
        const minutes = eventMinutes(event);
        if (minutes === null) return occurrence;
        const now = new Date();
        if (minutes > now.getHours() * 60 + now.getMinutes()) return occurrence;
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

    const addCategoryChips = (parent, event) => {
        const group = addElement(parent, 'span', 'categorie-etichette');
        event.categories.forEach(({ name }) => {
            const chip = addElement(group, 'span', `etichetta categoria-chip categoria-chip--tono-${categoryTone(name)}`, name);
            chip.dataset.categoriaNome = name;
        });
        if (event.esempio) addElement(group, 'span', 'etichetta', 'Evento di esempio');
    };

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
        addCategoryChips(card, event);
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
        addCategoryChips(card, event);
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

    const renderFeatured = (section, events) => {
        const host = section.querySelector('[data-prossimo-evento]');
        if (!host) return;
        const next = events.map(nextFeaturedOccurrence).filter(Boolean).sort(compareOccurrences)[0];
        const key = next ? `${next.event.url}|${next.day}` : 'vuoto';
        if (host.dataset.occurrenceKey === key) return;
        host.dataset.occurrenceKey = key;
        host.replaceChildren();
        if (!next) {
            addElement(host, 'p', '', 'Non ci sono eventi in programma al momento.');
            return;
        }
        const card = addElement(host, 'a', 'evento-in-evidenza-scheda');
        card.href = next.event.url;
        const date = addElement(card, 'time', 'evento-in-evidenza-data', fullDate(next.day));
        date.dateTime = formatDay(next.day);
        addCategoryChips(card, next.event);
        addElement(card, 'h3', 'titolo-m', next.event.titolo);
        if (next.event.descrizione) addElement(card, 'p', '', next.event.descrizione);
        if (next.event.ora || next.event.luogo) {
            const time = next.event.ora ? `Ore ${next.event.ora}` : '';
            addElement(card, 'span', 'timeline-dettagli', [time, next.event.luogo].filter(Boolean).join(' · '));
        }
        addElement(card, 'span', 'timeline-link', "Scopri l'evento →");
    };

    const renderCalendar = (section, events) => {
        const grid = section.querySelector('[data-calendario]');
        if (!grid) return;
        const firstDay = todayDay - 17;
        const lastDay = todayDay + 17;
        section.querySelector('[data-calendario-intervallo]').textContent =
            `Dal ${fullDate(firstDay)} al ${fullDate(lastDay)}`;
        const byDay = new Map();
        const occurrences = occurrencesInRange(events, firstDay, lastDay);
        occurrences.forEach((occurrence) => {
            if (!byDay.has(occurrence.day)) byDay.set(occurrence.day, []);
            byDay.get(occurrence.day).push(occurrence);
        });

        const cells = [];
        for (let day = firstDay; day <= lastDay; day += 1) {
            const parts = dateParts(day);
            const dayEvents = byDay.get(day) || [];
            const cell = document.createElement('li');
            cell.className = `calendario-giorno${day === todayDay ? ' calendario-giorno--oggi' : ''}`;
            cell.dataset.dataCalendario = parts.iso;
            if (day === todayDay) cell.setAttribute('aria-current', 'date');
            const date = addElement(cell, 'time', 'calendario-data');
            date.dateTime = parts.iso;
            date.setAttribute('aria-label', fullDate(day));
            addElement(date, 'span', 'calendario-settimana', shortWeekday(day));
            addElement(date, 'span', 'calendario-numero', parts.number);
            addElement(date, 'span', 'calendario-mese', parts.shortMonth);
            if (dayEvents.length) {
                const count = addElement(cell, 'span', 'calendario-conteggio', String(dayEvents.length));
                count.setAttribute('aria-label',
                    `${dayEvents.length} ${dayEvents.length === 1 ? 'evento' : 'eventi'}`);
                const list = addElement(cell, 'ul', 'calendario-eventi');
                dayEvents.forEach(({ event }) => {
                    const item = addElement(list, 'li');
                    const link = addElement(item, 'a', '', event.titolo);
                    link.href = event.url;
                    if (event.ora) link.title = `Ore ${event.ora}`;
                });
            }
            cells.push(cell);
        }
        grid.replaceChildren(...cells);

        const mobileList = section.querySelector('[data-calendario-elenco]');
        mobileList.replaceChildren();
        if (!occurrences.length) return;
        addElement(mobileList, 'h3', 'titolo-s', 'Eventi nelle date visibili');
        for (const [day, dayEvents] of byDay) {
            const group = addElement(mobileList, 'div', 'calendario-elenco-giorno');
            addElement(group, 'h4', '', fullDate(day));
            const list = addElement(group, 'ul');
            dayEvents.forEach(({ event }) => {
                const item = addElement(list, 'li');
                const link = addElement(item, 'a', '', event.ora ? `${event.ora} · ${event.titolo}` : event.titolo);
                link.href = event.url;
            });
        }
    };

    const renderTimeline = (section, events) => {
        const future = futureOccurrences(events);
        const streams = pastStreams(events);
        const firstPast = takePast(streams, 8);
        const futureList = section.querySelector('[data-eventi-futuri]');
        const pastList = section.querySelector('[data-eventi-passati]');
        const loadButton = section.querySelector('[data-carica-eventi]');

        renderFeatured(section, events);
        renderCalendar(section, events);

        futureList.replaceChildren(...future.map(createTimelineEvent));
        pastList.replaceChildren(...firstPast.map(createTimelineEvent));
        futureList.hidden = future.length === 0;
        section.querySelector('[data-vuoto-futuri]').hidden = future.length > 0;
        section.querySelector('[data-gruppo-passati]').hidden = firstPast.length === 0;
        loadButton.disabled = false;
        loadButton.hidden = !hasPast(streams);
        loadButton.onclick = () => {
            pastList.append(...takePast(streams, 8).map(createTimelineEvent));
            loadButton.hidden = !hasPast(streams);
        };
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

    document.querySelectorAll('.categoria-chip').forEach((chip) => {
        chip.classList.add(`categoria-chip--tono-${categoryTone(chip.dataset.categoriaNome || chip.textContent)}`);
    });

    const loadedSections = [];
    document.querySelectorAll('[data-eventi]').forEach(async (section) => {
        const loadButton = section.querySelector('[data-carica-eventi]');
        if (loadButton) loadButton.disabled = true;
        try {
            const response = await fetch(section.dataset.eventiUrl, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const events = (await response.json()).map(normalizeEvent).filter(Boolean);
            loadedSections.push({ section, events });
            if (section.querySelector('.timeline')) renderTimeline(section, events);
            else renderHome(section, events);
        } catch (error) {
            const featured = section.querySelector('[data-prossimo-evento]');
            if (featured) featured.textContent = 'Non siamo riusciti a caricare gli eventi. Riprova aggiornando la pagina.';
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
            loadedSections.forEach(({ section, events }) => {
                if (section.querySelector('.timeline')) renderTimeline(section, events);
                else renderHome(section, events);
            });
            refreshAtMidnight();
        }, nextMidnight.getTime() - Date.now());
    };
    refreshAtMidnight();
    setInterval(() => {
        loadedSections.forEach(({ section, events }) => renderFeatured(section, events));
    }, 60000);
})();
