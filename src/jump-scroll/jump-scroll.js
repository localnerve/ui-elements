/**
 * jump-scroll web component
 * 
 * Copyright (c) 2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-env browser */

const JumpScrollCss = `__CSS_REPLACEMENT__`;

class JumpScroll extends HTMLElement {
  #observer = null;
  #firstTarget = null;
  #lastTarget = null;
  #currentTarget = null;
  #mapTargets = null;
  #container = null;
  #scrollingDown = true;
  #setup = false;

  static #observedTargetAttributes = ['target'];
  static #observedAttributeDefaults = {
    target: 'section',
    display: 'both' // or 'best'
  }
  static get observedAttributes () {
    return [...JumpScroll.#observedTargetAttributes, 'display'];
  }

  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.intersectionCallback = this.intersectionCallback.bind(this);
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
    const container = this.#container ?? {
      classList: {
        remove: () => {},
        add: () => {}
      }
    };

    container.classList.remove(...values.concat('up', 'down'));
    if (values.includes(value)) {
      this.setAttribute(propName, value);
      container.classList.add(value);
    } else {
      this.removeAttribute(propName);
    }
  }

  update (pos) {
    const newClasses = [pos];
    
    if (this.display === 'best' && pos === 'mid') {
      if (this.#scrollingDown) {
        newClasses.push('down');
      } else {
        newClasses.push('up');
      }
    }

    this.#container.classList.remove('mid', 'start', 'end', 'none', 'rest', 'up', 'down');
    this.#container.classList.add(...newClasses);
    setTimeout(() => {
      this.#container.classList.add('rest');
    }, 500);
  }

  clickTop () {
    this.#firstTarget.scrollIntoView();
    this.#currentTarget = this.#firstTarget;
    this.update('start');
  }

  clickBottom () {
    this.#lastTarget.scrollIntoView();
    this.#currentTarget = this.#lastTarget;
    this.update('end');
  }

  clickNext () {
    const targets = this.#mapTargets.get(this.#currentTarget);
    if (targets && targets.next) {
      targets.next.scrollIntoView({
        block: targets.next === this.#lastTarget ? 'start' : 'center',
        behavior: 'smooth'
      });
      this.#currentTarget = targets.next;
    }
  }

  clickPrev () {
    const targets = this.#mapTargets.get(this.#currentTarget);
    if (targets && targets.prev) {
      targets.prev.scrollIntoView({
        block: targets.prev === this.#firstTarget ? 'start' : 'center',
        behavior: 'smooth'
      });
      this.#currentTarget = targets.prev;
    }
  }

  updateTargetMap (propName, perTargetWork) {
    if (!JumpScroll.#observedTargetAttributes.includes(propName) || !this.#setup) {
      return;
    }

    this.#firstTarget = null;
    this.#lastTarget = null;
    this.#currentTarget = null;
    this.#mapTargets = new WeakMap();

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

    this.#firstTarget = order[0].el;
    this.#lastTarget = order[order.length - 1].el;

    let currentIndex = 0;
    for (i = 0; i < order.length; i++) {
      if (0 > order[i].top) {
        currentIndex = i + 1;
      }
      this.#mapTargets.set(order[i].el, {
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

  intersectionCallback (entries) {
    const entry = entries[0];
    const isIntersecting = entry.isIntersecting;
    
    if (isIntersecting) {
      this.#scrollingDown = entry.boundingClientRect.top >= 0;

      const current = entry.target;
      let pos = 'mid';
      if (current === this.#firstTarget) {
        pos = 'start';
      } else if (current === this.#lastTarget) {
        pos = 'end';
      }
      this.#currentTarget = current;
      this.update(pos);
    }
  }

  setup () {
    this.#setup = true;
    this.#observer = new IntersectionObserver(this.intersectionCallback, {
      threshold: 0.5
    });
    JumpScroll.#observedTargetAttributes.forEach(propName => {
      this.updateTargetMap(propName, el => {
        this.#observer.observe(el);
      });
    });
  }

  teardown () {
    if (this.#observer) {
      this.#observer.disconnect();
    }
    this.#observer = null;
    this.#firstTarget = null;
    this.#lastTarget = null;
    this.#currentTarget = null;
    this.#container = null;
    this.#mapTargets = null;
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
    shadowRoot.innerHTML = `<style>${JumpScrollCss}</style><div class="container none"><div class="top"><div class="start"></div><div class="prev"></div></div><div class="bot"><div class="next"></div><div class="end"></div></div></div>`;

      this.#container = shadowRoot.querySelector('.container');
      /* eslint-disable no-self-assign */
      this.display = this.display;
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