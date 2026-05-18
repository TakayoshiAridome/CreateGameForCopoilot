/**
 * Digital Clock - Multiple Time Zones
 * Real-time clock display for different time zones worldwide
 */

// Available time zones
const TIMEZONES = [
    // North America
    { name: 'New York (EST/EDT)', zone: 'America/New_York', emoji: '🗽' },
    { name: 'Chicago (CST/CDT)', zone: 'America/Chicago', emoji: '🌊' },
    { name: 'Denver (MST/MDT)', zone: 'America/Denver', emoji: '⛰️' },
    { name: 'Los Angeles (PST/PDT)', zone: 'America/Los_Angeles', emoji: '🌴' },
    { name: 'Anchorage (AKST/AKDT)', zone: 'America/Anchorage', emoji: '🐻' },
    { name: 'Honolulu (HST)', zone: 'Pacific/Honolulu', emoji: '🌺' },
    
    // South America
    { name: 'Mexico City (CST/CDT)', zone: 'America/Mexico_City', emoji: '🌮' },
    { name: 'São Paulo (BRT/BRST)', zone: 'America/Sao_Paulo', emoji: '🇧🇷' },
    { name: 'Buenos Aires (ART)', zone: 'America/Argentina/Buenos_Aires', emoji: '💃' },
    
    // Europe
    { name: 'London (GMT/BST)', zone: 'Europe/London', emoji: '🇬🇧' },
    { name: 'Paris (CET/CEST)', zone: 'Europe/Paris', emoji: '🗼' },
    { name: 'Berlin (CET/CEST)', zone: 'Europe/Berlin', emoji: '🇩🇪' },
    { name: 'Madrid (CET/CEST)', zone: 'Europe/Madrid', emoji: '🇪🇸' },
    { name: 'Moscow (MSK)', zone: 'Europe/Moscow', emoji: '🕌' },
    { name: 'Athens (EET/EEST)', zone: 'Europe/Athens', emoji: '🏛️' },
    
    // Middle East & Africa
    { name: 'Dubai (GST)', zone: 'Asia/Dubai', emoji: '🏙️' },
    { name: 'Cairo (EET/EEST)', zone: 'Africa/Cairo', emoji: '🐪' },
    { name: 'Johannesburg (SAST)', zone: 'Africa/Johannesburg', emoji: '🦁' },
    { name: 'Lagos (WAT)', zone: 'Africa/Lagos', emoji: '🥁' },
    
    // Asia
    { name: 'Istanbul (EET/EEST)', zone: 'Europe/Istanbul', emoji: '🕌' },
    { name: 'New Delhi (IST)', zone: 'Asia/Kolkata', emoji: '🇮🇳' },
    { name: 'Bangkok (ICT)', zone: 'Asia/Bangkok', emoji: '🏯' },
    { name: 'Hong Kong (HKT)', zone: 'Asia/Hong_Kong', emoji: '🏮' },
    { name: 'Shanghai (CST)', zone: 'Asia/Shanghai', emoji: '🇨🇳' },
    { name: 'Singapore (SGT)', zone: 'Asia/Singapore', emoji: '🌴' },
    { name: 'Tokyo (JST)', zone: 'Asia/Tokyo', emoji: '🗾' },
    { name: 'Seoul (KST)', zone: 'Asia/Seoul', emoji: '🇰🇷' },
    { name: 'Sydney (AEDT/AEST)', zone: 'Australia/Sydney', emoji: '🦘' },
    { name: 'Auckland (NZDT/NZST)', zone: 'Pacific/Auckland', emoji: '🇳🇿' },
];

// Default time zones to display
const DEFAULT_TIMEZONES = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
];

let currentTimezones = [...DEFAULT_TIMEZONES];

/**
 * Initialize the clock on page load
 */
window.addEventListener('DOMContentLoaded', () => {
    populateTimezoneSelect();
    renderClocks();
    updateClocks();
    setInterval(updateClocks, 1000);
});

/**
 * Populate the timezone select dropdown
 */
function populateTimezoneSelect() {
    const select = document.getElementById('timezone-select');
    
    TIMEZONES.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.zone;
        option.textContent = `${tz.emoji} ${tz.name}`;
        select.appendChild(option);
    });
}

/**
 * Add time zone from modal
 */
function addTimeZone() {
    const select = document.getElementById('timezone-select');
    const zone = select.value;
    
    if (!zone) {
        alert('Please select a time zone');
        return;
    }
    
    if (!currentTimezones.includes(zone)) {
        currentTimezones.push(zone);
        renderClocks();
        closeModal();
        saveToLocalStorage();
    } else {
        alert('This time zone is already added');
    }
}

/**
 * Remove time zone
 */
function removeTimeZone(zone) {
    currentTimezones = currentTimezones.filter(z => z !== zone);
    renderClocks();
    saveToLocalStorage();
}

/**
 * Reset to default time zones
 */
function resetToDefault() {
    currentTimezones = [...DEFAULT_TIMEZONES];
    renderClocks();
    saveToLocalStorage();
}

/**
 * Render all clock cards
 */
function renderClocks() {
    const container = document.getElementById('clocks-container');
    container.innerHTML = '';
    
    currentTimezones.forEach(zone => {
        const tzInfo = TIMEZONES.find(tz => tz.zone === zone);
        if (!tzInfo) return;
        
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.id = `clock-${zone}`;
        card.innerHTML = `
            <div class="timezone-label">${tzInfo.emoji} TIME ZONE</div>
            <div class="timezone-name">${tzInfo.name}</div>
            <div class="digital-time" data-zone="${zone}">00:00:00</div>
            <div class="time-format">
                <div class="am-pm" data-ampm="${zone}">AM</div>
            </div>
            <div class="date-display" data-date="${zone}">Monday, January 1, 2024</div>
            <div class="clock-info">
                <div class="offset-display" data-offset="${zone}">UTC+0</div>
                <button class="remove-btn" onclick="removeTimeZone('${zone}')">Remove</button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Update all clocks
 */
function updateClocks() {
    currentTimezones.forEach(zone => {
        updateClock(zone);
    });
}

/**
 * Update single clock
 */
function updateClock(zone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    const formatter24 = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const parts24 = formatter24.formatToParts(now);
    
    // Extract time components
    let hour = '', minute = '', second = '', period = '';
    let weekday = '', month = '', day = '', year = '';
    
    parts.forEach(part => {
        if (part.type === 'hour') hour = part.value;
        if (part.type === 'minute') minute = part.value;
        if (part.type === 'second') second = part.value;
        if (part.type === 'dayPeriod') period = part.value;
        if (part.type === 'weekday') weekday = part.value;
        if (part.type === 'month') month = part.value;
        if (part.type === 'day') day = part.value;
        if (part.type === 'year') year = part.value;
    });
    
    // Update time display
    const timeElement = document.querySelector(`[data-zone="${zone}"]`);
    if (timeElement) {
        timeElement.textContent = `${hour}:${minute}:${second}`;
    }
    
    // Update AM/PM
    const ampmElement = document.querySelector(`[data-ampm="${zone}"]`);
    if (ampmElement) {
        ampmElement.textContent = period;
    }
    
    // Update date
    const dateElement = document.querySelector(`[data-date="${zone}"]`);
    if (dateElement) {
        dateElement.textContent = `${weekday}, ${month} ${day}, ${year}`;
    }
    
    // Update UTC offset
    const offsetElement = document.querySelector(`[data-offset="${zone}"]`);
    if (offsetElement) {
        const offset = getUTCOffset(zone);
        offsetElement.textContent = offset;
        
        // Add color classes
        offsetElement.className = 'offset-display';
        if (offset.includes('-')) {
            offsetElement.classList.add('behind');
        } else if (offset.includes('+')) {
            offsetElement.classList.add('ahead');
        }
    }
}

/**
 * Get UTC offset for a time zone
 */
function getUTCOffset(zone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const zoneTime = new Date(formatter.format(now));
    const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    
    const diff = (zoneTime - utcTime) / (1000 * 60 * 60);
    
    if (diff === 0) return 'UTC+0';
    if (diff > 0) return `UTC+${diff}`;
    return `UTC${diff}`;
}

/**
 * Open add time zone modal
 */
function addClockModal() {
    document.getElementById('modal').classList.remove('hidden');
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('timezone-select').value = '';
}

/**
 * Save current timezones to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('selectedTimezones', JSON.stringify(currentTimezones));
}

/**
 * Load timezones from localStorage
 */
function loadFromLocalStorage() {
    const saved = localStorage.getItem('selectedTimezones');
    if (saved) {
        try {
            currentTimezones = JSON.parse(saved);
        } catch (e) {
            currentTimezones = [...DEFAULT_TIMEZONES];
        }
    }
}

// Load saved timezones on page load
loadFromLocalStorage();

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
});
