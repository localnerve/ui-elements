/**
 * jump-scroll web component
 * 
 * Copyright (c) 2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-env browser */

const JumpScrollCss = `__CSS_REPLACEMENT__`;

/**
 * JumpScroll component
 * 
 * Alternative scroller to jump to author defined page sections.
 */
class JumpScroll extends HTMLElement {
  #targetObserver = null;
  #controlObserver1 = null;
  #controlObserver2 = null;
  #scrollingDown = true;
  #scrollMidIgnore = false;
  #controlIntersectionCount = 0;
  #controlIntersection = '';

  #firstTarget = null;
  #lastTarget = null;
  #mapFirstLastScroll = null;
  #currentTarget = null;
  #mapTargets = null;

  static #scrollDelayFrames = 15;

  #mapColors = null;

  #container = null;
  #scrollContainer = null;
  #setupInit = false;

  #resizeTick = false;
  #resizeWidth = 0;
  static #resizeWait = 800;
  
  static #observedTargetAttributes = ['target']; // maybe expand to horizontal...
  static #observedAttributeDefaults = {
    target: 'section',
    display: 'best', // or 'both'
    colormap: '',
    enablekeyboard: true
  }
  static get observedAttributes () {
    return [...JumpScroll.#observedTargetAttributes, 'display', 'colormap', 'enablekeyboard'];
  }

  /**
   * Pull the numeric part of a string and parse as float.
   *
   * @param {String} input - The string to parse as float.
   * @returns {Number} The parsed float.
   */
  static getNumber (input) {
    const reNotNum = /[^.+\-\d]+/;
    return parseFloat(input.replace(reNotNum, ''));
  }

  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.targetIntersection = this.targetIntersection.bind(this);
    this.controlIntersection = this.controlIntersection.bind(this);
    this.resizeHandler = this.resizeHandler.bind(this);
    this.setup = this.setup.bind(this);
    this.clickTop = this.clickTop.bind(this);
    this.clickBottom = this.clickBottom.bind(this);
    this.clickNext = this.clickNext.bind(this);
    this.clickPrev = this.clickPrev.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.#createTargetProperties();
  }

  /**
   * Define all the target properties.
   */
  #createTargetProperties () {
    JumpScroll.#observedTargetAttributes.forEach(propName => {
      Object.defineProperty(this, propName, {
        get () {
          if (this.hasAttribute(propName)) {
            return this.getAttribute(propName);
          }
          return JumpScroll.#observedAttributeDefaults[propName];
        },
        set (value) {
          if (value) {
            this.setAttribute(propName, value);
          } else {
            this.removeAttribute(propName);
          }
          this.#updateTargetMap(value);
        }
      });
    });
  }

  /**
   * Get the display property.
   * 
   * @returns {String} The display property setting.
   */
  get display () {
    const attributeName = 'display';
    if (this.hasAttribute(attributeName)) {
      return this.getAttribute(attributeName);
    }
    return JumpScroll.#observedAttributeDefaults[attributeName];
  }
  /**
   * Set the display property.
   * 
   * @param {String} value - 'both' or 'best'
   */
  set display (value) {
    const attributeName = 'display';
    const values = ['both', 'best'];

    this.#container &&
      this.#container.classList.remove(...values.concat('up', 'down'));
    if (values.includes(value)) {
      this.setAttribute(attributeName, value);
      this.#uninstallIntersectionObservers();
      this.#installIntersectionObservers();
      this.#container && this.#container.classList.add(value);
    } else {
      this.removeAttribute(attributeName);
    }
  }

  /**
   * Get the colormap property.
   *
   * @returns {String} The colormap definition string
   */
  get colormap () {
    const attributeName = 'colormap';
    if (this.hasAttribute(attributeName)) {
      return this.getAttribute(attributeName);
    }
    return JumpScroll.#observedAttributeDefaults[attributeName];
  }
  /**
   * Set the colormap property.
   * 
   * @param {String} value - The colormap definition string
   */
  set colormap (value) {
    if (this.#container === null) {
      return;
    }

    if (this.#mapColors) {
      this.#mapColors.clear();
    }
    this.#mapColors = null;

    const attributeName = 'colormap';
    const mapItems = value && value.split(';');
    if (mapItems && mapItems.length > 0 && mapItems[0].includes('@')) {
      this.setAttribute(attributeName, value);
      this.#mapColors = new Map();
      for (const item of mapItems) {
        let [selector, color] = item.replace(/\s/, '').split('@');
        if (color.startsWith('--')) {
          color = `var(${color})`;
        }
        document.querySelectorAll(selector).forEach(el => {
          this.#mapColors.set(el, color);
        });
      }
    } else {
      this.removeAttribute(attributeName);
    }
  }

  /**
   * Get the current target element.
   */
  get currentTarget () {
    return this.#currentTarget;
  }
  /**
   * Set the current target element.
   *
   * @param {HTMLElement} targetElement - The new current element.
   */
  set currentTarget (targetElement) {
    if (this.#mapTargets.has(targetElement)) {
      this.#currentTarget = targetElement;
      this.#setAriaScrollState();
    }
  }

  /**
   * Get the enableKeyboard property.
   * 
   * @returns {Boolean}
   */
  get enableKeyboard () {
    const attributeName = 'enablekeyboard';
    if (this.hasAttribute(attributeName)) {
      return this.getAttribute(attributeName) !== 'false';
    }
    return JumpScroll.#observedAttributeDefaults[attributeName];
  }
  /**
   * Handle `keydown` events from #scrollContainer.
   * 
   * @param {Event} - The event object.
   */
  keydownHandler (e) {
    const actionMap = {
      'PageDown': {
        'true': this.clickBottom,
        'false': this.clickNext
      },
      'Space': {
        'true': this.clickPrev,
        'false': this.clickNext
      },
      'PageUp': {
        'true': this.clickTop,
        'false': this.clickPrev
      }
    };

    const action = actionMap[e.code]?.[Boolean(e.shiftKey).toString()];
    action && action(e);
  }
  /**
   * Setup or teardown keyboard event handling.
   * 
   * @param {Boolean} - true to setup, false to teardown.
   */
  set enableKeyboard (value) {
    if (!this.#scrollContainer) {
      return;
    }

    const attributeName = 'enablekeyboard';
    const method = value ? 'addEventListener' : 'removeEventListener';
    this.#scrollContainer[method]('keydown', this.keydownHandler);
    this.setAttribute(attributeName, value);
  }

  /**
   * Update the UI.
   * 
   * @param {String} pos - 'mid', 'start', or 'end' 
   */
  #update (pos) {
    const newClasses = [pos];
    const resetClasses = ['mid', 'start', 'end', 'rest', 'up', 'down'];
    if (this.#firstTarget !== null) {
      resetClasses.push('none');
    }

    if (this.display === 'best' && pos === 'mid') {
      if (this.#scrollingDown) {
        newClasses.push('down');
      } else {
        newClasses.push('up');
      }
    }

    this.#container.classList.remove(...resetClasses);
    this.#container.classList.add(...newClasses);
    setTimeout(() => {
      this.#container.classList.add('rest');
    }, 500);
  }

  /**
   * Jump scroll to the next/prev target.
   *
   * @param {String} dir - 'next' or 'prev'
   * @param {Function} continueTest - The continuation boolean function
   */
  #scrollStep (dir, continueTest) {
    const target = this.#mapTargets.get(this.#currentTarget);
    if (target[dir]) {
      const elementNext = target[dir];
      const targetNext = this.#mapTargets.get(elementNext);
      const preLastTop = Math.round(targetNext.lastTop);
      this.currentTarget = elementNext;
      this.#currentTarget.scrollIntoView({
        block: 'nearest',
        inline: 'start',
        behavior: 'smooth'
      });
      setTimeout(() => {
        if (preLastTop === Math.round(targetNext.lastTop)) {
          if (continueTest(preLastTop)) {
            this.#scrollStep(dir, continueTest);
          } else {
            window.scrollBy({
              top: preLastTop,
              behavior: 'smooth'
            });
          }
        }
      }, 16.67 * JumpScroll.#scrollDelayFrames);
    } else {
      this.#currentTarget.scrollIntoView({
        block: 'nearest',
        inline: 'start',
        behavior: 'smooth'
      });
    }
  }

  /**
   * Scroll to the first or last target.
   *
   * @param {String} edge - 'start' or 'end'
   */
  #scrollEdge (edge = 'start') {
    this.currentTarget =
      edge === 'start' ? this.#firstTarget : this.#lastTarget;
    this.#currentTarget.scrollIntoView({
      block: 'nearest',
      inline: 'start',
      behavior: 'smooth'
    });
    this.#update(edge);
  }

  /// ----------------------------------------------
  // Click handlers
  /// ----------------------------------------------
  clickTop (e) {
    e && e.preventDefault();
    this.#scrollEdge('start');
  }
  clickBottom (e) {
    e && e.preventDefault();
    this.#scrollEdge('end');
  }
  clickNext (e) {
    e && e.preventDefault();
    this.#scrollStep('next', lastTop => lastTop < window.innerHeight);
  }
  clickPrev (e) {
    e && e.preventDefault();
    this.#scrollStep('prev', lastTop => lastTop > 0);
  }

  /**
   * Find the common ancestor of the targets
   * @returns {HTMLElement} The common ancestor of the targets in targetMap
   */
  #findTargetCommonAncestor () {
    if (!this.#firstTarget || !this.#mapTargets) {
      return;
    }

    let parents, el, fewest = 1e6;
    const fewestParents = [];
    const targetEls = this.#mapTargets.keys();
    for (const targetEl of targetEls) {
      el = targetEl;
      for (parents = 0; el.parentElement; el = el.parentElement) {
        parents++;
      }
      if (parents <= fewest) {
        fewest = parents;
        fewestParents.unshift(targetEl);
      }
    }

    let result = fewestParents[0].parentElement ?? fewestParents[0];
    if (fewestParents.length > 1) {
      const range = new Range();
      range.setStart(fewestParents[0], 0);
      range.setEnd(fewestParents[1], 0);
      if(range.collapsed) {
        range.setStart(fewestParents[1], 0);
        range.setEnd(fewestParents[0], 0);
      }
      result = range.commonAncestorContainer ?? result;
    }

    return result;
  }

  /**
   * Setup the aria attributes for the control.
   */
  #setupAriaAttributes () {
    if (!this.#firstTarget || !this.#mapTargets) {
      return;
    }

    this.#scrollContainer = this.#findTargetCommonAncestor();
    if (this.#scrollContainer) {
      let scid;

      if (this.#scrollContainer.id) {
        scid = this.#scrollContainer.id;
      } else {
        const bytes = new Uint8Array(10);
        scid = `js-${btoa(crypto.getRandomValues(bytes))}`;
        this.#scrollContainer.id = scid;
      }

      this.setAttribute('role', 'scrollbar');
      this.setAttribute('aria-controls', scid);
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-label', 'Alternate scroller, jump directly to author\'s sections');
      if (this.#mapTargets) {
        const range = this.#mapTargets.size - 1;
        this.setAttribute('aria-valuemax', range > 0 ? range : 1);
      }
    }
  }

  /**
   * Set the `aria-valuenow` value
   */
  #setAriaScrollState () {
    if (!this.#mapTargets) {
      return;
    }

    this.setAttribute(
      'aria-valuenow',
      this.#mapTargets.get(this.#currentTarget).index
    );
  }

  /**
   * Creates HTMLElement orders of elements selected by the `target` property.
   * Creates the following data:
   *   #mapTargets
   *   #firstTarget
   *   #lastTarget
   *   #mapFirstLastScroll
   *
   * #mapTargets target data items:
   *   - index (0 based order index, preserving ascending top-down order).
   *   - next, prev HTMLElements in the order.
   *   - [lastTop] transient top data taken at intersection time
   * 
   * @param {String} propName - The target property name
   * @param {Function} [perTargetWork] - optional function to execute on the HTMLElements selected.
   */
  #updateTargetMap (propName, perTargetWork) {
    if (!JumpScroll.#observedTargetAttributes.includes(propName) || !this.#setupInit) {
      return;
    }

    this.#firstTarget = null;
    this.#lastTarget = null;
    this.#mapFirstLastScroll = null;
    this.#currentTarget = null;
    if (this.#mapTargets) {
      this.#mapTargets.clear();
    } else {
      this.#mapTargets = new Map();
    }

    let rect, i; const order = [];
    document.querySelectorAll(this[propName]).forEach(el => {
      rect = el.getBoundingClientRect();

      for (i = 0; i < order.length; i++) {
        if (rect.top < order[i].top) {
          break;
        }
      }
      if (i === 0 || (i > 0 && order[i-1].top !== rect.top)) { // disallow duplicate tops
        order.splice(i, 0, {
          top: rect.top,
          bot: rect.bottom,
          el
        });
      }

      if (typeof perTargetWork === 'function') {
        perTargetWork(el);
      }
    });

    if (order.length > 0) {
      this.#firstTarget = order[0].el;
      this.#lastTarget = order[order.length - 1].el;
      this.#mapFirstLastScroll = new WeakMap([
        [this.#firstTarget, { pos: 'start', down: true }],
        [this.#lastTarget, { pos: 'end', down: false }]
      ])

      let currentIndex = 0, n = 0;
      const windowHeight = window.innerHeight;
      for (i = 0; i < order.length; i++) {
        if (0 > order[i].top) {
          n = order[i].bot < windowHeight ? 1 : 0;
          currentIndex = i + n < order.length ? i + n : i;
        }
        this.#mapTargets.set(order[i].el, {
          index: i,
          prev: i > 0 ? order[i-1].el : null,
          next: i < order.length-1 ? order[i+1].el : null
        });
      }

      this.currentTarget = order[currentIndex].el;
      if (currentIndex === 0) {
        this.#update('start');
      } else if (currentIndex === order.length - 1) {
        this.#update('end');
      } else {
        this.#update('mid');
      }
    }
  }

  /**
   * Callback for target-viewport intersection.
   * Update #currentTarget, #scrollingDown, and the UI state.
   *
   * @param {Array} entries - Array of intersectionObserverEntry
   */
  targetIntersection (entries) {
    const updateLastTop = entry => {
      const target = this.#mapTargets.get(entry.target);
      if (entry.isIntersecting && entry.intersectionRatio >= 0.95) {
        if (target.lastTop) {
          if (target.lastTop < entry.boundingClientRect.top) {
            target.lastTop = entry.boundingClientRect.top;
          }
        } else {
          target.lastTop = entry.boundingClientRect.top;
        }
      } else if (!entry.isIntersecting) {
        target.lastTop = undefined;
      }
    }

    /**
     * This controls the end condition for #scrollMidIgnore.
     * Choose the lowest intersectionRatio to end the condition ASAP.
     */
    let firstEntry, lastEntry;
    const nextSmallestEntry = (prev, target, a, b) => {
      let entry = prev;
      const candidate = (a.target === target && a) || (b.target === target && b);
      if (candidate) {
        if (!entry) { entry = candidate; }
        else {
          if (candidate.intersectionRatio < entry.intersectionRatio) {
            entry = candidate;
          }
        }
      }
      return entry;
    };

    /**
     * Put the most desired entry first.
     * Side effects:
     *   1. Save end node intersection entries (if supplied).
     *   2. Update visible target node lastTops (if supplied).
     * Sort by:
     *   1. entry intersecting boolean === true
     *   2. entry intersectionRatio (descending order)
     * 
     * So, the sorted collection head is the largest ratio, intersecting element in the relevant direction.
     */
    const sorted = entries.sort((a, b) => {
      const bothIntersecting = a.isIntersecting && b.isIntersecting;
      let result = a.isIntersecting ? -1 : b.isIntersecting ? 1 : 0;

      firstEntry = nextSmallestEntry(firstEntry, this.#firstTarget, a, b);
      lastEntry = nextSmallestEntry(lastEntry, this.#lastTarget, a, b);
      updateLastTop(a);
      updateLastTop(b);

      if (bothIntersecting) {
        result = b.intersectionRatio - a.intersectionRatio;
      }
      return result;
    });

    const endRatio = 0.49;
    const entry = sorted[0];
    if (entry.isIntersecting) {
      const lastTarget = this.#mapTargets.get(this.#currentTarget);
      const nextFirstLast = this.#mapFirstLastScroll.has(entry.target);
      const nextTarget = this.#mapTargets.get(entry.target);
      const nextTop = entry.boundingClientRect.top;
      const nextRatio = entry.intersectionRatio;
      const nextElement = entry.target;
      const nextRatioThreshold = nextFirstLast ? 0 : endRatio;

      /**
       * For the chosen entry:
       * Grab position enum ['start', 'end', 'mid'] and next scroll direction.
       */
      const { pos, down } = this.#mapFirstLastScroll.get(nextElement) ?? {
        pos: 'mid',
        down: nextTarget.lastTop === undefined
          ? this.#scrollingDown
          : nextTop < nextTarget.lastTop
      };

      /**
       * Save top to detect scroll direction.
       */
      nextTarget.lastTop = nextTop;

      /**
       * Guard the end nodes from unwanted 'mid' intersection action.
       * Allow 'mid' if end node is entering or exiting less than `endRatio`.
       */
      if (pos !== 'mid') {
        this.#scrollMidIgnore = nextRatio > endRatio ? pos : false;
      } else if (this.#scrollMidIgnore) {
        const endEntry = this.#scrollMidIgnore === 'start' ? firstEntry : lastEntry;
        if (endEntry && endEntry.intersectionRatio <= endRatio) {
          this.#scrollMidIgnore = false;
        }
      }

      if (!this.#scrollMidIgnore || pos !== 'mid') {
        /**
         * Update currentTarget if the direction and threshold is ok.
         */
        const correctDirection = this.#scrollingDown
          ? nextTarget.index > lastTarget.index
          : nextTarget.index < lastTarget.index
          ;
        if (correctDirection && nextRatio > nextRatioThreshold) {
          this.currentTarget = nextElement;
        }

        /**
         * Update the UI.
         */
        this.#update(pos);

        /**
         * Update scrolling direction.
         * Switches at end nodes or mid when clientRect tops are changing (smaller eq down, else up).
         */
        this.#scrollingDown = down;
      } 
      
      if (this.#scrollMidIgnore && entry.intersectionRatio >= 0.98) {
        this.currentTarget = nextElement;
      }
    } else {
      if (entry.intersectionRatio <= endRatio) {
        this.#mapTargets.get(entry.target).lastTop = undefined;
      }
    }
  }

  /**
   * Handle intersection with an edge of this control.
   *
   * @param {String} side - (prebound) handler affiliation with top or bottom
   * @param {Array} entries - Array of IntersectionObserverEntry
   */
  controlIntersection (side, entries) {
    if (this.#mapColors && !this.#resizeTick) {
      const intersectors = entries.filter(entry => entry.isIntersecting);

      if (intersectors.length > 0) {
        const entry = intersectors[0];
        const newColor = this.#mapColors.get(entry.target);
        this.#controlIntersectionCount++;
        this.#controlIntersection = side;

        if (newColor) {
          this.#container.style.setProperty('--js-bg-color', newColor);
        } else {
          this.#container.style.removeProperty('--js-bg-color');
          this.#controlIntersectionCount = 0;
        }
      } else {
        this.#controlIntersectionCount--;
        // This is false when transitioning between two adjoining colormap regions
        const control = side !== this.#controlIntersection;
        // This is a partial transition with a direction reversal
        const specialCase = this.#controlIntersectionCount <= 0 && side === this.#controlIntersection;

        if (control || specialCase) {
          this.#container.style.removeProperty('--js-bg-color');
          this.#controlIntersectionCount = 0;
        }
      }
    }
  }

  /**
   * Create the intersection observers for the control and targets, and start observing.
   */
  #installIntersectionObservers () {
    if (!this.#mapTargets) {
      return;
    }

    const viewportHeight = window.innerHeight;
    const controlIntersectionWindow = 2;
    const controlHeight = this.offsetHeight;
    const controlTopTop = viewportHeight - controlHeight;
    const controlTopBottom = Math.abs(
      controlHeight - controlIntersectionWindow
    );
    const controlBottomBottom = JumpScroll.getNumber(
      window.getComputedStyle(this).bottom
    );
    const controlBottomTop =
      viewportHeight - controlBottomBottom - controlIntersectionWindow;

    this.#targetObserver = new IntersectionObserver(this.targetIntersection, {
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    });
    this.#controlObserver1 = new IntersectionObserver(this.controlIntersection.bind(null, 'top'), {
      threshold: 0,
      rootMargin: `-${controlTopTop}px 0px -${controlTopBottom}px 0px`
    });
    this.#controlObserver2 = new IntersectionObserver(this.controlIntersection.bind(null, 'bot'), {
      threshold: 0,
      rootMargin: `-${controlBottomTop}px 0px -${controlBottomBottom}px 0px`
    });

    const targetEls = this.#mapTargets.keys();
    for (const el of targetEls) {
      this.#targetObserver.observe(el);
    }
    const colorEls = this.#mapColors.keys();
    for (const el of colorEls) {
      this.#controlObserver1.observe(el);
      this.#controlObserver2.observe(el);
    }
  }
  
  /**
   * Destroy the intersection observers and stop observing.
   */
  #uninstallIntersectionObservers () {
    if (this.#targetObserver) {
      this.#targetObserver.disconnect();
    }
    if (this.#controlObserver1) {
      this.#controlObserver1.disconnect();
    }
    if (this.#controlObserver2) {
      this.#controlObserver2.disconnect();
    }
    this.#targetObserver = null;
    this.#controlObserver1 = null;
    this.#controlObserver2 = null;
  }

  /**
   * Handle resize events
   */
  resizeHandler () {
    if (!this.#resizeTick) {
      this.#resizeTick = true;
      setTimeout(() => {
        let fullSetup = false;
        const width = window.innerWidth;
        if (width !== this.#resizeWidth) {
          // if the width grows, then its possible the order changes.
          if (width > this.#resizeWidth) {
            fullSetup = true;
          }
          this.#resizeWidth = width;
        }
        this.setup(false, fullSetup);
        this.#resizeTick = false;
      }, JumpScroll.#resizeWait);
    }
  }

  /// ----------------------------------------------
  /// Create and destroy the resize handler
  /// ----------------------------------------------
  #installResizeObserver () {
    this.#resizeTick = false;
    window.addEventListener('resize', this.resizeHandler);
  }
  #uninstallResizeObserver () {
    window.removeEventListener('resize', this.resizeHandler);
    this.#resizeTick = false;
  }

  /**
   * Full and required control setup.
   *
   * @param {Boolean} resize - true to setup resize, false otherwise.
   * @param {Boolean} fullSetup - true to do a full setup, false otherwise.
   */
  setup (resize = true, fullSetup = true) {
    let firstInit = false;
    if (this.#setupInit) {
      this.teardown(resize, fullSetup);
    } else {
      firstInit = true;
    }
    this.#setupInit = true;

    if (fullSetup) {
      JumpScroll.#observedTargetAttributes.forEach(propName => {
        this.#updateTargetMap(propName);
      });
    }

    if (firstInit) {
      this.#resizeWidth = window.innerWidth;
      this.#setupAriaAttributes();
      this.enableKeyboard = JumpScroll.#observedAttributeDefaults['enablekeyboard'];
    }

    this.#installIntersectionObservers();
    if (resize) {
      this.#installResizeObserver();
    }
  }

  /**
   * Full destruction of the control resources.
   *
   * @param {Boolean} resize - true to teardown resize, false otherwise.
   * @param {Boolean} fullTeardown - true to do a full teardown, false otherwise.
   */
  teardown (resize = true, fullTeardown = true) {
    if (resize) {
      this.#uninstallResizeObserver();
    }
    this.#uninstallIntersectionObservers();
    if (fullTeardown) {
      this.#firstTarget = null;
      this.#lastTarget = null;
      this.#mapFirstLastScroll = null;
      this.#currentTarget = null;
      if (this.#mapTargets)
        this.#mapTargets.clear();
      this.#mapTargets = null;
      this.#scrollContainer = null;
      this.enableKeyboard = false;
      this.#setupInit = false;
    }
  }

  /// ----------------------------------------------
  /// WebComponent lifecycle methods
  /// ----------------------------------------------

  connectedCallback () {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        this.setup();
      }, { once: true });
    } else {
      this.setup();
    }

    const { shadowRoot } = this;
    shadowRoot.innerHTML = `<style>${JumpScrollCss}</style>\
<div class="container none">\
<div class="top">\
<button type="button" tabindex="-1" class="start">Scroll to start</button>\
<button type="button" tabindex="-1" class="prev">Scroll to previous</button>\
</div>\
<div class="bot">\
<button type="button" tabindex="-1" class="next">Scroll to next</button>\
<button type="button" tabindex="-1" class="end">Scroll to end</button>\
</div>\
</div>`;

    this.#container = shadowRoot.querySelector('.container');
    /* eslint-disable no-self-assign */
    this.display = this.display;
    this.colormap = this.colormap;
    /* eslint-enable no-self-assign */

    shadowRoot.querySelector('.top .start').addEventListener(
      'click', this.clickTop
    );
    shadowRoot.querySelector('.bot .end').addEventListener(
      'click', this.clickBottom
    );
    shadowRoot.querySelector('.top .prev').addEventListener(
      'click', this.clickPrev
    );
    shadowRoot.querySelector('.bot .next').addEventListener(
      'click', this.clickNext
    );
  }

  disconnectedCallback () {
    this.#container = null;
    this.shadowRoot.querySelector('.top .start').removeEventListener(
      'click', this.clickTop
    );
    this.shadowRoot.querySelector('.bot .end').removeEventListener(
      'click', this.clickBottom
    );
    this.shadowRoot.querySelector('.top. .prev').removeEventListener(
      'click', this.clickPrev
    );
    this.shadowRoot.querySelector('.bot .next').removeEventListener(
      'click', this.clickNext
    )
    this.teardown();
  }

  attributeChangedCallback (attrName, oldValue, newValue) {
    if (newValue !== oldValue) {
      this[attrName] = this.getAttribute(attrName);
    }
  }
}

customElements.define('jump-scroll', JumpScroll);