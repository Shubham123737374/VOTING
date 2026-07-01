document.cookie = "googtrans=/en/en; path=/; domain=" + window.location.hostname;
document.cookie = "googtrans=/en/en; path=/";

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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        isLoggedIn = true;
        let btn = document.getElementById('googleLoginBtn');
        btn.innerText = `✅ Hi, ${user.displayName.split(' ')[0]}`;
        btn.style.backgroundColor = "#138808"; 
        closeModal(); 
    } else {
        isLoggedIn = false;
    }
});

function handleGoogleLogin(e) {
    if(e) e.preventDefault();
    signInWithPopup(auth, provider).then((result) => {
        isLoggedIn = true;
        let btn = document.getElementById('googleLoginBtn');
        btn.innerText = `✅ Hi, ${result.user.displayName.split(' ')[0]}`;
        btn.style.backgroundColor = "#138808";
        alert("Login Successful! You are ready to vote.");
        closeModal();
    }).catch((error) => {
        if(error.code !== 'auth/popup-closed-by-user') {
            alert("Login Failed. Error: " + error.message);
        }
    });
}
document.getElementById('googleLoginBtn').addEventListener('click', handleGoogleLogin);
document.getElementById('modalLoginBtn').addEventListener('click', handleGoogleLogin);

// Setup Charts (Only 6 parties, BBJP is excluded from arrays)
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
    options: { responsive: true, maintainAspectRatio: false }
});

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
    options: { responsive: true, maintainAspectRatio: false }
});

window.closeModal = function() {
    document.getElementById('loginModal').style.display = 'none';
};

// LIVE DATA FETCHING
const dbRef = ref(database, 'parties');
onValue(dbRef, (snapshot) => {
    const data = snapshot.val() || {};
    let votesData = [0,0,0,0,0,0]; 
    let likesData = [0,0,0,0,0]; let dislikesData = [0,0,0,0,0];
    let corruptionData = [0,0,0,0,0]; let fakeData = [0,0,0,0,0];

    // Arrays used ONLY for Graph mapping (BBJP is NOT here, so it stays off the graph)
    const partiesMain = ['BJB', 'KNC', 'APP', 'BSSP', 'CJP', 'NOTA'];
    const partiesDetailed = ['BJB', 'KNC', 'APP', 'BSSP', 'CJP'];

    for (let party in data) {
        let pData = data[party];
        let pId = party.toLowerCase(); // Works for 'bbjp' too!

        // Update Numbers in Buttons (BBJP will update normally here)
        if(document.getElementById(pId + '-vote')) document.getElementById(pId + '-vote').innerText = pData.vote || 0;
        if(document.getElementById(pId + '-like')) document.getElementById(pId + '-like').innerText = pData.like || 0;
        if(document.getElementById(pId + '-dislike')) document.getElementById(pId + '-dislike').innerText = pData.dislike || 0;
        if(document.getElementById(pId + '-corrupt')) document.getElementById(pId + '-corrupt').innerText = pData.corruption || 0;
        if(document.getElementById(pId + '-fake')) document.getElementById(pId + '-fake').innerText = pData.fake || 0;

        let idxMain = partiesMain.indexOf(party);
        if(idxMain !== -1) votesData[idxMain] = pData.vote || 0;

        let idxDet = partiesDetailed.indexOf(party);
        if(idxDet !== -1) {
            likesData[idxDet] = pData.like || 0; dislikesData[idxDet] = pData.dislike || 0;
            corruptionData[idxDet] = pData.corruption || 0; fakeData[idxDet] = pData.fake || 0;
        }
    }

    mainChart.data.datasets[0].data = votesData; mainChart.update();
    detailedChart.data.datasets[0].data = likesData; detailedChart.data.datasets[1].data = dislikesData;
    detailedChart.data.datasets[2].data = corruptionData; detailedChart.data.datasets[3].data = fakeData;
    detailedChart.update();
});


// 🖲️ SMART VOTING LOGIC (Device limit and Toggle)
window.castVote = function(partyName, actionType) {
    if (!isLoggedIn) {
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }

    // 1. DEVICE LIMIT LOGIC (Max 5 Votes per device)
    if (actionType === 'vote') {
        let deviceVotes = parseInt(localStorage.getItem('device_vote_count') || '0');
        if (deviceVotes >= 5) {
            alert('🚫 Warning: You have reached the maximum limit of 5 votes from this device. We block spam voting!');
            return;
        }
        localStorage.setItem('device_vote_count', deviceVotes + 1);
        
        const partyActionRef = ref(database, 'parties/' + partyName + '/vote');
        runTransaction(partyActionRef, (currentCount) => { return (currentCount || 0) + 1; });
        alert(`Thank you! Your VOTE for ${partyName} has been recorded live.`);
        return;
    }

    // 2. LIKE / DISLIKE TOGGLE LOGIC
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
        runTransaction(newRef, (currentCount) => { return (currentCount || 0) + 1; });
        
        alert(`Your '${actionType}' reaction for ${partyName} is recorded!`);
        return;
    }

    // 3. NORMAL REACTIONS
    const partyActionRef = ref(database, 'parties/' + partyName + '/' + actionType);
    runTransaction(partyActionRef, (currentCount) => { return (currentCount || 0) + 1; });
    alert(`Your '${actionType}' reaction for ${partyName} has been recorded live.`);
};