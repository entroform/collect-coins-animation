// Implementation.
import CoinManager from './coinManager';
import coinsvg from '../images/coin.svg';

var containerElement = document.querySelector('.container');
var startElement = document.querySelector('.collectButton');
var endElement = document.querySelector('.coinTarget');
var coinsValue = document.querySelector('.coinsValue');

var coinManager = new CoinManager({
  startElement: startElement,
  endElement: endElement,
  parentElement: containerElement,

  clipCanvasOnOverflow: true,
  canvasMargin: 500,
  resolutionMultiplier: 2,
  zIndex: 1000,

  imagePath: coinsvg,
  coinSize: 20,
  totalValue: 222,
  valueIncrement: 8,
  numberOfCoinsRange: [0, 300],

  timingFunction: function (t) {
    return t;
  },
  delayRange: [0, 0],
  durationRange: [600, 1000],

  arcIntensityRange: [0, 0.5],
  arcAngleIntensity: Math.PI / 4,
  noSCurve: true,

  onCoinComplete: function (coin) {
    endElement.classList.remove('coinTarget--animate');
    endElement.classList.add('coinTarget--animate');
    coinsValue.textContent = parseInt(coinsValue.textContent, 10) + coin.value;
  }.bind(this),

  onStart: function () {
    startElement.classList.add('collectButton--disabled');
    startElement.textContent = 'Collecting...';
  },
  onComplete: function () {
    endElement.classList.remove('coinTarget--animate');
    startElement.classList.remove('collectButton--disabled');
    startElement.textContent = 'Collect';
  },
});

startElement.addEventListener('click', function () {
  coinManager.start();
});