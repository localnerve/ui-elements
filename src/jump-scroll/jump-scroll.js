/**
 * jump-scroll web component
 * 
 * Copyright (c) 2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-env browser */

const JumpScrollCss = `__CSS_REPLACEMENT__`;

class JumpScroll extends HTMLElement {
  #targetObserver = null;
  #controlObserver1 = null;
  #controlObserver2 = null;
  #scrollingDown = true;
  #scrollMidIgnore = false;
  #controlIntersectionColor = 0;
  #controlIntersectionCount = 0;
  #controlIntersection = '';

  #firstTarget = null;
  #lastTarget = null;
  #mapFirstLastScroll = null;
  #currentTarget = null;
  #mapTargets = null;

  #mapColors = null;

  #container = null;
  #setupInit = false;

  #resizeTick = false;
  #resizeWidth = 0;

  static #resizeWait = 800;
  static #scrollDelayFrames = 15;
  static #observedTargetAttributes = ['target'];
  static #observedAttributeDefaults = {
    target: 'section',
    display: 'best' // or 'both'
  }
  static get observedAttributes () {
    return [...JumpScroll.#observedTargetAttributes, 'display', 'colormap'];
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
    this.createTargetProperties();
  }

  createTargetProperties () {
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
          this.updateTargetMap(value);
        }
      });
    });
  }

  get display () {
    const propName = 'display';
    if (this.hasAttribute(propName)) {
      return this.getAttribute(propName);
    }
    return JumpScroll.#observedAttributeDefaults[propName];
  }
  set display (value) {
    const propName = 'display';
    const values = ['both', 'best'];

    this.#container &&
      this.#container.classList.remove(...values.concat('up', 'down'));
    if (values.includes(value)) {
      this.setAttribute(propName, value);
      this.#uninstallIntersectionObservers();
      this.#installIntersectionObservers();
      this.#container && this.#container.classList.add(value);
    } else {
      this.removeAttribute(propName);
    }
  }

  get colormap () {
    let result = '';
    const propName = 'colormap';
    if (this.hasAttribute(propName)) {
      result = this.getAttribute(propName);
    }
    return result;
  }
  set colormap (value) {
    if (this.#container === null) {
      return;
    }

    if (this.#mapColors) {
      this.#mapColors.clear();
    }
    this.#mapColors = null;

    const propName = 'colormap';
    const mapItems = value && value.split(';');
    if (mapItems && mapItems.length > 0 && mapItems[0].includes('@')) {
      this.setAttribute(propName, value);
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
      this.removeAttribute(propName);
    }
  }

  get currentTarget () {
    return this.#currentTarget;
  }
  set currentTarget (targetElement) {
    if (this.#mapTargets.has(targetElement)) {
      this.#currentTarget = targetElement;
    }
  }

  update (pos) {
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

  #scrollStep (dir, continueTest) {
    const target = this.#mapTargets.get(this.#currentTarget);
    if (target[dir]) {
      const elementNext = target[dir];
      const targetNext = this.#mapTargets.get(elementNext);
      const preLastTop = Math.round(targetNext.lastTop);
      this.#currentTarget = elementNext;
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

  #scrollEdge (edge = 'start') {
    this.#currentTarget =
      edge === 'start' ? this.#firstTarget : this.#lastTarget;
    this.#currentTarget.scrollIntoView({
      block: 'nearest',
      inline: 'start',
      behavior: 'smooth'
    });
    this.update(edge);
  }

  clickTop () {
    this.#scrollEdge('start');
  }

  clickBottom () {
    this.#scrollEdge('end');
  }

  clickNext () {
    this.#scrollStep('next', lastTop => lastTop < window.innerHeight);
  }

  clickPrev () {
    this.#scrollStep('prev', lastTop => lastTop > 0);
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
  updateTargetMap (propName, perTargetWork) {
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

      this.#currentTarget = order[currentIndex].el;
      if (currentIndex === 0) {
        this.update('start');
      } else if (currentIndex === order.length - 1) {
        this.update('end');
      } else {
        this.update('mid');
      }
    }
  }

  /**
   * Callback for target-viewport intersection.
   * Update #currentTarget, #scrollingDown, and the UI state.
   *
   * @param {Array} entries - Array of intersectionEntry items
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
          this.#currentTarget = nextElement;
        }

        /**
         * Update the UI.
         */
        this.update(pos);

        /**
         * Update scrolling direction.
         * Switches at end nodes or mid when clientRect tops are changing (smaller eq down, else up).
         */
        this.#scrollingDown = down;
      } 
      
      if (this.#scrollMidIgnore && entry.intersectionRatio >= 0.98) {
        this.#currentTarget = nextElement;
      }
    } else {
      if (entry.intersectionRatio <= endRatio) {
        this.#mapTargets.get(entry.target).lastTop = undefined;
      }
    }
  }

  controlIntersection (side, entries) {
    if (this.#mapColors && !this.#resizeTick) {
      const intersectors = entries.filter(entry => entry.isIntersecting);

      if (intersectors.length > 0) {
        const entry = intersectors[0];
        const newColor = this.#mapColors.get(entry.target);
        this.#controlIntersectionCount++;
        this.#controlIntersection = side;
        this.#controlIntersectionColor = this.#controlIntersectionCount;

        if (newColor) {
          this.#container.style.setProperty('--js-bg-color', newColor);
        } else {
          this.#container.style.removeProperty('--js-bg-color');
          this.#controlIntersectionCount = 0;
        }
      } else {
        this.#controlIntersectionCount--;
        // This is even when both edges cross a colormap region
        const diff = Math.abs(
          this.#controlIntersectionColor - this.#controlIntersectionCount
        );
        // This is false when transitioning between two adjoining colormap regions
        const control = side !== this.#controlIntersection;

        // controlIntersectionColor count goes over 2 in contiguous colormap regions
        if (control || (diff % 2 && this.#controlIntersectionColor < 3)) {
          this.#container.style.removeProperty('--js-bg-color');
          this.#controlIntersectionCount = 0;
        }
      }
    }
  }

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

  #installResizeObserver () {
    this.#resizeTick = false;
    window.addEventListener('resize', this.resizeHandler);
  }

  #uninstallResizeObserver () {
    window.removeEventListener('resize', this.resizeHandler);
    this.#resizeTick = false;
  }

  setup (resize = true, fullSetup = true) {
    if (this.#setupInit) {
      this.teardown(resize, fullSetup);
    } else {
      this.#resizeWidth = window.innerWidth;
    }
    this.#setupInit = true;

    if (fullSetup) {
      JumpScroll.#observedTargetAttributes.forEach(propName => {
        this.updateTargetMap(propName);
      });
    }

    this.#installIntersectionObservers();
    if (resize) {
      this.#installResizeObserver();
    }
  }

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
    }
    this.#setupInit = false;
  }

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
<div class="top"><div class="start"></div><div class="prev"></div></div>\
<div class="bot"><div class="next"></div><div class="end"></div></div>\
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