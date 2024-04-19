const context = new AudioContext();

const osc = context.createOscillator();

osc.type = "sine"
osc.frequency.value = 440.0;

osc.connect(context.destination);
osc.start();
