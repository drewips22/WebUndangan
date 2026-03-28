// js/main.js

// Initialize Animate On Scroll (AOS)
AOS.init({
    once: true, // whether animation should happen only once - while scrolling down
});

// BUKA UNDANGAN & MUSIC CONTROL
const btnOpen = document.getElementById('btn-open');
const coverOverlay = document.getElementById('cover-overlay');
const mainContent = document.querySelector('main');
const body = document.body;
const btnMusic = document.getElementById('btn-music');
const bgMusic = document.getElementById('bg-music');
const musicControl = document.getElementById('music-control');
const volumeSlider = document.getElementById('volume-slider');
let isMusicPlaying = false;

// Set volume awal
bgMusic.volume = 0.7;

// Volume slider control
volumeSlider.addEventListener('input', () => {
    bgMusic.volume = volumeSlider.value;
});

// Event ketika tombol Buka Undangan ditekan
btnOpen.addEventListener('click', () => {
    coverOverlay.classList.add('slide-up');
    body.classList.remove('locked');
    mainContent.classList.add('show');
    musicControl.classList.remove('hidden');

    try {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
        }).catch(err => {
            console.log("Audio playback failed atau source tidak ditemukan: ", err);
            btnMusic.classList.remove('playing');
            btnMusic.innerHTML = '<i class="bi bi-disc"></i>';
        });
    } catch (e) {
        console.error("Audio error: ", e);
    }
});

// Event Music Button Play/Pause
btnMusic.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        btnMusic.classList.remove('playing');
        isMusicPlaying = false;
    } else {
        bgMusic.play().catch(e => console.log(e));
        btnMusic.classList.add('playing');
        isMusicPlaying = true;
    }
});

// MOBILE TOUCH SCROLL SNAP
// CSS scroll-snap tidak reliable di mobile Safari/Android, gunakan JS sebagai fallback
const snapSections = Array.from(document.querySelectorAll('section, footer'));
let touchStartY = 0;
let snapCurrentIndex = 0;
let isSnapping = false;

function isMobileDevice() {
    return window.innerWidth <= 900;
}

function snapToSection(index) {
    if (index < 0 || index >= snapSections.length) return;
    snapCurrentIndex = index;
    isSnapping = true;
    snapSections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { isSnapping = false; }, 900);
}

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!isMobileDevice() || isSnapping) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) < 40) return; // ignore tiny swipes

    if (diff > 0) {
        snapToSection(snapCurrentIndex + 1); // swipe up → next
    } else {
        snapToSection(snapCurrentIndex - 1); // swipe down → prev
    }
}, { passive: true });

// COUNTDOWN TIMER
// Tanggal target: 22 Feb 2029 (08:00 WIB)
const countDownDate = new Date("Feb 22, 2029 08:00:00").getTime();

const x = setInterval(function () {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    // Kalkulasi Waktu
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Render ke HTML
    document.getElementById("days").innerHTML = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerHTML = hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerHTML = minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerHTML = seconds < 10 ? "0" + seconds : seconds;

    // Jika lewat dari waktu target
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
        // Bisa mengubah teks acara berlangsung
    }
}, 1000);

// COPY TEXT FEATURE (Untuk Digital Gift)
function copyText(elementId) {
    const textToCopy = document.getElementById(elementId).innerText;

    // Modern ClipBoard API
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Nomor rekening berhasil disalin: " + textToCopy);
    }).catch(err => {
        console.error('Gagal menyalin: ', err);
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert("Nomor rekening berhasil disalin: " + textToCopy);
    });
}

// GOOGLE SHEETS INTEGRATION FOR RSVP
const scriptURL = 'https://script.google.com/macros/s/AKfycbx-f3qzB1l5DcCMrglh3U4U7ITxNwJJrzRplN2Wd1DOD2GsO0ZFVNjxtqYzm_FEBfc3zQ/exec';
const formRsvp = document.forms['Form Undangan'];
const btnSubmit = document.getElementById('btn-submit-rsvp');
const wishesContainer = document.getElementById('wishes-container');

// Load & render ucapan dari Google Sheets
function loadWishes() {
    if (!wishesContainer) return;
    wishesContainer.innerHTML = '<p class="loading-wishes">Memuat ucapan...</p>';

    fetch(scriptURL)
        .then(res => res.json())
        .then(json => {
            if (json.result !== 'success' || json.data.length === 0) {
                wishesContainer.innerHTML = '<p class="loading-wishes">Belum ada ucapan. Jadilah yang pertama!</p>';
                return;
            }
            wishesContainer.innerHTML = '';
            json.data.forEach(row => {
                const badgeClass = row['Kehadiran'] === 'Hadir' ? 'badge-hadir' : 'badge-tidak-hadir';
                const item = document.createElement('div');
                item.className = 'wish-item';
                item.innerHTML = `
                    <div class="wish-header">
                        <h5>${row['Nama'] || 'Anonim'}</h5>
                        <span class="${badgeClass}">${row['Kehadiran'] || '-'}</span>
                    </div>
                    <p class="wish-timestamp">${row['Timestamp'] || ''}</p>
                    <p>${row['Ucapan'] || ''}</p>
                `;
                wishesContainer.appendChild(item);
            });
        })
        .catch(err => {
            wishesContainer.innerHTML = '<p class="loading-wishes">Gagal memuat ucapan.</p>';
            console.error(err);
        });
}

// Panggil loadWishes saat halaman pertama kali dibuka
loadWishes();

if (formRsvp) {
    formRsvp.addEventListener('submit', e => {
        e.preventDefault();

        btnSubmit.innerHTML = 'Mengirim...';
        btnSubmit.disabled = true;

        fetch(scriptURL, { method: 'POST', body: new FormData(formRsvp) })
            .then(response => {
                btnSubmit.innerHTML = 'Terkirim!';
                alert('Terima kasih! Kehadiran dan pesan Anda telah dicatat.');
                formRsvp.reset();
                // Reload ucapan agar langsung muncul
                loadWishes();
                setTimeout(() => {
                    btnSubmit.innerHTML = 'Kirim Ucapan';
                    btnSubmit.disabled = false;
                }, 3000);
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert('Gagal mengirim data, silakan coba lagi sesaat lagi.');
                btnSubmit.innerHTML = 'Kirim Ucapan';
                btnSubmit.disabled = false;
            });
    });
}
