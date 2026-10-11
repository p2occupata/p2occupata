(() => {
    const messageLimit = 4096;
    const storagePrefix = 'bot-spesa:';
    const addedCategory = 'Non in lista';
    const quantityPattern = /^\d+([.,]\d{1,3})?$/;
    const pricePattern = /^\d+([.,]\d{1,2})?$/;

    const status = document.querySelector('[data-stato]');
    const about = document.querySelector('[data-presentazione]');
    const form = document.querySelector('[data-modulo]');
    const bar = document.querySelector('[data-barra]');
    const container = document.querySelector('[data-voci]');
    const notice = document.querySelector('[data-avviso]');
    const total = document.querySelector('[data-totale]');
    const confirmation = document.querySelector('[data-conferma]');
    const confirmationText = document.querySelector('[data-conferma-testo]');
    const sendAnyway = document.querySelector('[data-invia-comunque]');
    const share = document.querySelector('[data-condividi]');

    let bot = '';
    let storageKey = '';
    let code = '';
    let items = [];
    let closed = [];
    let groups = [];
    let openItem = null;
    let sentMessage = '';

    // Il link porta dopo il # un JSON in base64 per URL:
    // { b: nome del bot, v: [[nome, nota, categoria], ...] }.
    const decodeLink = (text) => {
        const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        const data = JSON.parse(new TextDecoder().decode(bytes));
        if (!data || typeof data.b !== 'string' || !data.b || !Array.isArray(data.v)) {
            throw new Error('formato non valido');
        }
        return data;
    };

    const hash = (text) => {
        let value = 2166136261;
        for (const character of text) {
            value = Math.imul(value ^ character.codePointAt(0), 16777619);
        }
        return (value >>> 0).toString(36);
    };

    // Il codice distingue un invio dall'altro: chi registra scarta i doppioni.
    const newCode = () => {
        const numbers = new Uint32Array(2);
        crypto.getRandomValues(numbers);
        return Array.from(numbers, (number) => number.toString(36)).join('').slice(0, 8);
    };

    const readSaved = () => {
        try {
            for (const key of Object.keys(localStorage)) {
                if (key.startsWith(storagePrefix) && key !== storageKey) {
                    localStorage.removeItem(key);
                }
            }
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch (error) {
            return {};
        }
    };

    const save = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                code,
                closed,
                items: items.map((item) => ({
                    name: item.name,
                    added: item.added,
                    checked: item.checked,
                    still: item.still,
                    lines: item.lines.map((line) => ({
                        quantity: line.quantity,
                        price: line.price,
                        whole: line.whole,
                        description: line.description
                    }))
                }))
            }));
        } catch (error) {
            // Senza memoria locale il modulo funziona lo stesso.
        }
    };

    const toNumber = (text) => Number(text.replace(',', '.'));

    const money = (value) => `${value.toFixed(2).replace('.', ',')} €`;

    const clean = (text) => text.replace(/[|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    const blankLine = () => ({ quantity: '', price: '', whole: false, description: '' });

    const restoredLines = (saved) => {
        const lines = (Array.isArray(saved) ? saved : []).map((line) => ({
            quantity: String(line.quantity || ''),
            price: String(line.price || ''),
            whole: Boolean(line.whole),
            description: String(line.description || '')
        }));
        return lines.length ? lines : [blankLine()];
    };

    // 'vuota' non ha nulla di scritto, 'pronta' ha quantità e prezzo validi,
    // 'incompleta' ha qualcosa che manca o un numero scritto male.
    const lineState = (line) => {
        const quantity = line.quantity.trim();
        const price = line.price.trim();
        if (!quantity && !price && !clean(line.description)) {
            return 'vuota';
        }
        const valid = quantityPattern.test(quantity) && toNumber(quantity) > 0 && pricePattern.test(price);
        return valid ? 'pronta' : 'incompleta';
    };

    // 'libera' non è spuntata e non viene inviata. Le voci spuntate partono tutte:
    // 'valida' ha quantità e prezzo, 'avviso' no, e chi invia viene avvertito prima.
    const itemState = (item) => {
        if (!item.checked) {
            return 'libera';
        }
        const states = item.lines.map(lineState);
        const complete = states.includes('pronta') && !states.includes('incompleta') && clean(item.name);
        return complete ? 'valida' : 'avviso';
    };

    // Le righe da inviare: quelle con qualcosa di scritto, così come sono. Una voce
    // spuntata e lasciata vuota vale come un acquisto senza quantità e prezzo.
    const sentLines = (item) => {
        const lines = item.lines.filter((line) => lineState(line) !== 'vuota');
        return lines.length ? lines : [blankLine()];
    };

    // Una voce nuova senza nome e senza numeri non dice nulla: non parte.
    const sendable = (item) => (
        item.checked && (clean(item.name) || item.lines.some((line) => lineState(line) !== 'vuota'))
    );

    const lineAmount = (line) => {
        if (lineState(line) !== 'pronta') {
            return 0;
        }
        return line.whole ? toNumber(line.price) : toNumber(line.quantity) * toNumber(line.price);
    };

    const itemAmount = (item) => item.lines.reduce((sum, line) => sum + lineAmount(line), 0);

    const summary = (item, state) => {
        if (state === 'libera') {
            return '';
        }
        if (state === 'avviso') {
            if (!clean(item.name)) {
                return 'Manca il nome';
            }
            const wrong = item.lines.find((line) => lineState(line) === 'incompleta');
            if (!wrong) {
                return 'Senza quantità e prezzo';
            }
            if (!wrong.price.trim() && quantityPattern.test(wrong.quantity.trim())) {
                return 'Manca il prezzo';
            }
            if (!wrong.quantity.trim() && pricePattern.test(wrong.price.trim())) {
                return 'Manca la quantità';
            }
            return 'Controlla quantità e prezzo';
        }
        const parts = sentLines(item).map((line) => {
            const quantity = line.quantity.trim().replace('.', ',');
            const price = money(toNumber(line.price));
            return line.whole ? `${quantity} · ${price} in tutto` : `${quantity} × ${price}`;
        });
        const text = parts.length > 2 ? `${parts.length} prezzi · ${money(itemAmount(item))}` : parts.join(' + ');
        return item.still ? `${text} · ne serve ancora` : text;
    };

    // Davanti al nome: «+» voce che non era in lista, «~» voce di cui ne serve ancora.
    const buildMessage = () => {
        const rows = [];
        items.filter(sendable).forEach((item) => {
            const mark = item.added ? '+ ' : (item.still ? '~ ' : '');
            sentLines(item).forEach((line) => {
                const fields = [
                    `${mark}${clean(item.name)}`,
                    clean(line.quantity),
                    `${line.whole && line.price.trim() ? '=' : ''}${clean(line.price)}`
                ];
                const description = clean(line.description);
                if (description) {
                    fields.push(description);
                }
                rows.push(fields.join(' | '));
            });
        });
        return rows.length ? `Spesa fatta #${code}:\n${rows.join('\n')}` : '';
    };

    const showNotice = (text, withShare) => {
        notice.textContent = text;
        notice.hidden = !text;
        share.hidden = !withShare;
    };

    const refresh = () => {
        let sum = 0;
        items.forEach((item) => {
            const state = itemState(item);
            const open = item === openItem;
            item.element.classList.toggle('spesa__voce--valida', state === 'valida');
            item.element.classList.toggle('spesa__voce--avviso', state === 'avviso');
            item.box.setAttribute('aria-checked', String(item.checked));
            item.title.textContent = item.added ? (clean(item.name) || 'Voce nuova') : item.name;
            item.detail.textContent = summary(item, state);
            item.detail.hidden = !item.detail.textContent;
            item.head.setAttribute('aria-expanded', String(open));
            item.body.hidden = !open;
            if (state !== 'libera') {
                sum += itemAmount(item);
            }
        });
        groups.forEach((group) => {
            const members = items.filter((item) => item.category === group.category);
            const done = members.filter((item) => itemState(item) === 'valida').length;
            group.count.textContent = `${done} di ${members.length}`;
            group.details.hidden = members.length === 0;
        });
        total.textContent = money(sum);
    };

    const changed = () => {
        showNotice('');
        save();
        refresh();
    };

    // Un solo form aperto alla volta: gli altri si richiudono sul loro riepilogo.
    // Il cursore va nel primo campo solo per le voci nuove, che vogliono subito un nome:
    // sulle altre la tastiera coprirebbe la lista a chi vuole soltanto spuntare.
    const open = (item, focus) => {
        openItem = item;
        changed();
        if (item && focus && item.added) {
            item.body.querySelector('input').focus();
        }
    };

    const field = (target, key, placeholder, numeric) => {
        const input = document.createElement('input');
        input.className = `spesa__campo spesa__campo--${key}`;
        input.value = target[key];
        input.placeholder = placeholder;
        input.setAttribute('aria-label', placeholder);
        input.autocomplete = 'off';
        if (numeric) {
            input.inputMode = 'decimal';
        }
        input.addEventListener('input', () => {
            target[key] = input.value;
            changed();
        });
        return input;
    };

    const textButton = (className, label, action) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = label;
        button.addEventListener('click', action);
        return button;
    };

    const renderLine = (item, line) => {
        const element = document.createElement('div');
        element.className = 'spesa__acquisto';

        const mode = textButton('spesa__modo', '', () => {
            line.whole = !line.whole;
            showMode();
            changed();
        });
        const showMode = () => {
            mode.textContent = line.whole ? 'in tutto' : 'l\'uno';
            mode.setAttribute('aria-label', line.whole
                ? 'Prezzo in tutto: tocca per passare a l\'uno'
                : 'Prezzo l\'uno: tocca per passare a in tutto');
        };
        showMode();

        const numbers = document.createElement('div');
        numbers.className = 'spesa__numeri';
        numbers.append(field(line, 'quantity', 'Quantità', true), field(line, 'price', 'Prezzo', true), mode);

        if (item.lines.indexOf(line) > 0) {
            const remove = textButton('spesa__togli', '×', () => {
                item.lines.splice(item.lines.indexOf(line), 1);
                renderBody(item);
                changed();
            });
            remove.setAttribute('aria-label', 'Togli questo prezzo');
            numbers.classList.add('spesa__numeri--con-togli');
            numbers.append(remove);
        }

        element.append(numbers, field(line, 'description', 'Descrizione (facoltativa)', false));
        return element;
    };

    function renderBody(item) {
        const parts = [];
        if (item.added) {
            parts.push(field(item, 'name', 'Nome della voce', false));
        }
        item.lines.forEach((line) => {
            parts.push(renderLine(item, line));
        });

        const extras = document.createElement('div');
        extras.className = 'spesa__extra';
        extras.append(textButton('spesa__altro', '+ altro prezzo', () => {
            item.lines.push(blankLine());
            renderBody(item);
            changed();
            const lines = item.body.querySelectorAll('.spesa__acquisto');
            lines[lines.length - 1].querySelector('input').focus();
        }));

        if (item.added) {
            extras.append(textButton('spesa__altro spesa__altro--tenue', 'Togli la voce', () => {
                items.splice(items.indexOf(item), 1);
                item.element.remove();
                open(null, false);
            }));
        } else {
            const still = document.createElement('label');
            still.className = 'spesa__ancora';
            const box = document.createElement('input');
            box.type = 'checkbox';
            box.checked = item.still;
            box.addEventListener('change', () => {
                item.still = box.checked;
                changed();
            });
            still.append(box, ' ne serve ancora');
            extras.append(still);
        }

        parts.push(extras);
        item.body.replaceChildren(...parts);
    }

    const renderItem = (item) => {
        const element = document.createElement('div');
        element.className = 'spesa__voce';

        // La casella spunta e apre il form; ritoccarla toglie la voce dall'invio.
        const box = document.createElement('button');
        box.type = 'button';
        box.className = 'spesa__spunta';
        box.setAttribute('role', 'checkbox');
        box.setAttribute('aria-label', 'Comprato');
        box.addEventListener('click', () => {
            item.checked = !item.checked;
            open(item.checked ? item : (openItem === item ? null : openItem), item.checked);
        });

        // Il nome apre o richiude il form; su una voce non spuntata vale come la casella.
        const head = document.createElement('button');
        head.type = 'button';
        head.className = 'spesa__intesta';
        head.addEventListener('click', () => {
            if (!item.checked) {
                item.checked = true;
                open(item, true);
            } else {
                open(openItem === item ? null : item, openItem !== item);
            }
        });

        const title = document.createElement('span');
        title.className = 'spesa__nome';
        const detail = document.createElement('span');
        detail.className = 'spesa__riepilogo';
        head.append(title);
        if (item.note) {
            const note = document.createElement('span');
            note.className = 'spesa__nota';
            note.textContent = item.note;
            head.append(note);
        }
        head.append(detail);

        const top = document.createElement('div');
        top.className = 'spesa__testa';
        top.append(box, head);

        const body = document.createElement('div');
        body.className = 'spesa__corpo';

        element.append(top, body);
        Object.assign(item, { element, box, head, title, detail, body });
        renderBody(item);
        return element;
    };

    const renderGroup = (category) => {
        const details = document.createElement('details');
        details.className = 'cassetto spesa__gruppo';
        details.open = !closed.includes(category);

        const heading = document.createElement('summary');
        const name = document.createElement('span');
        name.className = 'spesa__categoria';
        name.textContent = category;
        const count = document.createElement('span');
        count.className = 'spesa__conta';
        heading.append(name, count);

        const body = document.createElement('div');
        body.className = 'spesa__elenco';
        details.append(heading, body);
        details.addEventListener('toggle', () => {
            closed = closed.filter((entry) => entry !== category);
            if (!details.open) {
                closed.push(category);
            }
            save();
        });

        const group = { category, details, body, count };
        groups.push(group);
        container.append(details);
        return group;
    };

    const render = (listed) => {
        const saved = readSaved();
        const savedItems = Array.isArray(saved.items) ? saved.items : [];
        code = typeof saved.code === 'string' && saved.code ? saved.code : newCode();
        closed = Array.isArray(saved.closed) ? saved.closed.map(String) : [];
        openItem = null;

        items = listed.map((entry) => {
            const name = String(entry[0]);
            const previous = savedItems.find((candidate) => !candidate.added && candidate.name === name) || {};
            return {
                name,
                note: String(entry[1] || ''),
                category: String(entry[2] || '') || 'Senza categoria',
                added: false,
                checked: Boolean(previous.checked),
                still: Boolean(previous.still),
                lines: restoredLines(previous.lines)
            };
        });
        savedItems.filter((candidate) => candidate.added).forEach((candidate) => {
            items.push({
                name: String(candidate.name || ''),
                note: '',
                category: addedCategory,
                added: true,
                checked: Boolean(candidate.checked),
                still: false,
                lines: restoredLines(candidate.lines)
            });
        });

        groups = [];
        container.replaceChildren();
        const categories = [];
        items.filter((item) => !item.added).forEach((item) => {
            if (!categories.includes(item.category)) {
                categories.push(item.category);
            }
        });
        categories.concat(addedCategory).forEach((category) => {
            const group = renderGroup(category);
            items.filter((item) => item.category === category).forEach((item) => {
                group.body.append(renderItem(item));
            });
        });
        save();
        refresh();
    };

    // Senza una lista valida nel link la pagina spiega soltanto a cosa serve.
    const fail = (text) => {
        status.textContent = text;
        status.hidden = !text;
        about.hidden = false;
        form.hidden = true;
        bar.hidden = true;
    };

    const load = () => {
        const fragment = location.hash.slice(1);
        if (!fragment) {
            fail('');
            return;
        }
        let data;
        try {
            data = decodeLink(fragment);
        } catch (error) {
            fail('Il link non è leggibile: chiedi al bot un link nuovo.');
            return;
        }
        bot = data.b;
        storageKey = storagePrefix + hash(fragment);
        status.hidden = true;
        about.hidden = true;
        form.hidden = false;
        bar.hidden = false;
        showNotice('');
        render(data.v);
    };

    const reveal = (item) => {
        item.element.closest('details').open = true;
        open(item, true);
        item.element.scrollIntoView({ block: 'center' });
    };

    const send = () => {
        const message = buildMessage();
        if (!message) {
            showNotice('Spunta almeno una voce.');
            return;
        }
        if (message.length > messageLimit) {
            showNotice('Troppi acquisti per un solo messaggio: togli la spunta a una parte e inviala dopo, con un link nuovo.');
            return;
        }
        sentMessage = message;
        showNotice('Si apre la chat con il messaggio già scritto: invialo. Per segnare altri acquisti, prima svuota il modulo.', true);
        // Con la chat del bot già aperta l'app scarta il testo, a meno che il link
        // non indichi anche un messaggio: per questo c'è post=1.
        location.href = `tg://resolve?domain=${encodeURIComponent(bot)}&post=1&text=${encodeURIComponent(message)}`;
        // Il modulo ha finito: prova a chiudere la pagina, per non lasciarla aperta
        // dietro la chat. Dove il browser non lo permette non succede nulla.
        setTimeout(() => {
            window.close();
        }, 800);
    };

    document.querySelector('[data-aggiungi]').addEventListener('click', () => {
        const item = {
            name: '', note: '', category: addedCategory, added: true, checked: true, still: false, lines: [blankLine()]
        };
        const group = groups.find((entry) => entry.category === addedCategory);
        items.push(item);
        group.body.append(renderItem(item));
        reveal(item);
    });

    document.querySelector('[data-svuota]').addEventListener('click', () => {
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            // Niente da cancellare.
        }
        load();
    });

    document.querySelector('[data-invia]').addEventListener('click', () => {
        const warnings = items.filter((item) => itemState(item) === 'avviso');
        if (!warnings.length) {
            send();
            return;
        }
        const names = warnings.map((item) => clean(item.name) || 'Voce nuova').join(', ');
        const hint = 'Puoi inviare lo stesso: risulteranno comprate, e quello che manca resta vuoto.';
        confirmationText.textContent = warnings.length === 1
            ? `A «${names}» mancano quantità o prezzo, oppure un numero non è scritto in cifre. ${hint}`
            : `A queste voci mancano quantità o prezzo, oppure un numero non è scritto in cifre: ${names}. ${hint}`;
        confirmation.showModal();
    });

    document.querySelector('[data-correggi]').addEventListener('click', () => {
        confirmation.close();
        reveal(items.find((item) => itemState(item) === 'avviso'));
    });

    // Ripiego: la schermata «condividi» dell'app, dove la chat si sceglie a mano.
    share.addEventListener('click', () => {
        location.href = `tg://msg?text=${encodeURIComponent(sentMessage)}`;
    });

    sendAnyway.addEventListener('click', () => {
        confirmation.close();
        send();
    });

    window.addEventListener('hashchange', load);
    load();
})();
