// HASS 327 Synth Project

const context = new AudioContext(); //allows access to webaudioapi
const c1 = document.querySelector('#c1'); //grabs the button

// notes go from C4 to C5 (including black keys)
let keys = document.querySelectorAll('.key'); //grabs all the keys
let frequencies = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25]; //array of frequencies
let keyboardKeyNames = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k']; //array of keyboard keys
let keyboardKeys = {'a':false, 'w':false, 's':false, 'e':false, 'd':false, 'f':false, 't':false, 'g':false, 'y':false, 'h':false, 'u':false, 'j':false, 'k':false}; //array of keyboard keys

// Ticker box (transpose)
let transpose = 0;
let tickerBox = document.getElementById('ticker');
tickerBox.oninput = function() {
    transpose = this.value;
};

// NODES

// gain
let volumeSlider = document.getElementById('volume');
let gainNode = context.createGain(); //creates gain node
volumeSlider.oninput = function() {
    gainNode.gain.value = this.value / 100;
};

// oscillators
let oscillatorNodesA = {'a':null, 'w':null, 's':null, 'e':null, 'd':null, 'f':null, 't':null, 'g':null, 'y':null, 'h':null, 'u':null, 'j':null, 'k':null}; //array of keyboard oscillators
let oscillatorNodesB = {'a':null, 'w':null, 's':null, 'e':null, 'd':null, 'f':null, 't':null, 'g':null, 'y':null, 'h':null, 'u':null, 'j':null, 'k':null}; //array of keyboard oscillators
let secondOscillatorOn = false;

// filters
let highPassSlider = document.getElementById('high-pass');
let lowPassSlider = document.getElementById('low-pass');
let bandPassSlider = document.getElementById('band-pass');  
let highPassNode = context.createBiquadFilter(); //creates high pass filter
let lowPassNode = context.createBiquadFilter(); //creates low pass filter
let bandPassNode = context.createBiquadFilter(); //creates band pass filter
let highPassOn = false;
let lowPassOn = false;
let bandPassOn = false;
document.getElementById('high-pass-toggle').oninput = function() {
    highPassOn = !highPassOn;
    highPassNode.frequency.value = highPassOn ? highPassSlider.value : 0;
}
document.getElementById('low-pass-toggle').oninput = function() {
    lowPassOn = !lowPassOn;
    lowPassNode.frequency.value = lowPassOn ? lowPassSlider.value : 22000;
}
document.getElementById('band-pass-toggle').oninput = function() {
    bandPassOn = !bandPassOn;
    bandPassNode.frequency.value = bandPassOn ? bandPassSlider.value : 0;
}
highPassSlider.oninput = function() {
    highPassNode.type = 'highpass'; //chooses the type of filter
    highPassNode.frequency.value = highPassOn ? this.value : 0; //assigns the value of the slider to the frequency value
}
lowPassSlider.oninput = function() {
    lowPassNode.type = 'lowpass'; //chooses the type of filter
    lowPassNode.frequency.value = lowPassOn ? this.value : 22000; //assigns the value of the slider to the frequency value
}
bandPassSlider.oninput = function() {
    bandPassNode.type = 'bandpass'; //chooses the type of filter
    bandPassNode.frequency.value = bandPassOn ? this.value : 0; //assigns the value of the slider to the frequency value
}

// oscillator settings
let oscATypeChoice = document.getElementById('a-type');
let oscBTypeChoice = document.getElementById('b-type');
let oscADetuneSlider = document.getElementById('a-detune');
let oscBDetuneSlider = document.getElementById('b-detune');
let oscAOnToggle = document.getElementById('a-on');
let oscBOnToggle = document.getElementById('b-on');
let oscAOn = true;
let oscBOn = true;
let oscAType = "sine";
let oscBType = "sine";
let oscADetune = 0;
let oscBDetune = 0;
oscAOnToggle.oninput = function() {
    oscAOn = !oscAOn;
}
oscBOnToggle.oninput = function() {
    oscBOn = !oscBOn;
}
oscATypeChoice.onchange = function() {
    oscAType = this.value;
}
oscBTypeChoice.onchange = function() {
    oscBType = this.value;
}
oscADetuneSlider.oninput = function() {
    oscADetune = this.value;
}
oscBDetuneSlider.oninput = function() {
    oscBDetune = this.value;
}


// envelope (code from https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques)
let attackTime = 0.2;
const attackControl = document.querySelector("#attack");
attackControl.addEventListener(
  "input",
  (ev) => {
    attackTime = parseInt(ev.target.value, 10);
  },
  false,
);

let releaseTime = 0.5;
const releaseControl = document.querySelector("#release");
releaseControl.addEventListener(
  "input",
  (ev) => {
    releaseTime = parseInt(ev.target.value, 10);
  },
  false,
);


// pipeline
function createPipeline() {
    highPassNode.connect(lowPassNode);
    lowPassNode.connect(bandPassNode);
    bandPassNode.connect(gainNode);
    gainNode.connect(context.destination); //connects the filters to the gain node and then to the output
    return highPassNode;
}


function playOscillatorA(freq, key) {  
    let oscPitch = freq * Math.pow(2, transpose); //transposes the frequency
    oscillatorNodesA[key] = context.createOscillator(); //creates oscillator
    oscillatorNodesA[key].type = oscAType == null ? "sine" : oscAType; //chooses the type of wave
    oscillatorNodesA[key].frequency.setValueAtTime(oscPitch, context.currentTime); //assigning the value of oscPitch to the oscillators frequency value
    oscillatorNodesA[key].detune.value = oscADetune;
    
    let pipeline = createPipeline();
    oscillatorNodesA[key].connect(pipeline); //sends to output
    oscillatorNodesA[key].start() //starts the oscillator
}

function playOscillatorB(freq, key) {
    let oscPitch = freq * Math.pow(2, transpose); //transposes the frequency
    oscillatorNodesB[key] = context.createOscillator(); //creates oscillator
    oscillatorNodesB[key].type = oscBType == null ? "sine" : oscBType; //chooses the type of wave
    oscillatorNodesB[key].frequency.setValueAtTime(oscPitch, context.currentTime); //assigning the value of oscPitch to the oscillators frequency value
    oscillatorNodesB[key].detune.value = oscBDetune;
    
    let pipeline = createPipeline();
    oscillatorNodesB[key].connect(pipeline); //sends to output
    oscillatorNodesB[key].start() //starts the oscillator
}

function stopOscillators(key) {
    if(oscillatorNodesA[key] != null) {
        oscillatorNodesA[key].stop(); //stops the oscillator
        oscillatorNodesA[key].disconnect(); //disconnects the oscillator
        oscillatorNodesA[key] = null; //sets the oscillator to null
    }
    if(oscillatorNodesB[key] != null) {
        oscillatorNodesB[key].stop(); //stops the oscillator
        oscillatorNodesB[key].disconnect(); //disconnects the oscillator
        oscillatorNodesB[key] = null; //sets the oscillator to null
    }
}

for(let i = 0; i < frequencies.length; i++) { //for loop to iterate through the array
    keys[i].addEventListener('mousedown', function(){
        oscAOn ? playOscillatorA(frequencies[i], keyboardKeyNames[i]) : null;
        oscBOn ? playOscillatorB(frequencies[i], keyboardKeyNames[i]) : null;
    });
    window.addEventListener('mouseup', function(){
        stopOscillators(keyboardKeyNames[i]);
    });
}

for(let i = 0; i < keyboardKeyNames.length; i++) {
    document.addEventListener('keydown', function(event) {
        if(event.key == keyboardKeyNames[i] && keyboardKeys[event.key] == false) {
            keyboardKeys[event.key] = true;
            oscAOn ? playOscillatorA(frequencies[i], event.key, oscAType, oscADetune) : null;
            oscBOn ? playOscillatorB(frequencies[i], event.key, oscBType, oscBDetune) : null;
        }
    });
    document.addEventListener('keyup', function(event) {
        if(event.key == keyboardKeyNames[i]) {
            keyboardKeys[event.key] = false;
            stopOscillators(event.key);
        }
    });
}