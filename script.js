// HASS 327 Synth Project

const context = new AudioContext(); //allows access to webaudioapi
const c1 = document.querySelector('#c1'); //grabs the button

let volumeSlider = document.getElementById('volume');

volumeSlider.oninput = function() {
    let volume = this.value;
    // Use the volume value
};

// notes go from C4 to C5 (including black keys)
let frequencies = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25]; //array of frequencies
let keys = document.querySelectorAll('.key'); //grabs all the keys
let keyboardKeyNames = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k']; //array of keyboard keys
let keyboardKeys = {'a':false, 'w':false, 's':false, 'e':false, 'd':false, 'f':false, 't':false, 'g':false, 'y':false, 'h':false, 'u':false, 'j':false, 'k':false}; //array of keyboard keys
let keyboardOscillators = {'a':null, 'w':null, 's':null, 'e':null, 'd':null, 'f':null, 't':null, 'g':null, 'y':null, 'h':null, 'u':null, 'j':null, 'k':null}; //array of keyboard oscillators

let gainNode = context.createGain(); //creates gain node
gainNode.gain.value = 0.1; //sets the gain value

function playNote(freq, key) {  
    let oscPitch = freq; //assigning the value of the slider to a variable
    keyboardOscillators[key] = context.createOscillator(); //creates oscillator
    keyboardOscillators[key].type = "sine"; //chooses the type of wave
    keyboardOscillators[key].frequency.value = oscPitch; //assigning the value of oscPitch to the oscillators frequency value
    keyboardOscillators[key].connect(gainNode); //sends to output
    gainNode.connect(context.destination); //connects the gain node to the output
    keyboardOscillators[key].start() //starts the sound at the current time
}

function stopOscillator(key) {
    keyboardOscillators[key].stop(); //stops the oscillator
    keyboardOscillators[key].disconnect(); //disconnects the oscillator
}

for(let i = 0; i < frequencies.length; i++) { //for loop to iterate through the array
    keys[i].addEventListener('mousedown', function(){
        playNote(frequencies[i]);
    });
    document.addEventListener('mouseup', function(){
        stopOscillator(keyboardKeyNames[i]);
    });
}

for(let i = 0; i < keyboardKeyNames.length; i++) {
    document.addEventListener('keydown', function(event) {
        if(event.key == keyboardKeyNames[i] && keyboardKeys[event.key] == false) {
            keyboardKeys[event.key] = true;
            playNote(frequencies[i], event.key);
        }
    });
    document.addEventListener('keyup', function(event) {
        if(event.key == keyboardKeyNames[i]) {
            keyboardKeys[event.key] = false;
            stopOscillator(event.key);
        }
    });
}