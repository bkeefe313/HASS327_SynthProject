const startbtn = document.querySelector('button');

let osc;

startbtn.addEventListener('click', () => {

  const context = new AudioContext();

  osc = context.createOscillator();

  osc.type = "sine"
  osc.frequency.value = 440.0;

  osc.connect(context.destination);
  osc.start();
});

freqRangeIn.addEventListener('input', () => {
  osc.frequency.value = freqRangeIn.value;
})
