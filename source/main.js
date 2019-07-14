// @Util
const Util = {
  objectAssign: function(object1, object2) {
    const keys = Object.keys(object2);
    for (let i = 0; i < keys.length; i++)
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
    let max = Math.max(Math.abs(x), Math.abs(y));
    if (max === 0) max = 1;
    const min = Math.min(Math.abs(x), Math.abs(y));    
    const n = min / max;
    return max * Math.sqrt(1 + n * n);
  },
  lerp: function(from, to, t) {
    return (1 - t) * from + t * to;
  },
  modulate(number, from, to) {
    if (typeof from === 'number') from = [0, from];
    if (typeof to === 'number') to = [0, to];
    const percent = (number - from[0]) / (from[1] - from[0]);
    let result;
    if (to[1] > to[0]) {
      result = percent * (to[1] - to[0]) + to[0];
    } else {
      result = to[0] - (percent * (to[0] - to[1]));
    }
    return result;
  },
  getEuclideanDistance(a, b) {
    if (a === b) return 0;
    return Math.sqrt(Math.abs((a - b) * (b - a)));
  },
  cycleNumber(number, range) {
    if (typeof range === 'number') range = [0, range];
    const max = Math.max(range[0], range[1]);
    const min = Math.min(range[0], range[1]);
    if (max === 0 && min === 0) return 0;
    const da = Util.getEuclideanDistance(min, max);
    let db, c;
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
const Vector2 = function(x, y) {
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
  add: function(x, y) {
    this.x += x;
    this.y += y;
    return this;
  },
  subtract: function(x, y) {
    this.x -= x;
    this.y -= y;
    return this;
  },
  multiply: function(x, y) {
    this.x *= x;
    this.y *= y;
    return this;
  },
  divide: function(x, y) {
    this.x /= x;
    this.y /= y;
    return this;
  },
  magnitude: function() {
    return Util.hypotenuse(this.x, this.y);
  },
  normalize: function() {
    let mag = Math.abs(this.magnitude()); 
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
    let angle = Math.acos(this.x / this.magnitude());
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
const ANIMATION_DEFAULT_CONFIG = {
  duration: 1000, // In ms
  delay: 0,
  timingFunction: function(t) { return t },
  onTick: function() {},
  onStart: function() {},
  onComplete: function() {},
};

const Animation = function(config) {
  this.init(config);
};

Animation.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, ANIMATION_DEFAULT_CONFIG);
    this.setConfig(config);
    this.rafID;
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
    const now = Date.now();
    this.progress = (now - this.timeStart) / this.config.duration;
    if (this.progress > 1) this.progress = 1;
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
      setTimeout(function() {
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
      this.isAnimating = false;
      this.isActive = false;
      this.timeEnd = Date.now();
      this.config.onComplete(this);
      this.progress = 0;
    }
  },
}

// @Coin
const COIN_DEFAULT_CONFIG = {
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

  prepareElement: function() {},

  move: function(pointElement, position) {
    const left = pointElement.offsetWidth / 2;
    const top = pointElement.offsetHeight / 2;
    pointElement.style.transform = `translateX(${position.x - left}px) translateY(${position.y - top}px)`;
  },

  beforeStart: function() {},
  onComplete: function() {},
};

const Coin = function(manager, config) {
  this.init(manager, config);
};

Coin.prototype = {
  init: function(manager, config) {
    this.config = Util.objectAssign({}, COIN_DEFAULT_CONFIG);
    this.setConfig(config);

    this.amount = this.config.amount;

    this.manager = manager;
    this.animation = new Animation();
    this.isActive = false;
    this.element;

    this.position = new Vector2().copy(this.config.startVector);
    this.controlPoint1 = this.getControlPointVector(this.config.startVector, this.config.endVector,   this.config.curveStartIntensity, this.config.curveStartAngle);
    this.controlPoint2 = this.getControlPointVector(this.config.endVector,   this.config.startVector, this.config.curveEndIntensity,   this.config.curveEndAngle);
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  create: function() {
    this.element = document.createElement('DIV');
    this.config.prepareElement(this.element);
  },
  destroy: function() {
    if (Util.isHTMLElement(this.element) === true) this.element.remove();
  },
  start: function() {
    this.animation.stop();
    this.animation.setConfig({
      delay: this.config.delay,
      duration: this.config.duration,
      timingFunction: this.config.timingFunction,
      onStart: function() {
        this.create();
        this.config.beforeStart(this);
      }.bind(this),
      onTick: this.tick.bind(this),
      onComplete: this.end.bind(this),
    });
    this.animation.play();
  },
  end: function() {
    this.destroy();
    this.config.onComplete(this);
    this.manager.onCoinEnd();
  },
  getControlPointVector: function(from, to, intensity, angleOffset) {
    const distance = from.getDistanceTo(to);
    const length = distance * intensity;
    const angle = Util.cycleNumber(
      from.getAngleTo(to) + angleOffset, Math.PI * 2
    );
    return new Vector2(
      from.x + Math.cos(angle) * length,
      from.y + Math.sin(angle) * length,
    );
  },
  tick: function(t) {
    this.position.applyCubicBezier(t, this.config.startVector, this.controlPoint1, this.controlPoint2, this.config.endVector);
    this.config.move(this.element, this.position, this);
  },
}

// @CoinManager
const COIN_MANAGER_DEFAULT_CONFIG = {
  startElement: null,
  endElement: null,
  parentElement: null,

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

  coinClassName: 'coin',
  beforeStart: function() {},
  onCoinStart: function(coin) {},
  onCoinComplete: function(coin) {},
  onComplete: function() {},
};

const CoinManager = function(config) {
  this.init(config);
};

CoinManager.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, COIN_MANAGER_DEFAULT_CONFIG);
    this.setConfig(config);

    this.isActive = false;
    this.startVector;
    this.endVector;
    this.coins = [];
    this.endCount = 0;
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  start: function() {
    if (this.isActive === false) {
      this.getTargetVectors();
      this.populate();
      this.isActive = true;
      this.config.beforeStart();
      for (let i = 0; i < this.coins.length; i++) this.coins[i].start();
      if (this.coins.length === 0) this.end();
    }
  },
  onCoinEnd: function() {
    this.endCount++;
    if (this.endCount === this.coins.length) this.end();
  },
  end: function() {
    this.coins = [];
    this.endCount = 0;
    this.isActive = false;
    this.config.onComplete();
  },
  getTargetVectors: function() {
    this.startVector = this.getTargetVectorFromElement(this.config.startElement);
    this.endVector   = this.getTargetVectorFromElement(this.config.endElement);
  },
  getTargetVectorFromElement: function(element) {
    const rect = element.getBoundingClientRect();
    return new Vector2(
      rect.left + (rect.width  / 2),
      rect.top  + (rect.height / 2),
    );
  },
  populate: function() {
    this.coins = [];
    let amount = this.config.increment, remainder = 0, numberOfCoins = 0;

    // Calculate number of coins and remainder.
    if (this.config.increment > 0 && this.config.amount > 0) {
      remainder = this.config.amount % this.config.increment;
      let difference = this.config.amount - remainder;
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
    for (let i = 0; i < numberOfCoins; i++) {
      let config = this.getCoinConfig()
      config.amount = amount;
      if (i === numberOfCoins - 1 && remainder > 0) config.amount = remainder;
      this.coins.push(new Coin(this, config));
    }
  },
  getCoinConfig: function() {
    let curveStartAngle, curveEndAngle;
    if (this.config.noSCurve === false) {
      curveStartAngle = Util.modulate(Math.random(), 1, [-this.config.maxAngleIntensity, this.config.maxAngleIntensity]);
      curveEndAngle = Util.modulate(Math.random(), 1, [-this.config.maxAngleIntensity, this.config.maxAngleIntensity]);
    } else {
      const curve = Util.modulate(Math.random(), 1, [-this.config.maxAngleIntensity, this.config.maxAngleIntensity]);
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

      prepareElement: function(element) {
        element.classList.add(this.config.coinClassName);
        this.config.parentElement.appendChild(element);
      }.bind(this),

      beforeStart: this.config.onCoinStart,
      onComplete: this.config.onCoinComplete,
    }
  },
}

// Implementation.
const containerElement = document.querySelector('.container');
const startElement     = document.querySelector('.collect-button');
const endElement       = document.querySelector('.coinTarget');
const coinsValue       = document.querySelector('.coinsValue');

const coinManager = new CoinManager({
  coinClassName: 'coin',

  startElement: startElement,
  endElement: endElement,
  parentElement: containerElement,

  timingFunction: function(t) { return t; },

  amount: 1000,
  increment: 20,

  maxNumberOfCoins: 'infinite',

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

startElement.addEventListener('click', () => {
  coinManager.start();
});