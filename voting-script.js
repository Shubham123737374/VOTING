// 🧹 Force English on Page Load
document.cookie = "googtrans=/en/en; path=/; domain=" + window.location.hostname;
document.cookie = "googtrans=/en/en; path=/";

// 🌐 Custom Translator Toggle Logic
let isHindi = false;
document.getElementById('customTranslateBtn').addEventListener('click', function(e) {
    e.preventDefault();
    let selectField = document.querySelector('.goog-te-combo');
    if(selectField) {
        if(!isHindi) {
            selectField.value = 'hi';
            selectField.dispatchEvent(new Event('change'));
            this.innerHTML = '🌐 English';
            isHindi = true;
        } else {
            selectField.value = 'en'; 
            selectField.dispatchEvent(new Event('change'));
            this.innerHTML = '🌐 Hindi';
            isHindi = false;
        }
    } else {
        alert("Translator is loading, please wait...");
    }
});

// 🚀 FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDNIkNSmhU79q_UXwP1wR-c88CCYMETXs",
  authDomain: "bbjp-vote.firebaseapp.com",
  databaseURL: "https://bbjp-vote-default-rtdb.firebaseio.com",
  projectId: "bbjp-vote",
  storageBucket: "bbjp-vote.firebasestorage.app",
  messagingSenderId: "408980373851",
  appId: "1:408980373851:web:2916222e7fb180fd7b9a7e",
  measurementId: "G-07K9E9T5RL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

let isLoggedIn = false; 
let isBlockedOnDevice = false; 

// Force browser to remember login
setPersistence(auth, browserLocalPersistence).then(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            checkDeviceLimit(user.uid); 
            isLoggedIn = true;
            let btn = document.getElementById('googleLoginBtn');
            btn.innerText = `✅ Hi, ${user.displayName.split(' ')[0]}`;
            btn.style.backgroundColor = "#138808"; 
            closeModal(); 
        } else {
            isLoggedIn = false;
        }
    });
});

// 🛑 2 GMAIL LIMIT LOGIC
function checkDeviceLimit(uid) {
    let allowedUids = JSON.parse(localStorage.getItem('allowed_uids') || '[]');
    if (allowedUids.includes(uid)) {
        isBlockedOnDevice = false; 
    } else {
        if (allowedUids.length < 2) {
            allowedUids.push(uid);
            localStorage.setItem('allowed_uids', JSON.stringify(allowedUids));
            isBlockedOnDevice = false;
        } else {
            isBlockedOnDevice = true; 
        }
    }
}

window.openLoginModal = function() { document.getElementById('loginModal').style.display = 'flex'; };
window.closeModal = function() { document.getElementById('loginModal').style.display = 'none'; };

function handleGoogleLogin(e) {
    if(e) e.preventDefault();
    let tncChecked = document.getElementById('tncCheckbox').checked;
    if(!tncChecked) {
        alert("⚠️ Please check the Terms & Conditions box to proceed with Secure Login.");
        return;
    }
    signInWithPopup(auth, provider).then((result) => {
        checkDeviceLimit(result.user.uid);
        isLoggedIn = true;
        let btn = document.getElementById('googleLoginBtn');
        btn.innerText = `✅ Hi, ${result.user.displayName.split(' ')[0]}`;
        btn.style.backgroundColor = "#138808";
        alert("Login Successful! You are ready to vote.");
        closeModal();
    }).catch((error) => {
        if(error.code !== 'auth/popup-closed-by-user') { alert("Login Failed. Error: " + error.message); }
    });
}
document.getElementById('modalLoginBtn').addEventListener('click', handleGoogleLogin);

// 📊 REGISTER DATALABELS PLUGIN
Chart.register(ChartDataLabels);

let globalTotalVotes = 0; 

// 🔴 MAIN CHART SETUP (Lines Wapas, Colors matched)
const ctxMain = document.getElementById('mainVotingChart').getContext('2d');
const mainChart = new Chart(ctxMain, {
    type: 'bar',
    data: {
        labels: ['BJB 🌻', 'KNC ✋', 'APP 🧹', 'BSSP 🐘', 'CJP 🪳', 'NOTA 🛑'],
        datasets: [{
            label: 'Total Votes (Live)',
            data: [0,0,0,0,0,0], 
            backgroundColor: ['#ff9933', '#19aa52', '#0066a4', '#22409a', '#8d6e63', '#666666'], borderRadius: 5
        }]
    },
    options: { 
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { top: 40 } },
        plugins: { 
            legend: { labels: { color: '#333' } },
            datalabels: {
                anchor: 'end', align: 'end', offset: 4,
                // Box color matches the bar color automatically!
                backgroundColor: function(context) { return context.dataset.backgroundColor[context.dataIndex]; }, 
                borderRadius: 4, color: '#ffffff',
                font: { weight: 'bold', size: 12 },
                formatter: function(value) {
                    if(value === 0) return '';
                    let perc = globalTotalVotes > 0 ? ((value / globalTotalVotes) * 100).toFixed(1) : 0;
                    return value + ' (' + perc + '%)';
                }
            }
        },
        scales: {
            // Numbers hidden, but grid lines SHOWING!
            y: { beginAtZero: true, ticks: { display: false }, grid: { display: true, color: '#e5e7eb', drawBorder: false }, grace: '30%' },
            x: { ticks: { color: '#666', font: {weight: 'bold'} }, grid: { display: false } }
        }
    }
});

// 🔴 DETAILED CHART SETUP (Lines Wapas, Label box matching bar colors)
const ctxDetailed = document.getElementById('detailedChart').getContext('2d');
const detailedChart = new Chart(ctxDetailed, {
    type: 'bar',
    data: {
        labels: ['BJB', 'KNC', 'APP', 'BSSP', 'CJP'],
        datasets: [
            { label: 'Likes', data: [0,0,0,0,0], backgroundColor: '#1565c0' },
            { label: 'Dislikes', data: [0,0,0,0,0], backgroundColor: '#4b5563' },
            { label: 'Corruption', data: [0,0,0,0,0], backgroundColor: '#dc2626' },
            { label: 'Fake Promises', data: [0,0,0,0,0], backgroundColor: '#d97706' }
        ]
    },
    options: { 
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { top: 40 } },
        plugins: { 
            legend: { labels: { color: '#333' } },
            datalabels: {
                anchor: 'end', align: 'end', offset: 2,
                // White background replaced! Now it matches the exact bar color
                backgroundColor: function(context) { return context.dataset.backgroundColor; },
                borderRadius: 4, color: 'white', font: { weight: 'bold', size: 11 },
                formatter: function(value) { return value > 0 ? value : ''; }
            }
        },
        scales: {
            // Numbers hidden, but grid lines SHOWING!
            y: { beginAtZero: true, ticks: { display: false }, grid: { display: true, color: '#e5e7eb', drawBorder: false }, grace: '30%' },
            x: { ticks: { color: '#666', font: {weight: 'bold'} }, grid: { display: false } }
        }
    }
});

// 📡 LIVE DATA FETCHING
const dbRef = ref(database, 'parties');
onValue(dbRef, (snapshot) => {
    const data = snapshot.val() || {};
    let votesData = [0,0,0,0,0,0]; 
    let likesData = [0,0,0,0,0]; let dislikesData = [0,0,0,0,0];
    let corruptionData = [0,0,0,0,0]; let fakeData = [0,0,0,0,0];

    const partiesMain = ['BJB', 'KNC', 'APP', 'BSSP', 'CJP', 'NOTA'];
    const partiesDetailed = ['BJB', 'KNC', 'APP', 'BSSP', 'CJP'];

    let currentTotalVotes = 0;

    for (let party in data) {
        let pData = data[party];
        let pId = party.toLowerCase(); 

        if(document.getElementById(pId + '-vote')) document.getElementById(pId + '-vote').innerText = pData.vote || 0;
        if(document.getElementById(pId + '-like')) document.getElementById(pId + '-like').innerText = pData.like || 0;
        if(document.getElementById(pId + '-dislike')) document.getElementById(pId + '-dislike').innerText = pData.dislike || 0;
        if(document.getElementById(pId + '-corrupt')) document.getElementById(pId + '-corrupt').innerText = pData.corruption || 0;
        if(document.getElementById(pId + '-fake')) document.getElementById(pId + '-fake').innerText = pData.fake || 0;

        let idxMain = partiesMain.indexOf(party);
        if(idxMain !== -1) {
            votesData[idxMain] = pData.vote || 0;
            currentTotalVotes += (pData.vote || 0);
        }

        let idxDet = partiesDetailed.indexOf(party);
        if(idxDet !== -1) {
            likesData[idxDet] = pData.like || 0; dislikesData[idxDet] = pData.dislike || 0;
            corruptionData[idxDet] = pData.corruption || 0; fakeData[idxDet] = pData.fake || 0;
        }
    }

    globalTotalVotes = currentTotalVotes;
    document.getElementById('totalVotesCount').innerText = currentTotalVotes;

    mainChart.data.datasets[0].data = votesData; mainChart.update();
    detailedChart.data.datasets[0].data = likesData; detailedChart.data.datasets[1].data = dislikesData;
    detailedChart.data.datasets[2].data = corruptionData; detailedChart.data.datasets[3].data = fakeData;
    detailedChart.update();
});


// 🖲️ SMART VOTING LOGIC
window.castVote = function(partyName, actionType) {
    if (!isLoggedIn) {
        openLoginModal();
        return;
    }

    if (isBlockedOnDevice) {
        alert("🚫 Device Limit Reached! A maximum of 2 Gmail accounts can be used from a single device to prevent spam.");
        return;
    }

    if (actionType === 'vote' && localStorage.getItem('hasVoted') === 'true') {
        alert('⚠️ You have already submitted your final vote! You cannot vote again.');
        return;
    }

    if (actionType === 'vote') {
        const partyActionRef = ref(database, 'parties/' + partyName + '/vote');
        runTransaction(partyActionRef, (currentCount) => { return (currentCount || 0) + 1; })
        .then(() => {
             localStorage.setItem('hasVoted', 'true');
             alert(`Thank you! Your VOTE for ${partyName} has been recorded live.`);
        })
        .catch((error) => { alert(`⚠️ Vote Failed! Error: ` + error.message); });
        return;
    }

    if (actionType === 'like' || actionType === 'dislike') {
        let storageKey = `reaction_${partyName}`;
        let previousReaction = localStorage.getItem(storageKey);

        if (previousReaction === actionType) {
            alert(`You have already reacted '${actionType}' to ${partyName}.`);
            return;
        }

        if (previousReaction && previousReaction !== actionType) {
            const oldRef = ref(database, 'parties/' + partyName + '/' + previousReaction);
            runTransaction(oldRef, (currentCount) => { return Math.max(0, (currentCount || 0) - 1); });
        }
        
        localStorage.setItem(storageKey, actionType);
        const newRef = ref(database, 'parties/' + partyName + '/' + actionType);
        runTransaction(newRef, (currentCount) => { return (currentCount || 0) + 1; })
        .then(() => { alert(`Your '${actionType}' reaction for ${partyName} is recorded!`); })
        .catch((error) => { alert(`⚠️ Reaction Failed! Error: ` + error.message); });
        return;
    }

    const partyActionRef = ref(database, 'parties/' + partyName + '/' + actionType);
    runTransaction(partyActionRef, (currentCount) => { return (currentCount || 0) + 1; })
    .then(() => { alert(`Your '${actionType}' reaction for ${partyName} has been recorded live.`); })
    .catch((error) => { alert(`⚠️ Reaction Failed! Error: ` + error.message); });
};