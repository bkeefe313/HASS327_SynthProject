// HASS 327 Synth Project

const context = new AudioContext(); //allows access to webaudioapi
const c1 = document.querySelector("#c1"); //grabs the button

// notes go from C4 to C5 (including black keys)
let keys = document.querySelectorAll(".key"); //grabs all the keys
let frequencies = [
  261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.0, 415.3, 440.0,
  466.16, 493.88, 523.25,
]; //array of frequencies
let keyboardKeyNames = [
  "a",
  "w",
  "s",
  "e",
  "d",
  "f",
  "t",
  "g",
  "y",
  "h",
  "u",
  "j",
  "k",
]; //array of keyboard keys
let keyboardKeys = {
  a: false,
  w: false,
  s: false,
  e: false,
  d: false,
  f: false,
  t: false,
  g: false,
  y: false,
  h: false,
  u: false,
  j: false,
  k: false,
}; //array of keyboard keys

// Ticker box (transpose)
let transpose = 0;
let tickerBox = document.getElementById("ticker");
tickerBox.oninput = function () {
  transpose = this.value;
};

// NODES

// gain
let volumeSlider = document.getElementById("volume");
let gainNode = context.createGain(); //creates gain node
volumeSlider.oninput = function () {
  gainNode.gain.value = this.value / 100;
};

// oscillators
let oscillatorNodesA = {
  a: null,
  w: null,
  s: null,
  e: null,
  d: null,
  f: null,
  t: null,
  g: null,
  y: null,
  h: null,
  u: null,
  j: null,
  k: null,
}; //array of keyboard oscillators
let oscillatorNodesB = {
  a: null,
  w: null,
  s: null,
  e: null,
  d: null,
  f: null,
  t: null,
  g: null,
  y: null,
  h: null,
  u: null,
  j: null,
  k: null,
}; //array of keyboard oscillators
let secondOscillatorOn = false;

// filters
let highPassSlider = document.getElementById("high-pass");
let highPassQSlider = document.getElementById("high-pass-q");
let lowPassSlider = document.getElementById("low-pass");
let lowPassQSlider = document.getElementById("low-pass-q");
let highPassNode = context.createBiquadFilter(); //creates high pass filter
let lowPassNode = context.createBiquadFilter(); //creates low pass filter
let highPassOn = false;
let lowPassOn = false;
let bandPassOn = false;

document.getElementById("high-pass-toggle").oninput = () => {
  highPassOn = !highPassOn;
  highPassNode.frequency.value = highPassOn ? highPassSlider.value : 22000;
};
document.getElementById("low-pass-toggle").oninput = () => {
  lowPassOn = !lowPassOn;
  lowPassNode.frequency.value = lowPassOn ? lowPassSlider.value : 0;
};
highPassSlider.oninput = function () {
  highPassNode.type = "highpass"; //chooses the type of filter
  highPassNode.frequency.value = highPassOn ? this.value : 0; //assigns the value of the slider to the frequency value
};
lowPassSlider.oninput = function () {
  lowPassNode.type = "lowpass"; //chooses the type of filter
  lowPassNode.frequency.value = lowPassOn ? this.value : 22000; //assigns the value of the slider to the frequency value
};
highPassQSlider.oninput = function () {
  highPassNode.Q.value = this.value;
};
lowPassQSlider.oninput = function () {
  lowPassNode.Q.value = this.value;
};

// oscillator settings
let oscATypeChoice = document.getElementById("a-type");
let oscBTypeChoice = document.getElementById("b-type");
let oscADetuneSlider = document.getElementById("a-detune");
let oscBDetuneSlider = document.getElementById("b-detune");
let oscAOnToggle = document.getElementById("a-on");
let oscBOnToggle = document.getElementById("b-on");
let oscAOn = true;
let oscBOn = true;
let oscAType = "sine";
let oscBType = "sine";
let oscADetune = 0;
let oscBDetune = 0;
oscAOnToggle.oninput = () => {
  oscAOn = !oscAOn;
};
oscBOnToggle.oninput = () => {
  oscBOn = !oscBOn;
};
oscATypeChoice.onchange = function () {
  oscAType = this.value;
};
oscBTypeChoice.onchange = function () {
  oscBType = this.value;
};
oscADetuneSlider.oninput = function () {
  oscADetune = this.value;
};
oscBDetuneSlider.oninput = function () {
  oscBDetune = this.value;
};

// pipeline
function createPipeline() {
  highPassNode.connect(lowPassNode);
  lowPassNode.connect(gainNode);
  gainNode.connect(context.destination); //connects the filters to the gain node and then to the output
  return highPassNode;
}

function playOscillatorA(freq, key) {
  let oscPitch = freq * Math.pow(2, transpose); //transposes the frequency
  oscillatorNodesA[key] = context.createOscillator(); //creates oscillator
  oscillatorNodesA[key].type = oscAType == null ? "sine" : oscAType; //chooses the type of wave
  oscillatorNodesA[key].frequency.setValueAtTime(oscPitch, context.currentTime); //assigning the value of oscPitch to the oscillators frequency value
  oscillatorNodesA[key].detune.value = oscADetune;

  oscillatorNodesA[key].start(); //starts the oscillator

  return oscillatorNodesA[key];
}

function playOscillatorB(freq, key) {
  let oscPitch = freq * Math.pow(2, transpose); //transposes the frequency
  oscillatorNodesB[key] = context.createOscillator(); //creates oscillator
  oscillatorNodesB[key].type = oscBType == null ? "sine" : oscBType; //chooses the type of wave
  oscillatorNodesB[key].frequency.setValueAtTime(oscPitch, context.currentTime); //assigning the value of oscPitch to the oscillators frequency value
  oscillatorNodesB[key].detune.value = oscBDetune;

  oscillatorNodesB[key].start(); //starts the oscillator

  return oscillatorNodesB[key];
}

function stopOscillators(key) {
  if (oscillatorNodesA[key] != null) {
    oscillatorNodesA[key].stop(); //stops the oscillator
    oscillatorNodesA[key].disconnect(); //disconnects the oscillator
    oscillatorNodesA[key] = null; //sets the oscillator to null
  }
  if (oscillatorNodesB[key] != null) {
    oscillatorNodesB[key].stop(); //stops the oscillator
    oscillatorNodesB[key].disconnect(); //disconnects the oscillator
    oscillatorNodesB[key] = null; //sets the oscillator to null
  }
}

for (let i = 0; i < frequencies.length; i++) {
  //for loop to iterate through the array
  keys[i].addEventListener("pointerdown", () => {
    let a = oscAOn
      ? playOscillatorA(frequencies[i], keyboardKeyNames[i], oscAType, oscADetune)
      : null;
    let b = oscBOn
      ? playOscillatorB(frequencies[i], keyboardKeyNames[i], oscBType, oscBDetune)
      : null;
    let hookup = createPipeline();
    if (oscAOn && oscBOn) {
      let merger = context.createChannelMerger(2);
      a.connect(merger, 0, 0);
      b.connect(merger, 0, 1);
      merger.connect(hookup);
    } else if (oscAOn) {
      a.connect(hookup);
    } else if (oscBOn) {
      b.connect(hookup);
    }
  });
  keys[i].addEventListener("pointerup", () => {
    stopOscillators(keyboardKeyNames[i]);
  });
  keys[i].addEventListener("pointerout", () => {
    stopOscillators(keyboardKeyNames[i]);
  });
}

for (let i = 0; i < keyboardKeyNames.length; i++) {
  document.addEventListener("keydown", (event) => {
    if (event.key === keyboardKeyNames[i] && !keyboardKeys[event.key]) {
      keyboardKeys[event.key] = true;
      let a = oscAOn
        ? playOscillatorA(frequencies[i], event.key, oscAType, oscADetune)
        : null;
      let b = oscBOn
        ? playOscillatorB(frequencies[i], event.key, oscBType, oscBDetune)
        : null;
      let hookup = createPipeline();
      if (oscAOn && oscBOn) {
        let merger = context.createChannelMerger(2);
        a.connect(merger, 0, 0);
        b.connect(merger, 0, 1);
        merger.connect(hookup);
      } else if (oscAOn) {
        a.connect(hookup);
      } else if (oscBOn) {
        b.connect(hookup);
      }
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === keyboardKeyNames[i]) {
      keyboardKeys[event.key] = false;
      stopOscillators(event.key);
    }
  });
}
