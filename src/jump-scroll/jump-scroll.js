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
  #firstTarget = null;
  #lastTarget = null;
  #currentTarget = null;
  #mapTargets = null;
  #mapColors = null;
  #container = null;
  #scrollingDown = true;
  #setup = false;
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

  updateTargetMap (propName, perTargetWork) {
    if (!JumpScroll.#observedTargetAttributes.includes(propName) || !this.#setup) {
      return;
    }

    this.#firstTarget = null;
    this.#lastTarget = null;
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

  targetIntersection (entries) {
    const intersectors = entries.filter(entry => entry.isIntersecting);

    if (intersectors && intersectors.length > 0) {
      const entry = intersectors[0];
      const current = entry.target;
      let pos = 'mid';

      this.#scrollingDown = entry.boundingClientRect.top >= 0;

      if (current === this.#firstTarget) {
        pos = 'start';
      } else if (current === this.#lastTarget) {
        pos = 'end';
      }

      this.#currentTarget = current;
      this.update(pos);
    }
  }

  controlIntersection (entries) {
    if (this.#mapColors) {
      const intersectors = entries.filter(entry => entry.isIntersecting);

      if (intersectors && intersectors.length > 0) {
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
    const viewportHeight = window.innerHeight;
    const controlIntersectionWindow = 2;
    const heightFactor = this.display === 'best' ? 2 : 1;
    const controlHeight = this.offsetHeight / heightFactor;
    const controlTopTop = viewportHeight - controlHeight;
    const controlTopBottom = controlHeight - controlIntersectionWindow;
    const controlBottomBottom = JumpScroll.getNumber(
      window.getComputedStyle(this).bottom
    );
    const controlBottomTop =
      viewportHeight - controlBottomBottom - controlIntersectionWindow;

    this.#targetObserver = new IntersectionObserver(this.targetIntersection, {
      threshold: 0.5
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
    window.addEventListener('resize', this.resizeHandler);
  }

  #uninstallResizeObserver () {
    window.removeEventListener('resize', this.resizeHandler);
  }

  setup () {
    if (this.#setup) {
      this.teardown();
    }
    this.#setup = true;

    JumpScroll.#observedTargetAttributes.forEach(propName => {
      this.updateTargetMap(propName);
    });

    this.#installIntersectionObservers();
    this.#installResizeObserver();
  }

  teardown () {
    this.#uninstallResizeObserver();
    this.#uninstallIntersectionObservers();
    this.#firstTarget = null;
    this.#lastTarget = null;
    this.#currentTarget = null;
    this.#container = null;
    this.#mapTargets.clear();
    this.#mapTargets = null;
    this.#mapColors.clear();
    this.#mapColors = null;
    this.#setup = false;
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