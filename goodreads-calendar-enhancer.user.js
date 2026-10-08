// ==UserScript==
// @name          Goodreads Review Calendar Enhancer
// @namespace     https://github.com/JClouseau42/
// @version       1.0.0
// @description   Injects interactive inline calendar pickers (Full Grid or Compact) into Goodreads review date fields with customizable theme settings.
// @author        JClouseau42
// @match         https://www.goodreads.com/*
// @match         https://goodreads.com/*
// @require       https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @run-at        document-end
// @license MIT
// ==/UserScript==

(function() {
    'use strict';

    console.log("Calendar Linker: Row-Targeted Script initialized...");

    // =========================================================================
    // ⚙️ TAMPERMONKEY PERSISTENT SETTINGS & MENU COMMANDS
    // =========================================================================
    let USE_DARK_MODE    = GM_getValue('USE_DARK_MODE', false);
    let USE_FULL_CALENDAR = GM_getValue('USE_FULL_CALENDAR', true);

    function registerMenuOptions() {
        // Clear previous menu items before re-registering
        if (typeof GM_registerMenuCommand !== 'undefined') {
            const darkStatus = USE_DARK_MODE ? '✅ Enabled' : '❌ Disabled';
            const gridStatus = USE_FULL_CALENDAR ? '✅ Full Grid' : '⚡ Compact HTML5';

            GM_registerMenuCommand(`Toggle Dark Theme (Currently: ${darkStatus})`, () => {
                GM_setValue('USE_DARK_MODE', !USE_DARK_MODE);
                location.reload();
            });

            GM_registerMenuCommand(`Toggle Layout Style (Currently: ${gridStatus})`, () => {
                GM_setValue('USE_FULL_CALENDAR', !USE_FULL_CALENDAR);
                location.reload();
            });
        }
    }

    registerMenuOptions();

    // =========================================================================
    // 🎨 STYLESHEET INJECTION
    // =========================================================================
    if (USE_FULL_CALENDAR && !document.getElementById('flatpickr-style-injection')) {
        const link = document.createElement("link");
        link.id = "flatpickr-style-injection";
        link.rel = "stylesheet";
        link.href = USE_DARK_MODE
            ? "https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/dark.css"
            : "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";
        document.head.appendChild(link);
    }

    // Theme styling profiles
    const theme = USE_DARK_MODE ? {
        background: '#1e1e1e',
        border: '#444444',
        textColor: '#ffffff',
        labelColor: '#bbbbbb',
        inputBg: '#333333',
        inputBorder: '#555555',
        colorScheme: 'dark'
    } : {
        background: '#f4f1ea',
        border: '#d8d4c7',
        textColor: '#333333',
        labelColor: '#555555',
        inputBg: '#ffffff',
        inputBorder: '#cccccc',
        colorScheme: 'light'
    };

    // Helper to force React select element value state update
    function setNativeSelectValue(element, value) {
        if (!element) return;
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
        valueSetter.call(element, parseInt(value, 10).toString());
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // =========================================================================
    // 🔍 MULTI-ROW SCANNER & INJECTOR
    // =========================================================================
    function processDateRows() {
        const yearSelects = Array.from(document.querySelectorAll('select[aria-label="Year"]:not(.flatpickr-monthDropdown-months)'));
        const monthSelects = Array.from(document.querySelectorAll('select[aria-label="Month"]:not(.flatpickr-monthDropdown-months)'));
        const daySelects = Array.from(document.querySelectorAll('select[aria-label="Day"]:not(.flatpickr-monthDropdown-months)'));

        for (let i = 0; i < yearSelects.length; i += 2) {
            const startY = yearSelects[i];
            const startM = monthSelects[i];
            const startD = daySelects[i];

            const finishY = yearSelects[i + 1];
            const finishM = monthSelects[i + 1];
            const finishD = daySelects[i + 1];

            if (!startY || !startM || !startD) continue;

            let rowContainer = startY.parentElement;
            while (rowContainer && rowContainer !== document.body) {
                if (!finishY || rowContainer.contains(finishY)) {
                    break;
                }
                rowContainer = rowContainer.parentElement;
            }

            if (!rowContainer || rowContainer === document.body) continue;

            if (rowContainer.hasAttribute('data-gr-row-bound')) continue;
            rowContainer.setAttribute('data-gr-row-bound', 'true');

            rowContainer.style.flexWrap = 'wrap';

            const startedDropdowns = { yearEl: startY, monthEl: startM, dayEl: startD };
            const finishedDropdowns = { yearEl: finishY, monthEl: finishM, dayEl: finishD };

            function getRowDate(dropdowns) {
                try {
                    if (dropdowns.yearEl && dropdowns.monthEl && dropdowns.dayEl) {
                        const y = parseInt(dropdowns.yearEl.value, 10);
                        const m = parseInt(dropdowns.monthEl.value, 10) - 1;
                        const d = parseInt(dropdowns.dayEl.value, 10);

                        if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11 && !isNaN(d) && d > 0) {
                            return new Date(y, m, d);
                        }
                    }
                } catch(e) {}
                return new Date();
            }

            const defaultStartedDate = getRowDate(startedDropdowns);
            const defaultFinishedDate = getRowDate(finishedDropdowns);

            const visualPicker = document.createElement('div');
            visualPicker.className = 'gr-custom-calendar-row-card';
            visualPicker.style.cssText = `
                flex-basis: 100%;
                width: fit-content;
                margin-top: 12px;
                margin-bottom: 20px;
                padding: 14px;
                background: ${theme.background};
                border: 1px solid ${theme.border};
                border-radius: 6px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 20px;
                font-family: sans-serif;
                color: ${theme.textColor};
                box-shadow: 0 4px 8px rgba(0,0,0, ${USE_DARK_MODE ? '0.4' : '0.1'});
            `;

            const uniqueId = `row-${i / 2}-${Date.now()}`;
            const startCalId = `inline-started-calendar-${uniqueId}`;
            const finishCalId = `inline-finished-calendar-${uniqueId}`;

            if (USE_FULL_CALENDAR) {
                visualPicker.innerHTML = `
                    <div>
                        <label style="display:block; font-size:11px; text-transform:uppercase; color:${theme.labelColor}; margin-bottom:8px; font-weight:bold;">Date Started</label>
                        <div id="${startCalId}"></div>
                    </div>
                    <div>
                        <label style="display:block; font-size:11px; text-transform:uppercase; color:${theme.labelColor}; margin-bottom:8px; font-weight:bold;">Date Finished</label>
                        <div id="${finishCalId}"></div>
                    </div>
                `;
            } else {
                const formatDateForInput = (d) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const startInputId = `ui-started-date-${uniqueId}`;
                const finishInputId = `ui-finished-date-${uniqueId}`;

                visualPicker.innerHTML = `
                    <div>
                        <label style="display:block; font-size:11px; text-transform:uppercase; color:${theme.labelColor}; margin-bottom:4px; font-weight:bold;">Date Started</label>
                        <input type="date" id="${startInputId}" value="${formatDateForInput(defaultStartedDate)}" style="background:${theme.inputBg}; color:${theme.textColor}; border:1px solid ${theme.inputBorder}; padding:5px; border-radius:4px; color-scheme: ${theme.colorScheme};">
                    </div>
                    <div>
                        <label style="display:block; font-size:11px; text-transform:uppercase; color:${theme.labelColor}; margin-bottom:4px; font-weight:bold;">Date Finished</label>
                        <input type="date" id="${finishInputId}" value="${formatDateForInput(defaultFinishedDate)}" style="background:${theme.inputBg}; color:${theme.textColor}; border:1px solid ${theme.inputBorder}; padding:5px; border-radius:4px; color-scheme: ${theme.colorScheme};">
                    </div>
                `;
            }

            rowContainer.appendChild(visualPicker);

            function syncRowDateChoice(dropdowns, dateSourceValue, isObject = false) {
                let year, month, day;
                if (isObject && dateSourceValue) {
                    year = dateSourceValue.getFullYear();
                    month = dateSourceValue.getMonth() + 1;
                    day = dateSourceValue.getDate();
                } else if (dateSourceValue) {
                    [year, month, day] = dateSourceValue.split('-');
                } else {
                    return;
                }

                if (dropdowns.yearEl && dropdowns.monthEl && dropdowns.dayEl) {
                    setNativeSelectValue(dropdowns.yearEl, year);
                    setNativeSelectValue(dropdowns.monthEl, month);
                    setNativeSelectValue(dropdowns.dayEl, day);
                }
            }

            if (USE_FULL_CALENDAR && typeof flatpickr !== 'undefined') {
                flatpickr(`#${startCalId}`, {
                    inline: true,
                    defaultDate: defaultStartedDate,
                    onChange: function(selectedDates) {
                        if (selectedDates.length > 0) syncRowDateChoice(startedDropdowns, selectedDates[0], true);
                    }
                });

                if (finishY) {
                    flatpickr(`#${finishCalId}`, {
                        inline: true,
                        defaultDate: defaultFinishedDate,
                        onChange: function(selectedDates) {
                            if (selectedDates.length > 0) syncRowDateChoice(finishedDropdowns, selectedDates[0], true);
                        }
                    });
                }
            } else if (!USE_FULL_CALENDAR) {
                const startIn = visualPicker.querySelector('input[id^="ui-started-date"]');
                const finishIn = visualPicker.querySelector('input[id^="ui-finished-date"]');

                if (startIn) {
                    startIn.addEventListener('change', (e) => {
                        syncRowDateChoice(startedDropdowns, e.target.value, false);
                    });
                }
                if (finishIn && finishY) {
                    finishIn.addEventListener('change', (e) => {
                        syncRowDateChoice(finishedDropdowns, e.target.value, false);
                    });
                }
            }
        }
    }

    // =========================================================================
    // 🔄 DOM MONITORING
    // =========================================================================
    setInterval(() => {
        document.querySelectorAll('.gr-custom-calendar-row-card').forEach(card => {
            const parentRow = card.closest('[data-gr-row-bound]');
            if (!parentRow || !document.body.contains(parentRow)) {
                card.remove();
            }
        });

        processDateRows();
    }, 600);

})();
