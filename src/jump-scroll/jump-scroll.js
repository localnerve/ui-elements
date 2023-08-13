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

  #firstTarget = null;
  #lastTarget = null;
  #mapFirstLastScroll = null;
  #currentTarget = null;
  #mapTargets = null;

  #mapColors = null;

  #container = null;
  #setupInit = false;
  #resizeTick = false;

  static #resizeWait = 800;
  static #observedTargetAttributes = ['target'];
  static #observedAttributeDefaults = {
    target: 'section',
    display: 'both' // or 'best'
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

    const propName = 'colormap';
    const mapItems = value && value.split(';');
    if (mapItems && mapItems.length > 0 && mapItems[0].includes(':')) {
      this.setAttribute(propName, value);
      this.#mapColors = new Map();
      for (const item of mapItems) {
        let [index, color] = item.replace(/\s/, '').split(':');
        if (color.startsWith('--')) {
          color = `var(${color})`;
        }
        this.#mapColors.set(parseInt(index, 10), color);
      }
    } else {
      this.removeAttribute(propName);
      this.#mapColors = null;
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

  clickTop () {
    this.#currentTarget = this.#firstTarget;
    this.#firstTarget.scrollIntoView({
      block: 'nearest',
      inline: 'start',
      behavior: 'smooth'
    });
    this.update('start');
  }

  clickBottom () {
    this.#currentTarget = this.#lastTarget;
    this.#lastTarget.scrollIntoView({
      block: 'nearest',
      inline: 'start',
      behavior: 'smooth'
    });
    this.update('end');
  }

  clickNext () {
    const targets = this.#mapTargets.get(this.#currentTarget);
    if (targets && targets.next) {
      this.#currentTarget = targets.next;
      targets.next.scrollIntoView({
        block: 'nearest',
        inline: 'start',
        behavior: 'smooth'
      });
    }
  }

  clickPrev () {
    const targets = this.#mapTargets.get(this.#currentTarget);
    if (targets && targets.prev) {
      this.#currentTarget = targets.prev;
      targets.prev.scrollIntoView({
        block: 'nearest',
        inline: 'start',
        behavior: 'smooth'
      });
    }
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
      order.splice(i, 0, { top: rect.top, el });

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

      let currentIndex = 0;
      for (i = 0; i < order.length; i++) {
        if (0 > order[i].top) {
          currentIndex = i + 1;
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
   * Update #currentTarget, #scrollingDown, and the UI state accordingly.
   *
   * @param {Array} entries - Array of intersectionEntry items
   */
  targetIntersection (entries) {
    let firstEntry, lastEntry;

    /**
     * Put the most desired entry first.
     * Also, save the lowest available intersetionRatio first and last entries (if supplied).
     * Sort by:
     *   1. entry intersecting boolean === true
     *   2. corresponding mapTarget entry index (descending order for scrolldown, ascending order for scrollup)
     *   3. entry intersectionRatio (descending order)
     */
    const intersectors = entries.sort((a, b) => {
      const bothIntersecting = a.isIntersecting && b.isIntersecting;
      let result = a.isIntersecting ? -1 : b.isIntersecting ? 1 : 0;

      const firstEntryCandidate = 
        (a.target === this.#firstTarget && a) || 
        (b.target === this.#firstTarget && b);
      if (firstEntryCandidate) {
        if (!firstEntry) { firstEntry = firstEntryCandidate; }
        else {
          if (firstEntryCandidate.intersectionRatio < firstEntry.intersectionRatio) {
            firstEntry = firstEntryCandidate;
          }
        }
      }
      const lastEntryCandidate = 
        (a.target === this.#lastTarget && a) ||
        (b.target === this.#lastTarget && b);
      if (lastEntryCandidate) {
        if (!lastEntry) { lastEntry = lastEntryCandidate; }
        else {
          if (lastEntryCandidate.intersectionRatio < lastEntry.intersectionRatio) {
            lastEntry = lastEntryCandidate;
          }
        }
      }

      if (bothIntersecting) {
        const leftTarget = this.#mapTargets.get(a.target);
        const rightTarget = this.#mapTargets.get(b.target);
        if (this.#scrollingDown) {
          result = rightTarget.index - leftTarget.index;
        } else {
          result = leftTarget.index - rightTarget.index;
        }

        if (!result) {
          result = b.intersectionRatio - a.intersectionRatio;
        }
      }

      return result;
    });

    const entry = intersectors[0];
    if (entry.isIntersecting) {
      const lastTarget = this.#mapTargets.get(this.#currentTarget);
      const nextFirstLast = this.#mapFirstLastScroll.has(entry.target);
      const nextTarget = this.#mapTargets.get(entry.target);
      const nextTop = entry.boundingClientRect.top;
      const nextRatio = entry.intersectionRatio;
      const nextElement = entry.target;
      const endRatio = 0.49;
      const nextRatioThreshold = nextFirstLast ? 0 : endRatio;

      /**
       * For the chosen entry:
       * Grab position enum ['start', 'end', 'mid'] and next scroll direction.
       */
      let { pos, down } = this.#mapFirstLastScroll.get(nextElement) ?? {
        pos: 'mid',
        down: nextTarget.lastTop === undefined
          ? this.#scrollingDown
          : nextTop < nextTarget.lastTop
      };

      /**
       * Guard the end nodes from unwanted 'mid' intersection action.
       * Allow 'mid' if end node is entering or exiting less than `endRatio`.
       */
      if (pos !== 'mid') {
        this.#scrollMidIgnore = nextRatio > endRatio ? pos : false;
      } else {
        if (this.#scrollMidIgnore) {
          if (this.#scrollMidIgnore === 'start') {
            if (firstEntry && firstEntry.intersectionRatio <= endRatio) {
              this.#scrollMidIgnore = false;
            }
          } else {
            if (lastEntry && lastEntry.intersectionRatio <= endRatio) {
              this.#scrollMidIgnore = false;
            }
          }
          return;
        }
      }

      /**
       * Update currentTarget if the direction and threshold is ok
       */
      const nextEligible = (
        this.#scrollingDown
          ? nextTarget.index > lastTarget.index
          : nextTarget.index < lastTarget.index
        ) && nextRatio > nextRatioThreshold;
      if (nextEligible) {
        this.#currentTarget = nextElement;
      }

      /**
       * If we're going to switch directions, purge all saved lastTops.
       */
      if (down !== this.#scrollingDown) {
        const vals = this.#mapTargets.values();
        for (const val of vals) {
          val.lastTop = undefined;
        }
      }

      /**
       * Save top to detect scroll direction
       */
      nextTarget.lastTop = nextTop;

      /**
       * Update the UI
       */
      this.update(pos);

      /**
       * Switches at end node or mid when clientRect tops are getting smaller.
       */
      this.#scrollingDown = down;
    }
  }

  controlIntersection (entries) {
    if (this.#mapColors) {
      const intersectors = entries.filter(entry => entry.isIntersecting);

      if (intersectors.length > 0) {
        const entry = intersectors[0];
        const current = this.#mapTargets.get(entry.target);
        if (current) {
          const newColor = this.#mapColors.get(current.index);
          if (newColor) {
            this.#container.style.setProperty('--js-bg-color', newColor);
          } else {
            this.#container.style.removeProperty('--js-bg-color');
          }
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
    this.#controlObserver1 = new IntersectionObserver(this.controlIntersection, {
      threshold: 0,
      rootMargin: `-${controlTopTop}px 0px -${controlTopBottom}px 0px`
    });
    this.#controlObserver2 = new IntersectionObserver(this.controlIntersection, {
      threshold: 0,
      rootMargin: `-${controlBottomTop}px 0px -${controlBottomBottom}px 0px`
    });

    const els = this.#mapTargets.keys();
    for (const el of els) {
      this.#targetObserver.observe(el);
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
      this.#uninstallIntersectionObservers();
      setTimeout(() => {
        this.#installIntersectionObservers();
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

  setup (resize = true) {
    if (this.#setupInit) {
      this.teardown();
    }
    this.#setupInit = true;

    JumpScroll.#observedTargetAttributes.forEach(propName => {
      this.updateTargetMap(propName);
    });

    this.#installIntersectionObservers();
    if (resize) {
      this.#installResizeObserver();
    }
  }

  teardown (resize = true) {
    if (resize) {
      this.#uninstallResizeObserver();
    }
    this.#uninstallIntersectionObservers();
    this.#firstTarget = null;
    this.#lastTarget = null;
    this.#mapFirstLastScroll = null;
    this.#currentTarget = null;
    if (this.#mapTargets)
      this.#mapTargets.clear();
    this.#mapTargets = null;
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