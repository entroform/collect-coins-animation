parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"cBYR":[function(require,module,exports) {
module.exports="coin.9a3164e4.svg";
},{}],"epB2":[function(require,module,exports) {
"use strict";var t=i(require("./coin.svg"));function i(t){return t&&t.__esModule?t:{default:t}}function n(t){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var e={objectAssign:function(t,i){for(var n=Object.keys(i),e=0;e<n.length;e++)t[n[e]]=i[n[e]];return t},isHTMLElement:function(t){return"object"===n(t)&&"number"==typeof t.nodeType&&1===t.nodeType&&t instanceof HTMLElement},cubicBezier:function(t,i,n,e,o){return Math.pow(1-t,3)*i+3*t*Math.pow(1-t,2)*n+3*t*t*(1-t)*e+t*t*t*o},hypotenuse:function(t,i){var n=Math.max(Math.abs(t),Math.abs(i));0===n&&(n=1);var e=Math.min(Math.abs(t),Math.abs(i))/n;return n*Math.sqrt(1+e*e)},lerp:function(t,i,n){return(1-n)*t+n*i},modulate:function(t,i,n){"number"==typeof i&&(i=[0,i]),"number"==typeof n&&(n=[0,n]);var e=(t-i[0])/(i[1]-i[0]);return n[1]>n[0]?e*(n[1]-n[0])+n[0]:n[0]-e*(n[0]-n[1])},getEuclideanDistance:function(t,i){return t===i?0:Math.sqrt(Math.abs((t-i)*(i-t)))},cycleNumber:function(t,i){"number"==typeof i&&(i=[0,i]);var n=Math.max(i[0],i[1]),o=Math.min(i[0],i[1]);if(0===n&&0===o)return 0;var s,a=e.getEuclideanDistance(o,n);return t>n?(s=e.getEuclideanDistance(t,n)%a+o)===o?n:s:t<o?(s=n-e.getEuclideanDistance(t,o)%a)===n?o:s:t}},o=function(t,i){this.init(t,i)};o.prototype={init:function(t,i){this.x="number"==typeof t?t:0,this.y="number"==typeof i?i:0},copy:function(t){return this.x=t.x,this.y=t.y,this},clone:function(){return new o(this.x,this.y)},add:function(t,i){return this.x+=t,this.y+=i,this},subtract:function(t,i){return this.x-=t,this.y-=i,this},multiply:function(t,i){return this.x*=t,this.y*=i,this},divide:function(t,i){return this.x/=t,this.y/=i,this},magnitude:function(){return e.hypotenuse(this.x,this.y)},normalize:function(){var t=Math.abs(this.magnitude());return t=0===t?1:t,this.x/=t,this.y/=t,this},applyCubicBezier:function(t,i,n,o,s){this.x=e.cubicBezier(t,i.x,n.x,o.x,s.x),this.y=e.cubicBezier(t,i.y,n.y,o.y,s.y)},getAngle:function(){var t=Math.acos(this.x/this.magnitude());return this.y<0&&(t=Math.PI+(Math.PI-t)),t},getAngleTo:function(t){return o.subtract(t,this).getAngle()},getDistanceTo:function(t){return o.subtract(this,t).magnitude()}},o.subtract=function(t,i){return(new o).copy(t).subtract(i.x,i.y)};var s={duration:1e3,delay:0,timingFunction:function(t){return t},onTick:function(){},onStart:function(){},onComplete:function(){}},a=function(t){this.init(t)};a.prototype={init:function(t){this.config=e.objectAssign({},s),this.applyConfig(t),this.rafID,this.timeStart=0,this.timeEnd=0,this.isActive=!1,this.isAnimating=!1,this.progress=0},applyConfig:function(t){"object"===n(t)&&e.objectAssign(this.config,t)},updateProgress:function(){if("number"==typeof this.config.duration){var t=Date.now();this.progress=(t-this.timeStart)/this.config.duration,this.progress>1&&(this.progress=1)}else this.progress=0},loop:function(){!0===this.isAnimating&&(this.updateProgress(),this.config.onTick(this.config.timingFunction(this.progress)),this.progress<1?this.continueLoop():this.stop())},continueLoop:function(){!0===this.isAnimating&&(window.cancelAnimationFrame(this.rafID),this.rafID=window.requestAnimationFrame(this.loop.bind(this)))},play:function(){!1===this.isActive&&(this.isActive=!0,setTimeout(function(){this.isAnimating=!0,this.timeStart=Date.now(),this.config.onStart(this),this.continueLoop()}.bind(this),this.config.delay))},stop:function(){!0===this.isActive&&(window.cancelAnimationFrame(this.rafID),this.isAnimating=!1,this.isActive=!1,this.timeEnd=Date.now(),this.config.onComplete(this),this.progress=0)}};var c={delay:1e3,duration:1e3,timingFunction:function(t){return t*t*t},startVector:new o,endVector:new o,curveStartIntensity:.5,curveEndIntensity:.5,curveStartAngle:0,curveEndAngle:0,beforeStart:function(){},onComplete:function(){}},r=function(t,i){this.init(t,i)};r.prototype={init:function(t,i){this.config=e.objectAssign({},c),this.applyConfig(i),this.manager=t,this.animation=new a,this.isActive=!1,this.amount=this.config.amount,this.position=(new o).copy(this.config.startVector),this.controlPoint1=this.getControlPointVector(this.config.startVector,this.config.endVector,this.config.curveStartIntensity,this.config.curveStartAngle),this.controlPoint2=this.getControlPointVector(this.config.endVector,this.config.startVector,this.config.curveEndIntensity,this.config.curveEndAngle)},applyConfig:function(t){"object"===n(t)&&e.objectAssign(this.config,t)},getControlPointVector:function(t,i,n,s){var a=t.getDistanceTo(i)*n,c=e.cycleNumber(t.getAngleTo(i)+s,2*Math.PI);return new o(t.x+Math.cos(c)*a,t.y+Math.sin(c)*a)},start:function(){this.animation.stop(),this.animation.applyConfig({delay:this.config.delay,duration:this.config.duration,timingFunction:this.config.timingFunction,onStart:function(){this.config.beforeStart(this),this.isActive=!0}.bind(this),onTick:this.tick.bind(this),onComplete:this.end.bind(this)}),this.animation.play()},tick:function(t){this.position.applyCubicBezier(t,this.config.startVector,this.controlPoint1,this.controlPoint2,this.config.endVector)},end:function(){this.isActive=!1,this.config.onComplete(this),this.manager.onCoinEnd()}};var h={startElement:null,endElement:null,parentElement:null,canvasMargin:100,resolutionMultiplier:1,zIndex:0,imageURL:"",coinSize:20,amount:500,increment:10,maxNumberOfCoins:"infinite",timingFunction:function(t){return t*t*t},minDelay:100,maxDelay:1e3,minDuration:400,maxDuration:1200,minIntensity:0,maxIntensity:1,minAngleIntensity:0,maxAngleIntensity:Math.PI/2,noSCurve:!1,onCoinStart:function(t){},onCoinComplete:function(t){},beforeStart:function(){},onComplete:function(){}},u=function(t){this.init(t)};u.prototype={init:function(t){this.config=e.objectAssign({},h),this.applyConfig(t),this.animation,this.isActive=!1,this.startVector,this.endVector,this.coins=[],this.endCount=0,this.canvasElement,this.context,this.image,this.offsetLeft,this.offsetRight},applyConfig:function(t){"object"===n(t)&&e.objectAssign(this.config,t)},start:function(){this.setup(this.begin.bind(this))},setup:function(t){!1===this.isActive&&(this.isActive=!0,this.getTargetVectors(),this.populate(),this.createCanvas(t))},getTargetVectors:function(){this.startVector=this.getTargetVectorFromElement(this.config.startElement),this.endVector=this.getTargetVectorFromElement(this.config.endElement)},getTargetVectorFromElement:function(t){var i=t.getBoundingClientRect();return new o(i.left+i.width/2,i.top+i.height/2)},populate:function(){this.coins=[];var t=this.config.increment,i=0,n=0;if(this.config.increment>0&&this.config.amount>0){i=this.config.amount%this.config.increment;var e=this.config.amount-i;n=0===e?1:e/this.config.increment}"number"==typeof this.config.maxNumberOfCoins&&n>this.config.maxNumberOfCoins&&(this.config.maxNumberOfCoins<=0?n=0:(n=this.config.maxNumberOfCoins,i=this.config.amount%n,t=(this.config.amount-i)/n));for(var o=0;o<n;o++){var s=this.getCoinConfig();s.amount=t,o===n-1&&i>0&&(s.amount=i),this.coins.push(new r(this,s))}},getCoinConfig:function(){var t,i;if(!1===this.config.noSCurve)t=e.modulate(Math.random(),1,[-this.config.maxAngleIntensity,this.config.maxAngleIntensity]),i=e.modulate(Math.random(),1,[-this.config.maxAngleIntensity,this.config.maxAngleIntensity]);else{var n=e.modulate(Math.random(),1,[-this.config.maxAngleIntensity,this.config.maxAngleIntensity]);t=n,i=-n}return{startVector:this.startVector,endVector:this.endVector,timingFunction:this.config.timingFunction,delay:e.modulate(Math.random(),1,[this.config.minDelay,this.config.maxDelay]),duration:e.modulate(Math.random(),1,[this.config.minDuration,this.config.maxDuration]),curveStartIntensity:e.modulate(Math.random(),1,[this.config.minIntensity,this.config.maxIntensity]),curveEndIntensity:e.modulate(Math.random(),1,[this.config.minIntensity,this.config.maxIntensity]),curveStartAngle:t,curveEndAngle:i,beforeStart:this.config.onCoinStart,onComplete:this.config.onCoinComplete}},createCanvas:function(t){if(!0===this.isActive&&void 0===this.canvasElement){this.offsetLeft=Math.min(this.startVector.x,this.endVector.x)-this.config.canvasMargin,this.offsetTop=Math.min(this.startVector.y,this.endVector.y)-this.config.canvasMargin;var i=Math.max(this.startVector.x,this.endVector.x),n=Math.max(this.startVector.y,this.endVector.y),e=i-this.offsetLeft+2*this.config.canvasMargin,o=n-this.offsetTop+2*this.config.canvasMargin;this.canvasElement=document.createElement("CANVAS"),this.canvasElement.style.position="absolute",this.canvasElement.style.zIndex=this.config.zIndex.toString(),this.canvasElement.style.left=this.offsetLeft.toString()+"px",this.canvasElement.style.top=this.offsetTop.toString()+"px",this.canvasElement.style.width=e.toString()+"px",this.canvasElement.style.height=o.toString()+"px",this.canvasElement.width=e*this.config.resolutionMultiplier,this.canvasElement.height=o*this.config.resolutionMultiplier,this.context=this.canvasElement.getContext("2d"),this.image=new Image,this.image.onload=function(){this.config.parentElement.appendChild(this.canvasElement),t()}.bind(this),this.image.src=this.config.imageURL}},begin:function(){!0===this.isActive&&(this.config.beforeStart(),this.startAnimation(),0===this.coins.length&&this.end())},startAnimation:function(){this.animation=new a({delay:this.config.delay,duration:"infinite",timingFunction:function(t){return t},onStart:function(){this.config.beforeStart(this)}.bind(this),onTick:this.update.bind(this)});for(var t=0;t<this.coins.length;t++)this.coins[t].start();this.animation.play()},update:function(){this.clearCanvas();for(var t=this.config.resolutionMultiplier,i=0;i<this.coins.length;i++)!0===this.coins[i].isActive&&this.context.drawImage(this.image,(this.coins[i].position.x-this.offsetLeft-this.config.coinSize/2)*t,(this.coins[i].position.y-this.offsetTop-this.config.coinSize/2)*t,this.config.coinSize*t,this.config.coinSize*t)},clearCanvas:function(){this.context.clearRect(0,0,this.canvasElement.width,this.canvasElement.height)},onCoinEnd:function(){this.clearCanvas(),this.endCount++,this.endCount===this.coins.length&&this.end()},end:function(){this.animation.stop(),this.canvasElement.remove(),this.canvasElement=void 0,this.image=void 0,this.coins=[],this.endCount=0,this.isActive=!1,this.config.onComplete()}};var f=document.querySelector(".container"),g=document.querySelector(".collect-button"),m=document.querySelector(".coinTarget"),l=document.querySelector(".coinsValue"),d=new u({startElement:g,endElement:m,parentElement:f,canvasMargin:100,resolutionMultiplier:1,zIndex:1e3,imageURL:t.default,coinSize:20,amount:1e3,increment:20,maxNumberOfCoins:300,timingFunction:function(t){return t},minDelay:0,maxDelay:0,minDuration:600,maxDuration:1e3,maxIntensity:.5,maxAngleIntensity:Math.PI/4,noSCurve:!0,onCoinComplete:function(t){m.classList.remove("coinTarget--animate"),m.classList.add("coinTarget--animate"),l.textContent=parseInt(l.textContent,10)+t.amount}.bind(void 0),onComplete:function(){m.classList.remove("coinTarget--animate")}});g.addEventListener("click",function(){d.start()});
},{"./coin.svg":"cBYR"}]},{},["epB2"], null)
//# sourceMappingURL=main.43e6bb9b.js.map