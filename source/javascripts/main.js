// Implementation.
import CoinManager from './coinManager';
import coinsvg from '../images/coin.svg';

var containerElement = document.querySelector('.container');
var startElement     = document.querySelector('.collect-button');
var endElement       = document.querySelector('.coinTarget');
var coinsValue       = document.querySelector('.coinsValue');

var coinManager = new CoinManager({
  startElement: startElement,
  endElement: endElement,
  parentElement: containerElement,

  canvasMargin: 100,
  resolutionMultiplier: 1,
  zIndex: 1000,

  imageURL: coinsvg,
  coinSize: 20,
  amount: 1005,
  increment: 20,
  maxNumberOfCoins: 300,

  timingFunction: function(t) { return t; },
  delayRange: [0, 0],
  durationRange: [600, 1000],

  arcLengthIntensityRange: [0, 0.5],
  arcAngleIntensity: Math.PI / 4,

  noSCurve: true,

  onCoinComplete: function(coin) {
    endElement.classList.remove('coinTarget--animate');
    endElement.classList.add('coinTarget--animate');
    coinsValue.textContent = parseInt(coinsValue.textContent, 10) + coin.amount;
  }.bind(this),

  onComplete: function() {
    endElement.classList.remove('coinTarget--animate');
  },
});

startElement.addEventListener('click', function() {
  coinManager.start();
});