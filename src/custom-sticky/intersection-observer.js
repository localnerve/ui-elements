/**
 * Contain the intersection-observer/polyfill.
 */

// Polyfill the global IntersectionObserver/Entry, if required.
import 'intersection-observer';

export function createIntersectionObserver (callback, options) {
  return new IntersectionObserver(callback, options);
}

export default createIntersectionObserver;
