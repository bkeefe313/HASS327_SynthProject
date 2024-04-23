const startbtn = document.querySelector('button');
const freqRangeIn = document.querySelector('#freqIn')

const context = new AudioContext();
let osc;

startbtn.addEventListener('click', () => {
  osc?.stop();

  osc = context.createOscillator();

  osc.type = "sine"
  osc.frequency.value = freqRangeIn.value;

  osc.connect(context.destination);
  osc.start();
});


freqRangeIn.addEventListener('input', () => {
  osc.frequency.value = freqRangeIn.value;
});
