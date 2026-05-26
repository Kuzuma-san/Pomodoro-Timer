const time = document.querySelector('.timer-h1').innerHTML;//string 25:00
const timeArr = time.split(':'); //["25","00"];

let secondsRemaining = timeToSeconds(timeArr); //initially 25min
let timerState = 'idle'; //idle | 'running' | complete | paused
let intervalId = null;

function formatSeconds(seconds) {
    //takes seconds and give the time in minutes and seconds as string
    let minutes = Math.floor(seconds/60);
    let sec = seconds % 60;
    if(minutes < 10){
        minutes = `0${minutes}`;
    }
    if(sec < 10){
        sec = `0${sec}`;
    }
    return `${minutes}:${sec}`;
}
function timeToSeconds(arr){
    return arr.reduce((acc,curr) => acc*60 + Number(curr), 0);
}

const startButton = document.querySelector('.start-button');
const pauseButton = document.querySelector('.pause-button');
const resetButton = document.querySelector('.reset-button');
const label = document.querySelector('.session-label-input');
const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
const headingTime = document.querySelector('.timer-h1');

startButton.addEventListener('click',startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

function resetTimer() {
    console.log("Timer Reset");
    if(timerState === 'idle') return;
    timerState = 'idle';
    headingTime.innerHTML = time;
    secondsRemaining = timeToSeconds(timeArr);
    clearInterval(intervalId);

    label.readOnly = false;
}

function pauseTimer(){
    console.log("Interval Paused!");
    if(timerState === 'paused') return;
    timerState = 'paused';
    clearInterval(intervalId);

    label.readOnly = false;
}

function startTimer() {
    //Deny label changes and enable again when paused or reset
    if(timerState === 'running' || timerState === 'complete') return;
    timerState = 'running';
    label.readOnly = true;

    intervalId = setInterval(decreaseTimer,1000);
    // calls the function decrease timer every 1 sec until hits 0, pause or reset
}

function decreaseTimer() {
    secondsRemaining--;
    headingTime.innerHTML = formatSeconds(secondsRemaining);

    if(secondsRemaining <= 0) {
        console.log("Timer Hit 0!");
        clearInterval(intervalId);
        timerState = 'complete';
        onComplete();
    }
}

function timeAgo(isoString) {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime())/1000);
    if(seconds < 60) return 'just now';
    if(seconds < 3600) return `${Math.floor(seconds/60)} minutes ago`;
    if(seconds < 86400) return `${Math.floor(seconds/3600)} hours ago`;
    return `${Math.floor(seconds/86400)} days ago`;
}

async function onComplete() {
    console.log("Timer Complete");
    await postSession();
    await renderSessions();
    label.value = '';
    label.readOnly = false;
}

async function renderSessions() {
    const response = await fetch('http://localhost:3001/sessions');
    const data = await response.json();

    const sessionsList = document.querySelector('.sessions');
    sessionsList.innerHTML = '';

    data.forEach((obj) => {
        const newSession = document.createElement('div');
        newSession.classList.add('session');

        const newSessionNameColor = document.createElement('div');
        newSessionNameColor.classList.add('session-name-color');

        const newSessionName = document.createElement('div');
        newSessionName.classList.add('session-name');
        newSessionName.innerText = obj.label;

        const newSessionColor = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        newSessionColor.classList.add('random-color');
        newSessionColor.style.backgroundColor = color;

        const newSessionTime = document.createElement('div');
        newSessionTime.classList.add('session-time');
        newSessionTime.innerText = `${obj.durationMin} min ${obj.durationSec} sec`;

        const newSessionCompletedTime = document.createElement('div');
        newSessionCompletedTime.classList.add('completed-time');
        newSessionCompletedTime.innerText = timeAgo(obj.completedAt);

        newSessionNameColor.appendChild(newSessionColor);
        newSessionNameColor.appendChild(newSessionName);

        newSession.appendChild(newSessionNameColor);
        newSession.appendChild(newSessionTime);
        newSession.appendChild(newSessionCompletedTime);

        sessionsList.appendChild(newSession);
    });
    
}

async function postSession() {
    const labelValue = label.value.trim() || 'Unlabled Session';//Eg. Focussed Work
    const response = await fetch('http://localhost:3001/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({label: labelValue, durationMin: Number(timeArr[0]), durationSec: Number(timeArr[1]),}),
    });
    return await response.json();
}

renderSessions();