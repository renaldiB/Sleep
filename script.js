let currentDate = new Date();
let selectedDate = null;
let sleepData = {};

try {
    const stored = localStorage.getItem('sleepyNanaData');
    if (stored) {
        sleepData = JSON.parse(stored);
    }
    console.log("Data dimuat:", Object.keys(sleepData).length, "entri");
} catch (e) {
    console.error("Gagal baca localStorage:", e);
    sleepData = {};
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;

    calendar.innerHTML = '';

    ['Min','Sen','Sel','Rab','Kam','Jum','Sab'].forEach(d => {
        const div = document.createElement('div');
        div.className = 'day-header';
        div.textContent = d;
        calendar.appendChild(div);
    });

    document.getElementById('month-year').textContent = 
        currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'day other-month';
        calendar.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayElem = document.createElement('div');
        dayElem.className = 'day';
        dayElem.textContent = day;

        if (sleepData[dateKey] !== undefined) {
            dayElem.classList.add('filled');
        } else {
            dayElem.classList.add('unfilled');
        }

        dayElem.onclick = () => openModal(dateKey);
        calendar.appendChild(dayElem);
    }

    updateStats();
}

function openModal(dateKey) {
    selectedDate = dateKey;
    const modal = document.getElementById('input-modal');
    const dateEl = document.getElementById('modal-date');
    const hoursEl = document.getElementById('sleep-hours');

    if (dateEl) {
        const [y, m, d] = dateKey.split('-');
        const monthName = new Date(y, m-1).toLocaleString('id-ID', { month: 'long' });
        dateEl.textContent = `${parseInt(d)} ${monthName} ${y}`;
    }

    if (hoursEl) {
        hoursEl.value = sleepData[dateKey] || '';
    }

    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('input-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.getElementById('sleep-hours').value = '';
}

function saveSleep() {
    const hoursInput = document.getElementById('sleep-hours');
    const hours = parseFloat(hoursInput?.value);

    if (isNaN(hours) || hours < 0 || hours > 24) {
        alert("Masukkan angka antara 0–24 ya~ ♡");
        return;
    }

    if (selectedDate) {
        sleepData[selectedDate] = hours;
        localStorage.setItem('sleepyNanaData', JSON.stringify(sleepData));
        closeModal();
        renderCalendar();
    }
}

function updateStats() {
    let debt = 0;
    let excess = 0;

    Object.values(sleepData).forEach(hours => {
        const diff = hours - 8;
        if (diff < 0) debt -= diff;   
        else excess += diff;
    });

    // Offset jika ada keduanya
    const offset = Math.min(debt, excess);
    debt -= offset;
    excess -= offset;

    document.getElementById('sleep-debt').textContent = debt.toFixed(1) + ' jam';
    document.getElementById('excess-sleep').textContent = excess.toFixed(1) + ' jam';
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

renderCalendar();