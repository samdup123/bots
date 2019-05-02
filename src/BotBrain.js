module.exports = (botController) => {
  console.log('new');
  botController.onReceive((data, signalStength) => {
    console.log('just got a message ', data, signalStength);
  });

  botController.send('hey im botNum');
  setInterval(() => {
    botController.send('hey im botNum');
  }, 1000);
};
