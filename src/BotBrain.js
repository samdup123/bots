module.exports = (botController) => {
  // console.log('new');
  botController.onReceive((data, signalStength) => {
    console.log('just got a message ', data, signalStength);
  });

  botController.send('hey im botNum');
  setTimeout(() => {
    botController.send('hey im botNum');
  }, 100);
};
