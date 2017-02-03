# horizontal-pager

> A small, fast, no-dependency, horizontal pager.

## Features
  1.  Horizontal touch navigates to next/prev pages.
  2.  Uses `requestAnimationFrame` aligned (decoupled) animations.
  3.  Vertical page scrolling and complex pages fully supported via passive event listeners.
  4.  Tracks finger when down, then ease-out.
  5.  Edge resistance.
  6.  Can start at any page.
  7.  Minimal DOM update approach.
  8.  Passive event listeners where possible.
  9.  When finger up and navigation certain to complete, calls `willComplete`
      callback (optional).
  10.  Optional `done` callback for notification after navigation complete.
  11. A css class identifies scroll level items (pages).

## Missing Features
  1.  No continuous option (infinite, last-wraps-to-first and vice-versa).
  2.  No direct navigate ability after started (can't go directly to page N).

## API
### Top-level API
#### createHorizontalPager (options)
Returns an API to a horizontal-pager instance. Use to set the options on the instance.  
`targetClass` is the only required option.
##### Options
  * {String} `options.targetClass` - The class that identifies the page blocks. Must be supplied.
  * {Number} `[options.startIndex]` - Which scroll target to show initially. Defaults to 0, the first returned from querySelectorAll on targetClass.
  * {Number} `[options.scrollThreshold]` - Less than 1, a decimal percentage beyond which a touch will cause a complete scroll. Defaults to 0.35 (35 percent).
  * {Number} `[options.maxFind]` - Maximum parent level to search to find target Class (touch target to targetClass). Defaults to 20. If your page content has a lot of deep markup, you might have to adjust this number.
  * {Number} `[options.doneThreshold]` - The translateX pixel value below which to stop animations. Defaults to 1 (Will not animate below 1px).
  * {Function} `[options.done]` - A function to call after a scroll has completed.
  * {Function} `[options.willComplete]` - A function to call when a scroll will complete very soon.

### Instance API
#### initialize ()
Requires a global `document` to be available when called. Starts event listening, and renders initial styles on the elements found by the given `options.targetClass`. No arguments, no return.

#### destroy ()
Requires a global `document` to be available when called. Stops event listening and any pending animations. Resets styles on the elements found by the given `options.targetClass`. No arguments, no return.

## How To Use
### Vanilla JS
See `DOMContentLoaded`, `unload` event handlers in the [example](index.js).

### General Usage (frameworks, universal)
Deliver the `horizontal-pager.js` script with your markup. After that, here's the **when**'s:
  1.  **When** you have the options ready, call the top-level api function `createHorizontalPager` to assign options and get the instance API. No browser required.
  2.  **When** a global `document` is available, call `initialize` to start the horizontal pager.
  3.  **After** `initialize` has been called AND **when** a global `document` is available, call `destroy` to stop everything.
