import Util from './util';
import Vector2 from './vector2';
import Animation from './animation';
import Coin from './coin';

// @CoinManager
var COIN_MANAGER_DEFAULT_CONFIG = {
  startElement: null,
  endElement: null,
  parentElement: null,

  // Canvas Settings.
  canvasMargin: 100,
  resolutionMultiplier: 1,
  zIndex: 0,

  // Coin Settings.
  imagePath: '',
  coinSize: 20,

  // Coin Value Distribution.
  totalValue: 1000,
  valueIncrement: 20,
  numberOfCoinsRange: [0, 300],

  // Coin Trajectory Settings.
  timingFunction: function(t) { return t; },
  delayRange: [0, 0],
  durationRange: [600, 1000],
  arcIntensityRange: [0, 0.5],
  arcAngleIntensity: Math.PI / 4,
  noSCurve: true,

  // Hooks.
  beforeCoinStart: function() {},
  onCoinStart: function(coin) {},
  onCoinComplete: function(coin) {},

  onStart: function() {},
  onComplete: function() {},
};

var CoinManager = function(config) {
  this.init(config);
};

CoinManager.prototype = {
  // 1) Initialize properties and stuff.
  init: function(config) {
    this.config = Util.objectAssign({}, COIN_MANAGER_DEFAULT_CONFIG);
    this.setConfig(config);

    this.animation;
    this.isActive = false;
    this.startVector;
    this.endVector;
    this.coins = [];
    this.endCount = 0;
    this.canvasElement;
    this.context;
    this.image;

    this.offsetLeft;
    this.offsetRight;
  },
  // 2) Set config.
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  // 3) Trigger Start.
  start: function() {
    this.setup(this.begin.bind(this));
  },
  // 4) Setup target vectors, initialize coin objects, and create canvas.
  setup: function(callback) {
    if (this.isActive === false) {
      this.isActive = true;
      this.getTargetVectors();
      this.populate();
      this.createCanvas(callback);
    }
  },
  // 5) Set starting and ending vectors from config elements.
  getTargetVectors: function() {
    this.startVector = this.getElementCenterVector(this.config.startElement);
    this.endVector   = this.getElementCenterVector(this.config.endElement);
  },
  // 6) Helper function to get center vector of element.
  getElementCenterVector: function(element) {
    var rect = element.getBoundingClientRect();
    return new Vector2(
      rect.left + (rect.width  / 2),
      rect.top  + (rect.height / 2),
    );
  },
  // 7) Prepare, calculate, and initialize coin objects.
  populate: function() {
    this.coins = [];

    var coinValue = 0;
    var coinValueCount = 0;
    var coinValueRemainder = null;
    var numberOfCoins = 0;

    var minNumberOfCoins = Math.min.apply(null, this.config.numberOfCoinsRange);
    var maxNumberOfCoins = Math.max.apply(null, this.config.numberOfCoinsRange);
    if (minNumberOfCoins < 0) minNumberOfCoins = 0;
    if (maxNumberOfCoins < 0) maxNumberOfCoins = 0;

    if (
      this.config.totalValue === 0
      || this.config.valueIncrement === 0
      || this.config.valueIncrement >= this.config.totalValue
    ) {
      numberOfCoins = minNumberOfCoins;

      if (this.config.totalValue !== 0) {
        if (this.config.totalValue <= numberOfCoins) {
          coinValueCount = this.config.totalValue;
          coinValue = 1;
        } else {
          coinValueRemainder = this.config.totalValue % numberOfCoins;
          coinValue = (this.config.totalValue - coinValueRemainder) / numberOfCoins;
        }
      }
    } else {
      var remainder = this.config.totalValue % this.config.valueIncrement;

      if (remainder === 0) {
        numberOfCoins = this.config.totalValue / this.config.valueIncrement;
      } else {
        numberOfCoins = (this.config.totalValue - remainder) / this.config.valueIncrement;
      }

      if (numberOfCoins < minNumberOfCoins) numberOfCoins = minNumberOfCoins;
      if (numberOfCoins > maxNumberOfCoins) numberOfCoins = maxNumberOfCoins;

      if (this.config.totalValue <= numberOfCoins) {
        coinValueCount = this.config.totalValue;
        coinValue = 1;
      } else {
        if (this.config.totalValue % numberOfCoins === 0) {
          coinValueRemainder = 0;
          coinValue = this.config.totalValue / numberOfCoins;
        } else {
          coinValueRemainder = this.config.totalValue % numberOfCoins;
          coinValue = (this.config.totalValue - coinValueRemainder) / numberOfCoins;
        }
      }
    }

    // Loop through number of coins and populate points array.
    var loopCount = 0;
    for (var i = 0; i < numberOfCoins; i++) {

      var config = this.generateCoinConfig()

      if (coinValueRemainder === null) {
        config.value = (loopCount < coinValueCount) ? coinValue : 0;
      } else {
        config.value = coinValue;
        if (i === numberOfCoins - 1 && coinValueRemainder > 0)
          config.value += coinValueRemainder;
      }
      
      this.coins.push(new Coin(config));
      loopCount++;
    }
  },
  // 8) This factory function generates config for each coin object.
  generateCoinConfig: function() {
    var curveStartAngle, curveEndAngle;

    if (this.config.noSCurve === false) {
      curveStartAngle = Util.modulate(Math.random(), 1, [-this.config.arcAngleIntensity, this.config.arcAngleIntensity]);
      curveEndAngle = Util.modulate(Math.random(), 1, [-this.config.arcAngleIntensity, this.config.arcAngleIntensity]);
    } else {
      var curve = Util.modulate(Math.random(), 1, [-this.config.arcAngleIntensity, this.config.arcAngleIntensity]);
      curveStartAngle = curve;
      curveEndAngle = - curve;
    }

    return {
      startVector: this.startVector,
      endVector: this.endVector,

      timingFunction: this.config.timingFunction,

      delay: Util.modulate(Math.random(), 1, this.config.delayRange),
      duration: Util.modulate(Math.random(), 1, this.config.durationRange),
      curveStartIntensity: Util.modulate(Math.random(), 1, this.config.arcIntensityRange),
      curveEndIntensity: Util.modulate(Math.random(), 1, this.config.arcIntensityRange),

      curveStartAngle: curveStartAngle,
      curveEndAngle: curveEndAngle,

      beforeStart: this.config.beforeCoinStart,
      onStart: this.config.onCoinStart,
      onComplete: this.config.onCoinComplete,
    }
  },
  // 9) Create canvas element and calculate offset. Takes in a callback (begin method).
  createCanvas: function(callback) {
    if (
      this.isActive === true
      && typeof this.canvasElement === 'undefined'
    ) {
      this.offsetLeft = Math.min(this.startVector.x, this.endVector.x) - this.config.canvasMargin;
      this.offsetTop  = Math.min(this.startVector.y, this.endVector.y) - this.config.canvasMargin;
      var right  = Math.max(this.startVector.x, this.endVector.x);
      var bottom = Math.max(this.startVector.y, this.endVector.y);
      var width  = right - this.offsetLeft + this.config.canvasMargin * 2;
      var height = bottom - this.offsetTop + this.config.canvasMargin * 2;

      this.canvasElement = document.createElement('CANVAS');
      this.canvasElement.style.position  = 'absolute';
      this.canvasElement.style.zIndex    = this.config.zIndex.toString();
      this.canvasElement.style.left      = this.offsetLeft.toString() + 'px';
      this.canvasElement.style.top       = this.offsetTop.toString()  + 'px';
      this.canvasElement.style.width     = width.toString()  + 'px';
      this.canvasElement.style.height    = height.toString() + 'px';
      this.canvasElement.width  = width  * this.config.resolutionMultiplier;
      this.canvasElement.height = height * this.config.resolutionMultiplier;
      this.context = this.canvasElement.getContext('2d');
      this.image = new Image();
      this.image.onload = function() {
        this.config.parentElement.appendChild(this.canvasElement);
        callback();
      }.bind(this);
      this.image.src = this.config.imagePath;
    }
  },
  // 10) This is called once canvasElement is defined and is in the DOM. Start animation!
  begin: function() {
    if (this.isActive === true) {
      this.startAnimation();
      if (this.coins.length === 0) this.end();
    }
  },
  // 11) Initialize animation object and start it.
  startAnimation: function() {
    this.animation = new Animation({
      duration: 'forever',
      timingFunction: function(t) { return t },
      onStart: function() {
        this.config.onStart(this);
      }.bind(this),
      onTick: this.update.bind(this),
    });
    for (var i = 0; i < this.coins.length; i++)
      this.coins[i].start();
    this.animation.play();
  },
  // 12) Loop through each coins and draw them.
  update: function() {
    this.clearCanvas();
    var m = this.config.resolutionMultiplier;
    var completedCoins = 0;
    for (var i = 0; i < this.coins.length; i++) {
      if (this.coins[i].isActive === true) {
        if (this.coins[i].isMoving === true) {
          this.context.drawImage(
            this.image,
            (this.coins[i].position.x - this.offsetLeft - (this.config.coinSize / 2)) * m,
            (this.coins[i].position.y - this.offsetTop  - (this.config.coinSize / 2)) * m,
            this.config.coinSize * m,
            this.config.coinSize * m
          );
        }
      } else {
        completedCoins++;
      }
    }
    if (completedCoins === this.coins.length) this.end();
  },
  // 13) Helper function to clear canvas every frame.
  clearCanvas: function() {
    this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  },
  // 15) This is called after the last coin reached the end. Or if numberOfCoins is 0. Sayonara!
  end: function() {
    this.clearCanvas();
    this.animation.stop();
    this.canvasElement.remove();
    this.canvasElement = undefined;
    this.image = undefined;
    this.coins = [];
    this.endCount = 0;
    this.isActive = false;
    this.config.onComplete();
  },
}

export default CoinManager;