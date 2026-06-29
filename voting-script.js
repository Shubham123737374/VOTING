// 🧹 Force English on Page Load
document.cookie = "googtrans=/en/en; path=/; domain=" + window.location.hostname;
document.cookie = "googtrans=/en/en; path=/";

// 🌐 Custom Translator Toggle Logic
let isHindi = false;
document.getElementById('customTranslateBtn').addEventListener('click', function() {
    let selectField = document.querySelector('.goog-te-combo');
    if(selectField) {
        if(!isHindi) {
            selectField.value = 'hi';
            selectField.dispatchEvent(new Event('change'));
            this.innerHTML = '🌐 English';
            isHindi = true;
        } else {
            // Revert back to English
            selectField.value = 'en'; 
            selectField.dispatchEvent(new Event('change'));
            this.innerHTML = '🌐 Hindi';
            isHindi = false;
        }
    } else {
        alert("Translator is loading, please wait a second...");
    }
});


// 🚀 FIREBASE SETUP (Your Original Keys Added - DO NOT CHANGE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDDNIKNSmhU79q_UXwP1wR-c88CCYMETxs",
    authDomain: "bbjp-vote.firebaseapp.com",
    projectId: "bbjp-vote",
    storageBucket: "bbjp-vote.firebasestorage.app",
    messagingSenderId: "408980373851",
    appId: "1:408980373851:web:2916222e7fb180fd7b9a7e",
    measurementId: "G-07K9E9T5RL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

// 🔐 Global Login State
let isLoggedIn = false; 

// Google Login Function
document.getElementById('googleLoginBtn').addEventListener('click', function() {
    signInWithPopup(auth, provider)
    .then((result) => {
        isLoggedIn = true;
        this.innerText = `✅ Hi, ${result.user.displayName.split(' ')[0]}`;
        this.style.backgroundColor = "#138808"; // Turns green on success
        alert("Login Successful! You are ready to vote.");
    }).catch((error) => {
        alert("Login Failed. Please make sure you are running this on a live server (127.0.0.1). Error: " + error.message);
    });
});

// 📊 Main Voting Chart Setup
const ctxMain = document.getElementById('mainVotingChart').getContext('2d');
const mainChart = new Chart(ctxMain, {
    type: 'bar',
    data: {
        labels: ['BJP', 'Congress', 'AAP', 'BSP', 'CJP 🪳', 'NOTA 🛑', 'BBJP 👑'],
        datasets: [{
            label: 'Total Votes (Live Support)',
            data: [0, 0, 0, 0, 0, 0, 0], 
            backgroundColor: ['#ff9933', '#19aa52', '#0066a4', '#22409a', '#8d6e63', '#666666', '#FF9933'],
            borderRadius: 5
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#333' } } },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#666' }, grid: { color: '#e5e7eb' } },
            x: { ticks: { color: '#666' }, grid: { display: false } }
        }
    }
});

// 📈 Detailed Analysis Chart Setup
const ctxDetailed = document.getElementById('detailedChart').getContext('2d');
const detailedChart = new Chart(ctxDetailed, {
    type: 'bar',
    data: {
        labels: ['BJP', 'Congress', 'AAP', 'BSP', 'CJP', 'BBJP'],
        datasets: [
            { label: 'Likes', data: [0,0,0,0,0,0], backgroundColor: '#1565c0' },
            { label: 'Dislikes', data: [0,0,0,0,0,0], backgroundColor: '#4b5563' },
            { label: 'Corruption', data: [0,0,0,0,0,0], backgroundColor: '#dc2626' },
            { label: 'Fake Promises', data: [0,0,0,0,0,0], backgroundColor: '#d97706' }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#333' } } },
        scales: {
            y: { beginAtZero: true, ticks: { color: '#666' }, grid: { color: '#e5e7eb' } },
            x: { ticks: { color: '#666' }, grid: { display: false } }
        }
    }
});

// 🖲️ Voting & Logic Handler
window.castVote = function(partyName, actionType) {
    if (!isLoggedIn) {
        alert('⚠️ Please click "Login to Vote" at the top before submitting your reaction!');
        return;
    }

    if (actionType === 'vote' && localStorage.getItem('hasVoted') === 'true') {
        alert('⚠️ You have already submitted your final vote! You cannot vote again.');
        return;
    }

    if (actionType === 'vote') {
        localStorage.setItem('hasVoted', 'true');
        alert(`Thank you! Your VOTE for ${partyName} has been recorded.`);
    } else {
        alert(`Your '${actionType}' reaction for ${partyName} has been recorded.`);
    }

    console.log(`Action: ${actionType} recorded for Party: ${partyName}`);
};