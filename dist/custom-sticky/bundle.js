!function(t){function e(i){if(n[i])return n[i].exports;var o=n[i]={i:i,l:!1,exports:{}};return t[i].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var n={};e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,i){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:i})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=2)}([function(t,e,n){"use strict";function i(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=new l(t),n=void 0;return{_:{getUpdateResize:function(){return e.updateResize.bind(e)},getUpdateScroll:function(){return function(t,n){return e.yBasisPromise.then(function(){e.updateScroll(t,n)})}},reset:e.resetYBasisPromise.bind(e)},getLastY:function(){return e.saveY},start:function(t,i){if(Array.isArray(t)&&t.length>0){var o=l.prototype.updateScroll.bind(e),r=t.map(function(t){return t._.getUpdateScroll()});e.updateScroll=function(t,e){o(t,e),r.forEach(function(n){return n(t,e)})};var s=l.prototype.updateResize.bind(e),a=t.map(function(t){return t._.getUpdateResize()});e.updateResize=function(t){s(t),a.forEach(function(e){return e(t)})},n=t}else n=null;e.start(i)},stop:function(){n&&n.forEach(function(t){return t._.reset()}),e.stop()}}}Object.defineProperty(e,"__esModule",{value:!0}),e.CSDirection=void 0;var s=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}();e.createCustomSticky=r;var a=n(3),c=e.CSDirection=function(){function t(){o(this,t)}return s(t,null,[{key:"up",get:function(){return"up"}},{key:"down",get:function(){return"down"}},{key:"left",get:function(){return"left"}},{key:"right",get:function(){return"right"}}]),t}(),l=function(){function t(e){var n=this;o(this,t),this.opts=Object.assign({},{resizeWait:150,direction:c.up,alwaysVisible:!1,animationLength:function(){return window.innerHeight}},e),this.scrollSource=document.querySelector(this.opts.scrollSelector),this.scrollSource||console.warn('failed to identify a scroll source with "'+this.opts.scrollSelector+'"');var r=t.optionRectFn(this.opts.target);switch(r||(r=function(){return{}},console.warn('failed to identify targetElement with "'+this.opts.target+'"')),this.movingElement=document.querySelector(this.opts.movingSelector),this.movingElement||console.warn('failed to identify moving element with "'+this.opts.movingSelector+'"'),this.notify=this.opts.notify?setTimeout.bind(null,this.opts.notify,0):function(){return!1},this.opts.direction){case c.right:this.transform=function(t){return"translateX("+t+"px)"},this.traverseLength=function(){return Math.ceil(r().left-n.movingElement.getBoundingClientRect().right)};break;case c.left:this.transform=function(t){return"translateX("+-t+"px)"},this.traverseLength=function(){return Math.ceil(n.movingElement.getBoundingClientRect().left-r().right)};break;case c.down:this.transform=function(t){return"translateY("+t+"px)"},this.traverseLength=function(){return Math.ceil(r().top-n.movingElement.getBoundingClientRect().bottom)};break;default:case c.up:this.transform=function(t){return"translateY("+-t+"px)"},this.traverseLength=function(){return Math.ceil(n.movingElement.getBoundingClientRect().top-r().bottom)}}"function"==typeof this.opts.traverseLength&&(this.traverseLength=this.opts.traverseLength),"function"==typeof this.opts.transform&&(this.transform=this.opts.transform),this.uBoundAccurate=!1,this.uBound=this.traverseLength(),(Number.isNaN(this.uBound)||this.uBound<=0)&&console.warn("traverseLength must return a positive number"),this.animationLength=this.opts.animationLength(),this.tickScroll=!1,this.tickResize=!1,this.started=!1,this.yBasisOrigins=i({},window.innerHeight,null),this.yBasis=void 0,this.saveY=0,this.animate=!0,this.onScroll=this.onScroll.bind(this),this.onResize=this.onResize.bind(this),this.onIntersection=this.onIntersection.bind(this),this.yBasisPromise=new Promise(function(t){n.yBasisResolver=t}),(0,a.createIntersectionObserver)(this.onIntersection).observe(this.movingElement),window.addEventListener("resize",this.onResize,{passive:!0})}return s(t,[{key:"resetYBasisPromise",value:function(){var t=this;this.opts.alwaysVisible||(this.yBasisPromise=new Promise(function(e){t.yBasisResolver=e}))}},{key:"onResize",value:function(){var t=this;this.tickResize||(this.tickResize=!0,setTimeout(function(){window.requestAnimationFrame(function(){t.updateResize(t.scrollSource.scrollTop),t.tickResize=!1})},this.opts.resizeWait))}},{key:"onScroll",value:function(){var t=this;this.tickScroll||(this.tickScroll=!0,window.requestAnimationFrame(function(){t.updateScroll(t.scrollSource.scrollTop),t.tickScroll=!1}))}},{key:"onIntersection",value:function(t){var e=this,n=t.filter(function(t){return t.target.isEqualNode(e.movingElement)}),i=n&&n.length>0?n[0]:null;if(i){var o=i.intersectionRect.width>0||i.intersectionRect.height>0,r=window.innerHeight,s=this.scrollSource.scrollTop;if(!this.yBasisOrigins[r]&&(this.yBasisOrigins[r]={intersected:o,basis:o?s:0}),o){var a=i.intersectionRect.top<r/2;this.yBasisOrigins[r].intersected||a||(this.yBasisOrigins[r].intersected=!0,this.yBasisOrigins[r].basis=s),this.yBasis=a?this.yBasisOrigins[r].basis:s}else this.yBasis=void 0;this.yBasisResolver()}}},{key:"updateResize",value:function(t){var e=this.movingElement.style.transform;if(this.movingElement.style.transform=this.transform(0),window.getComputedStyle(this.movingElement).transform,this.uBound=this.traverseLength(),this.animationLength=this.opts.animationLength(),this.started){var n=window.innerHeight,i=0;this.yBasisOrigins[n]&&(i=this.yBasisOrigins[n].basis);var o=this.calculateProgress(t);o<this.uBound&&t>=i&&!this.animate?(this.animate=!0,this.scrollSource.scrollTop=t+this.uBound):(this.updateScroll(t,!0),this.saveY=Math.min(t,this.animationLength*(Math.min(o,this.uBound)/this.uBound)+i))}else this.movingElement.style.transform=e}},{key:"browserBugUpdateUbound",value:function(t){if(!t&&!this.uBoundAccurate){this.uBoundAccurate=!0;var e=this.traverseLength();e>this.uBound&&(this.uBound=e)}}},{key:"calculateProgress",value:function(t){return this.uBound*((Math.max(t,this.yBasis)-this.yBasis)/this.animationLength)}},{key:"updateScroll",value:function(t,e){if(void 0!==this.yBasis){this.browserBugUpdateUbound(e);var n=this.calculateProgress(t),i=0===t;if(this.animate||i||e){var o=this.uBound<=n,r=!this.animate&&i&&!e,s=Math.min(n,this.uBound);this.saveY=e?this.saveY:t,this.movingElement.style.transform=this.transform(s),o?(this.animate=!1,this.notify(!0)):r&&(this.animate=!0,this.notify(!1))}else this.animate=n<this.uBound&&t>=this.yBasis,this.animate&&this.notify(!1)}}},{key:"start",value:function(t){var e=this;this.yBasisPromise.then(function(){e.scrollSource.addEventListener("scroll",e.onScroll,{passive:!0}),e.started=!0;var n=e.scrollSource.scrollTop;void 0!==t&&n<t?e.scrollSource.scrollTop=t:e.updateScroll(n,!0)})}},{key:"stop",value:function(){this.scrollSource.removeEventListener("scroll",this.onScroll),this.started=!1,this.resetYBasisPromise()}}],[{key:"optionRectFn",value:function(t){var e=void 0;if("function"==typeof t)e=t;else{var n=document.querySelector(t);n&&(e=n.getBoundingClientRect.bind(n))}return e}}]),t}();e.default=r},function(t,e,n){"use strict";function i(t){var e=t.querySelectorAll("*[parallax]"),n=[],i=!1;"none"==getComputedStyle(document.body).transform&&(document.body.style.transform="translateZ(0)");var r=document.createElement("div");r.style.position="fixed",r.style.top="0",r.style.width="1px",r.style.height="1px",r.style.zIndex=1,document.body.insertBefore(r,document.body.firstChild);for(var s=0;s<e.length;s++){var a=e[s],c=a.parentNode;if("visible"==getComputedStyle(c).overflow){t&&c.parentNode!=t&&console.warn("Currently we only track a single overflow clip, but elements from multiple clips found.",a);var t=c.parentNode;"visible"==getComputedStyle(t).overflow&&console.error("Parent of sticky container should be scrollable element",a);var l;i||getComputedStyle(t).webkitOverflowScrolling?(i=!0,l=c):(l=t,c.style.transformStyle="preserve-3d"),l.style.perspectiveOrigin="bottom right",l.style.perspective="1px",i&&(a.style.position="-webkit-sticky"),i&&(a.style.top="0"),a.style.transformOrigin="bottom right";for(var u=e[s].previousElementSibling;u&&u.hasAttribute("parallax");)u=u.previousElementSibling;for(var h=e[s].nextElementSibling;h&&!h.hasAttribute("parallax-cover");)h=h.nextElementSibling;n.push({node:e[s],top:e[s].offsetTop,sticky:!!i,nextCover:h,previousCover:u})}else console.error("Need non-scrollable container to apply perspective for",a)}t.addEventListener("scroll",function(){for(var e=0;e<n.length;e++){var i=n[e].node.parentNode,o=n[e].previousCover,r=n[e].nextCover,s=o?o.offsetTop+o.offsetHeight:0,a=r?r.offsetTop:i.offsetHeight;s-200-t.clientHeight<t.scrollTop&&t.scrollTop;"block"!=n[e].node.style.display&&(n[e].node.style.display="block")}}),window.addEventListener("resize",o.bind(null,n)),o(n);for(var s=0;s<e.length;s++)e[s].parentNode.insertBefore(e[s],e[s].parentNode.firstChild)}function o(t){for(var e=0;e<t.length;e++){var n=t[e].node.parentNode,i=n.parentNode,o=t[e].previousCover,r=t[e].nextCover,s=t[e].node.getAttribute("parallax"),a=o?o.offsetTop+o.offsetHeight:0,c=t[e].sticky?0:i.offsetWidth-i.clientWidth,l=(t[e].sticky,t[e].node.offsetHeight),u=0;if(s)u=1-1/s;else{u=(l-(r?r.offsetTop:n.offsetHeight)+a)/(l-i.clientHeight)}t[e].sticky&&(u=1/u);var h=1/(1-u),f=c*(h-1),d=t[e].sticky?-(i.scrollHeight-a-l)*(1-h):(a-u*(l-i.clientHeight))*h;t[e].node.style.transform="scale("+(1-u)+") translate3d("+f+"px, "+d+"px, "+u+"px)"}}Object.defineProperty(e,"__esModule",{value:!0}),e.initializeParallax=i,e.onResize=o},function(t,e,n){"use strict";var i=n(1),o=n(0);window.addEventListener("DOMContentLoaded",function(){var t=document.querySelector(".main"),e=document.querySelector(".navigation-container"),n=1.2*(document.querySelector(".cs-ctr").getBoundingClientRect().bottom-document.querySelector(".cs-ttb").getBoundingClientRect().bottom);(0,i.initializeParallax)(t);var r=[(0,o.createCustomSticky)({scrollSelector:".main",movingSelector:".cs-ttb",target:".cs-ctr",animationLength:function(){return n},direction:o.CSDirection.down,transform:function(t){return"translateX(-50%) translateY("+t+"px)"}}),(0,o.createCustomSticky)({scrollSelector:".main",movingSelector:".cs-ltr",target:".cs-ctr",animationLength:function(){return n},direction:o.CSDirection.right}),(0,o.createCustomSticky)({scrollSelector:".main",movingSelector:".cs-rtl",target:".cs-ctr",animationLength:function(){return n},direction:o.CSDirection.left}),(0,o.createCustomSticky)({scrollSelector:".main",movingSelector:".cs-end",target:function(){var e=t.getBoundingClientRect();return{left:e.left,right:e.left,top:e.top,bottom:e.bottom,width:0,height:e.height}},transform:function(t){return"translateX("+(t<=16?"-50%":-t+"px")+")"},direction:o.CSDirection.left})];(0,o.createCustomSticky)({scrollSelector:".main",movingSelector:".navigation-container",target:"header",alwaysVisible:!0,animationLength:function(){return e.getBoundingClientRect().top},notify:function(){document.querySelector("header").classList.toggle("tint")},direction:o.CSDirection.up}).start(r)},{once:!0})},function(t,e,n){"use strict";function i(t,e){return new IntersectionObserver(t,e)}Object.defineProperty(e,"__esModule",{value:!0}),e.createIntersectionObserver=i,n(4),e.default=i},function(t,e,n){"use strict";!function(t,e){function n(t){this.time=t.time,this.target=t.target,this.rootBounds=t.rootBounds,this.boundingClientRect=t.boundingClientRect,this.intersectionRect=t.intersectionRect||u(),this.isIntersecting=!!t.intersectionRect;var e=this.boundingClientRect,n=e.width*e.height,i=this.intersectionRect,o=i.width*i.height;this.intersectionRatio=n?o/n:0}function i(t,e){var n=e||{};if("function"!=typeof t)throw new Error("callback must be a function");if(n.root&&1!=n.root.nodeType)throw new Error("root must be an Element");this._checkForIntersections=r(this._checkForIntersections.bind(this),this.THROTTLE_TIMEOUT),this._callback=t,this._observationTargets=[],this._queuedEntries=[],this._rootMarginValues=this._parseRootMargin(n.rootMargin),this.thresholds=this._initThresholds(n.threshold),this.root=n.root||null,this.rootMargin=this._rootMarginValues.map(function(t){return t.value+t.unit}).join(" ")}function o(){return t.performance&&performance.now&&performance.now()}function r(t,e){var n=null;return function(){n||(n=setTimeout(function(){t(),n=null},e))}}function s(t,e,n,i){"function"==typeof t.addEventListener?t.addEventListener(e,n,i||!1):"function"==typeof t.attachEvent&&t.attachEvent("on"+e,n)}function a(t,e,n,i){"function"==typeof t.removeEventListener?t.removeEventListener(e,n,i||!1):"function"==typeof t.detatchEvent&&t.detatchEvent("on"+e,n)}function c(t,e){var n=Math.max(t.top,e.top),i=Math.min(t.bottom,e.bottom),o=Math.max(t.left,e.left),r=Math.min(t.right,e.right),s=r-o,a=i-n;return s>=0&&a>=0&&{top:n,bottom:i,left:o,right:r,width:s,height:a}}function l(t){var e=t.getBoundingClientRect();if(e)return e.width&&e.height||(e={top:e.top,right:e.right,bottom:e.bottom,left:e.left,width:e.right-e.left,height:e.bottom-e.top}),e}function u(){return{top:0,bottom:0,left:0,right:0,width:0,height:0}}if(!("IntersectionObserver"in t&&"IntersectionObserverEntry"in t&&"intersectionRatio"in t.IntersectionObserverEntry.prototype)){var h=e.documentElement,f=[];i.prototype.THROTTLE_TIMEOUT=100,i.prototype.POLL_INTERVAL=null,i.prototype.observe=function(t){if(!this._observationTargets.some(function(e){return e.element==t})){if(!t||1!=t.nodeType)throw new Error("target must be an Element");this._registerInstance(),this._observationTargets.push({element:t,entry:null}),this._monitorIntersections()}},i.prototype.unobserve=function(t){this._observationTargets=this._observationTargets.filter(function(e){return e.element!=t}),this._observationTargets.length||(this._unmonitorIntersections(),this._unregisterInstance())},i.prototype.disconnect=function(){this._observationTargets=[],this._unmonitorIntersections(),this._unregisterInstance()},i.prototype.takeRecords=function(){var t=this._queuedEntries.slice();return this._queuedEntries=[],t},i.prototype._initThresholds=function(t){var e=t||[0];return Array.isArray(e)||(e=[e]),e.sort().filter(function(t,e,n){if("number"!=typeof t||isNaN(t)||t<0||t>1)throw new Error("threshold must be a number between 0 and 1 inclusively");return t!==n[e-1]})},i.prototype._parseRootMargin=function(t){var e=t||"0px",n=e.split(/\s+/).map(function(t){var e=/^(-?\d*\.?\d+)(px|%)$/.exec(t);if(!e)throw new Error("rootMargin must be specified in pixels or percent");return{value:parseFloat(e[1]),unit:e[2]}});return n[1]=n[1]||n[0],n[2]=n[2]||n[0],n[3]=n[3]||n[1],n},i.prototype._monitorIntersections=function(){this._monitoringIntersections||(this._monitoringIntersections=!0,this._checkForIntersections(),this.POLL_INTERVAL?this._monitoringInterval=setInterval(this._checkForIntersections,this.POLL_INTERVAL):(s(t,"resize",this._checkForIntersections,!0),s(e,"scroll",this._checkForIntersections,!0),"MutationObserver"in t&&(this._domObserver=new MutationObserver(this._checkForIntersections),this._domObserver.observe(e,{attributes:!0,childList:!0,characterData:!0,subtree:!0}))))},i.prototype._unmonitorIntersections=function(){this._monitoringIntersections&&(this._monitoringIntersections=!1,clearInterval(this._monitoringInterval),this._monitoringInterval=null,a(t,"resize",this._checkForIntersections,!0),a(e,"scroll",this._checkForIntersections,!0),this._domObserver&&(this._domObserver.disconnect(),this._domObserver=null))},i.prototype._checkForIntersections=function(){var t=this._rootIsInDom(),e=t?this._getRootRect():u();this._observationTargets.forEach(function(i){var r=i.element,s=l(r),a=this._rootContainsTarget(r),c=i.entry,u=t&&a&&this._computeTargetAndRootIntersection(r,e),h=i.entry=new n({time:o(),target:r,boundingClientRect:s,rootBounds:e,intersectionRect:u});t&&a?this._hasCrossedThreshold(c,h)&&this._queuedEntries.push(h):c&&c.isIntersecting&&this._queuedEntries.push(h)},this),this._queuedEntries.length&&this._callback(this.takeRecords(),this)},i.prototype._computeTargetAndRootIntersection=function(e,n){if("none"!=t.getComputedStyle(e).display){for(var i=l(e),o=i,r=e.parentNode,s=!1;!s;){var a=null;if(r==this.root||1!=r.nodeType?(s=!0,a=n):"visible"!=t.getComputedStyle(r).overflow&&(a=l(r)),a&&!(o=c(a,o)))break;r=r.parentNode}return o}},i.prototype._getRootRect=function(){var t;if(this.root)t=l(this.root);else{var n=e.documentElement,i=e.body;t={top:0,left:0,right:n.clientWidth||i.clientWidth,width:n.clientWidth||i.clientWidth,bottom:n.clientHeight||i.clientHeight,height:n.clientHeight||i.clientHeight}}return this._expandRectByRootMargin(t)},i.prototype._expandRectByRootMargin=function(t){var e=this._rootMarginValues.map(function(e,n){return"px"==e.unit?e.value:e.value*(n%2?t.width:t.height)/100}),n={top:t.top-e[0],right:t.right+e[1],bottom:t.bottom+e[2],left:t.left-e[3]};return n.width=n.right-n.left,n.height=n.bottom-n.top,n},i.prototype._hasCrossedThreshold=function(t,e){var n=t&&t.isIntersecting?t.intersectionRatio||0:-1,i=e.isIntersecting?e.intersectionRatio||0:-1;if(n!==i)for(var o=0;o<this.thresholds.length;o++){var r=this.thresholds[o];if(r==n||r==i||r<n!=r<i)return!0}},i.prototype._rootIsInDom=function(){return!this.root||h.contains(this.root)},i.prototype._rootContainsTarget=function(t){return(this.root||h).contains(t)},i.prototype._registerInstance=function(){f.indexOf(this)<0&&f.push(this)},i.prototype._unregisterInstance=function(){var t=f.indexOf(this);-1!=t&&f.splice(t,1)},t.IntersectionObserver=i,t.IntersectionObserverEntry=n}}(window,document)}]);