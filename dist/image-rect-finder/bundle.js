!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function r(e,t,n){var r,o,i,a=t;return(r=[n],i=r.length,new Promise((function(e,t){function n(){--i||e(o)}o=r.map((function(e){var r=new Image;return r.onload=n,r.onerror=t,r.crossOrigin="",r.src=e,r}))}))).then((function(t){var n=t[0],r=document.createElement("canvas"),o=a.getBoundingClientRect();r.width=o.width,r.height=o.height;var i=r.getContext("2d"),u=n.naturalWidth/o.width,c=n.naturalHeight/o.height;return i.scale(o.width/n.naturalWidth,o.height/n.naturalHeight),i.drawImage(n,0,0),function(e,t,n,r,o){var i=t.getImageData(0,0,n,r),a=new Promise((function(t,n){e.onmessage=function(e){t(e.data)},e.onerror=n}));return e.postMessage({imageData:i,options:o},[i.data.buffer]),a}(e,i,o.width,o.height,{shade:0,candidateThreshold:20,topLeft:{targetBlockMax:10,edgeDiffMin:38},bottomRight:{targetBlockMax:12,edgeDiffMin:38}}).then((function(e){console.log("foundRect",e),i.clearRect(e.left*u,e.top*c,e.width*u,e.height*c),a.style.background="transparent",a.hasChildNodes()&&a.removeChild(a.firstChild),a.appendChild(r)}))}))}function o(e){var t,n=e.image,o=e.resizeWait,i=void 0===o?100:o,a=new Worker("find-rect-worker.js"),u=(t=n,window.getComputedStyle(t).getPropertyValue("background-image").match(/url\(["']*([^"')]+)["']*\)/)[1]),c=!1;return window.addEventListener("resize",(function(){c||(c=!0,setTimeout((function(){r(a,n,u).then((function(){c=!1})).catch((function(e){console.error("drawPhone failed",e),c=!1}))}),i))})),r(a,n,u)}n.r(t),window.addEventListener("DOMContentLoaded",(function(){o({image:document.querySelector(".image")})}),{once:!0})}]);