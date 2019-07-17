// @Util
var Util = {
  objectAssign: function(object1, object2) {
    var keys = Object.keys(object2);
    for (var i = 0; i < keys.length; i++)
      object1[keys[i]] = object2[keys[i]];
    return object1;
  },
  isHTMLElement: function(element) {
    return (
      typeof element === 'object'
      && typeof element.nodeType === 'number'
      && element.nodeType === 1
      && element instanceof HTMLElement
    );
  },
  cubicBezier: function(t, p1, cp1, cp2, p2) {
    return Math.pow(1 - t, 3) * p1 + 3 * t * Math.pow(1 - t, 2) * cp1 + 3 * t * t * (1 - t) * cp2 + t * t * t * p2;
  },
  hypotenuse: function(x, y) {
    var max = Math.max(Math.abs(x), Math.abs(y));
    if (max === 0) max = 1;
    var min = Math.min(Math.abs(x), Math.abs(y));    
    var n = min / max;
    return max * Math.sqrt(1 + n * n);
  },
  lerp: function(from, to, t) {
    return (1 - t) * from + t * to;
  },
  modulate: function(number, from, to) {
    if (typeof from === 'number') from = [0, from];
    if (typeof to === 'number') to = [0, to];
    var percent = (number - from[0]) / (from[1] - from[0]);
    var result;
    if (to[1] > to[0]) {
      result = percent * (to[1] - to[0]) + to[0];
    } else {
      result = to[0] - (percent * (to[0] - to[1]));
    }
    return result;
  },
  getEuclideanDistance: function(a, b) {
    if (a === b) return 0;
    return Math.sqrt(Math.abs((a - b) * (b - a)));
  },
  cycleNumber: function(number, range) {
    if (typeof range === 'number') range = [0, range];
    var max = Math.max(range[0], range[1]);
    var min = Math.min(range[0], range[1]);
    if (max === 0 && min === 0) return 0;
    var da = Util.getEuclideanDistance(min, max);
    var db, c;
    if (number > max) {
      db = Util.getEuclideanDistance(number, max);
      c = db % da + min;
      return c === min ? max : c;
    } else if (number < min) {
      db = Util.getEuclideanDistance(number, min);
      c = max - db % da;
      return c === max ? min : c;
    }
    return number;
  },
};

// @Vector2
var Vector2 = function(x, y) {
  this.init(x, y);
};

Vector2.prototype = {
  init: function(x, y) {
    this.x = (typeof x === 'number') ? x : 0;
    this.y = (typeof y === 'number') ? y : 0;
  },
  copy: function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  },
  clone: function() {
    return new Vector2(this.x, this.y);
  },
  add: function(by) {
    if (typeof by === 'object') {
      this.x += by.x;
      this.y += by.y;
    } else if (typeof by === 'number') {
      this.x += by;
      this.y += by;
    }
    return this;
  },
  subtract: function(by) {
    if (typeof by === 'object') {
      this.x -= by.x;
      this.y -= by.y;
    } else if (typeof by === 'number') {
      this.x -= by;
      this.y -= by;
    }
    return this;
  },
  multiply: function(by) {
    this.x *= by;
    this.y *= by;
    return this;
  },
  divide: function(by) {
    if (by === 0) by = 1;
    this.x /= by;
    this.y /= by;
    return this;
  },
  limit: function(by) {
    if (this.magnitude() > by)
      this.normalize().multiply(by, by);
    return this;
  },
  magnitude: function() {
    return Util.hypotenuse(this.x, this.y);
  },
  normalize: function() {
    var mag = Math.abs(this.magnitude()); 
    mag = mag === 0 ? 1 : mag;
    this.x /= mag;
    this.y /= mag;
    return this;
  },
  applyCubicBezier: function(t, p1, cp1, cp2, p2) {
    this.x = Util.cubicBezier(t, p1.x, cp1.x, cp2.x, p2.x);
    this.y = Util.cubicBezier(t, p1.y, cp1.y, cp2.y, p2.y);
  },
  getAngle: function() {
    var angle = Math.acos(this.x / this.magnitude());
    if (this.y < 0) angle = Math.PI + (Math.PI - angle);
    return angle;
  },
  getAngleTo: function(to) {
    return Vector2.subtract(to, this).getAngle();
  },
  getDistanceTo: function(to) {
    return Vector2
      .subtract(this, to)
      .magnitude();
  },
};

Vector2.subtract = function(a, b) {
  return new Vector2().copy(a).subtract(b.x, b.y);
};

// @Animation
var ANIMATION_DEFAULT_CONFIG = {
  duration: 1000, // In ms
  delay: 0,
  timingFunction: function(t) { return t },
  onTick: function() {},
  onStart: function() {},
  onComplete: function() {},
};

var Animation = function(config) {
  this.init(config);
};

Animation.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, ANIMATION_DEFAULT_CONFIG);
    this.setConfig(config);
    this.rafID;
    this.timeoutID;
    this.timeStart = 0;
    this.timeEnd = 0;
    this.isActive = false;
    this.isAnimating = false;
    this.progress = 0;
  },
  setConfig: function(config) {
    if (typeof config === 'object')
      Util.objectAssign(this.config, config);
  },
  updateProgress: function() {
    if (typeof this.config.duration === 'number') {
      var now = Date.now();
      this.progress = (now - this.timeStart) / this.config.duration;
      if (this.progress > 1) this.progress = 1;
    } else {
      this.progress = 0;
    }
  },
  loop: function() {
    if (this.isAnimating === true) {
      this.updateProgress();
      this.config.onTick(
        this.config.timingFunction(this.progress)
      );
      if (this.progress < 1) {
        this.continueLoop();
      } else {
        this.stop();
      }
    }
  },
  continueLoop: function() {
    if (this.isAnimating === true) {
      window.cancelAnimationFrame(this.rafID);
      this.rafID = window.requestAnimationFrame(
        this.loop.bind(this)
      );
    }
  },
  play: function() {
    if (this.isActive === false) {
      this.isActive = true;
      this.timeoutID = setTimeout(function() {
        this.isAnimating = true;
        this.timeStart = Date.now();
        this.config.onStart(this);
        this.continueLoop();  
      }.bind(this), this.config.delay);
    }
  },
  stop: function() {
    if (this.isActive === true) {
      window.cancelAnimationFrame(this.rafID);
      clearTimeout(this.timeoutID);
      this.isAnimating = false;
      this.isActive = false;
      this.timeEnd = Date.now();
      this.config.onComplete(this);
      this.progress = 0;
    }
  },
}

// @Coin
var COIN_DEFAULT_CONFIG = {
  // Animation
  delay: 1000,
  duration: 1000,
  timingFunction: function(t) { return t * t * t; },

  // Vectors
  startVector: new Vector2(),
  endVector: new Vector2(),

  // 0 -> 1
  curveStartIntensity: 0.5,
  curveEndIntensity: 0.5,

  curveStartAngle: 0,
  curveEndAngle: 0,

  beforeStart: function() {},
  onComplete: function() {},
};

var Coin = function(config) {
  this.init(config);
};

Coin.prototype = {
  // 1) Initialize properties and set config.
  init: function(config) {
    this.config = Util.objectAssign({}, COIN_DEFAULT_CONFIG);
    this.setConfig(config);

    this.animation = new Animation();
    this.isActive = false;

    this.amount = this.config.amount;
    this.position = new Vector2().copy(this.config.startVector);
    this.controlPoint1 = this.getControlPointVector(this.config.startVector, this.config.endVector,   this.config.curveStartIntensity, this.config.curveStartAngle);
    this.controlPoint2 = this.getControlPointVector(this.config.endVector,   this.config.startVector, this.config.curveEndIntensity,   this.config.curveEndAngle);
  },
  // 2) Set coin config.
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  // 3) Helper function to calculate control point vectors.
  getControlPointVector: function(from, to, intensity, angleOffset) {
    var distance = from.getDistanceTo(to);
    var length = distance * intensity;
    var angle = Util.cycleNumber(
      from.getAngleTo(to) + angleOffset, Math.PI * 2
    );
    return new Vector2(
      from.x + Math.cos(angle) * length,
      from.y + Math.sin(angle) * length,
    );
  },
  // 4) Start here.
  start: function() {
    this.animation.stop();
    this.animation.setConfig({
      delay: this.config.delay,
      duration: this.config.duration,
      timingFunction: this.config.timingFunction,
      onStart: function() {
        this.config.beforeStart(this);
        this.isActive = true;
      }.bind(this),
      onTick: this.tick.bind(this),
      onComplete: this.end.bind(this),
    });
    this.animation.play();
  },
  // 5)
  tick: function(t) {
    this.position.applyCubicBezier(t, this.config.startVector, this.controlPoint1, this.controlPoint2, this.config.endVector);
  },
  // 6) This is called once animation is completed.
  end: function() {
    this.isActive = false;
    this.config.onComplete(this);
  },
}

// @CoinManager
var COIN_MANAGER_DEFAULT_CONFIG = {
  startElement: null,
  endElement: null,
  parentElement: null,

  canvasMargin: 100,
  resolutionMultiplier: 1,
  zIndex: 0,

  imageURL: '',
  coinSize: 20,
  amount: 500,
  increment: 10,
  maxNumberOfCoins: 'infinite',

  timingFunction: function(t) { return t * t * t },

  minDelay: 100,
  maxDelay: 1000,

  minDuration: 400,
  maxDuration: 1200,

  minIntensity: 0,
  maxIntensity: 1,

  minAngleIntensity: 0,
  maxAngleIntensity: Math.PI / 2,

  noSCurve: false,

  onCoinStart: function(coin) {},
  onCoinComplete: function(coin) {},

  beforeStart: function() {},
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
    var amount = this.config.increment, remainder = 0, numberOfCoins = 0;

    // Calculate number of coins and remainder.
    if (this.config.increment > 0 && this.config.amount > 0) {
      remainder = this.config.amount % this.config.increment;
      var difference = this.config.amount - remainder;
      numberOfCoins = (difference === 0) ? 1 : difference / this.config.increment;
    }

    if (
      typeof this.config.maxNumberOfCoins === 'number'
      && numberOfCoins > this.config.maxNumberOfCoins
    ) {
      if (this.config.maxNumberOfCoins <= 0) {
        numberOfCoins = 0;
      } else {
        numberOfCoins = this.config.maxNumberOfCoins;
        remainder = this.config.amount % numberOfCoins;
        amount = (this.config.amount - remainder) / numberOfCoins;
      }
    }
    // Loop through number of coins and populate points array.
    for (var i = 0; i < numberOfCoins; i++) {
      var config = this.generateCoinConfig()
      config.amount = amount;
      if (i === numberOfCoins - 1 && remainder > 0) config.amount = remainder;
      this.coins.push(new Coin(config));
    }
  },
  // 8) This factory function generates config for each coin object.
  generateCoinConfig: function() {
    var curveStartAngle, curveEndAngle;
    if (this.config.noSCurve === false) {
      curveStartAngle = Util.modulate(Math.random(), 1, [-this.config.maxAngleIntensity, this.config.maxAngleIntensity]);
      curveEndAngle = Util.modulate(Math.random(), 1, [-this.config.maxAngleIntensity, this.config.maxAngleIntensity]);
    } else {
      var curve = Util.modulate(Math.random(), 1, [-this.config.maxAngleIntensity, this.config.maxAngleIntensity]);
      curveStartAngle = curve;
      curveEndAngle = - curve;
    }

    return {
      startVector: this.startVector,
      endVector:   this.endVector,

      timingFunction: this.config.timingFunction,

      delay:               Util.modulate(Math.random(), 1, [this.config.minDelay, this.config.maxDelay]),
      duration:            Util.modulate(Math.random(), 1, [this.config.minDuration, this.config.maxDuration]),
      curveStartIntensity: Util.modulate(Math.random(), 1, [this.config.minIntensity, this.config.maxIntensity]),
      curveEndIntensity:   Util.modulate(Math.random(), 1, [this.config.minIntensity, this.config.maxIntensity]),

      curveStartAngle: curveStartAngle,
      curveEndAngle:   curveEndAngle,

      beforeStart: this.config.onCoinStart,
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
      this.image.src = this.config.imageURL;
    }
  },
  // 10) This is called once canvasElement is defined and is in the DOM. Start animation!
  begin: function() {
    if (this.isActive === true) {
      this.config.beforeStart();
      this.startAnimation();
      if (this.coins.length === 0) this.end();
    }
  },
  // 11) Initialize animation object and start it.
  startAnimation: function() {
    this.animation = new Animation({
      delay: this.config.delay,
      duration: 'infinite',
      timingFunction: function(t) { return t },
      onStart: function() {
        this.config.beforeStart(this);
      }.bind(this),
      onTick: this.update.bind(this),
    });
    for (var i = 0; i < this.coins.length; i++) {
      this.coins[i].start();
    }
    this.animation.play();
  },
  // 12) Loop through each coins and draw them.
  update: function() {
    this.clearCanvas();
    var m = this.config.resolutionMultiplier;
    var completedCoins = 0;
    for (var i = 0; i < this.coins.length; i++) {
      if (this.coins[i].isActive === true) {
        this.context.drawImage(
          this.image,
          (this.coins[i].position.x - this.offsetLeft - (this.config.coinSize / 2)) * m,
          (this.coins[i].position.y - this.offsetTop  - (this.config.coinSize / 2)) * m,
          this.config.coinSize * m,
          this.config.coinSize * m
        );
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

// Implementation.
import coinsvg from './coin.svg';

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
  amount: 1000,
  increment: 20,
  maxNumberOfCoins: 300,

  timingFunction: function(t) { return t; },

  minDelay: 0,
  maxDelay: 0,

  minDuration: 600,
  maxDuration: 1000,

  maxIntensity: 0.5,
  maxAngleIntensity: Math.PI / 4,

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