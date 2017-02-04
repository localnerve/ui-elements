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
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `targetClass` | String | The class that identifies the scroll targets (pages in the horizontal-pager). Must be supplied. |
| `[startIndex]` | Number | Which scroll target to show initially. Optional, defaults to 0, the first element returned from querySelectorAll on targetClass. |
| `[scrollThreshold]` | Number | Less than 1, the percentage of width beyond which a touch will cause a complete scroll to the next page. Optional, defaults to 0.35 (35 percent). |
| `[doneThreshold]` | Number | The translateX pixel value below which to stop animations. Defaults to 1 (Will not animate below 1px). |
| `[done]` | Function | A function to call after a scroll has completed. |
| `[willComplete]` | Function | A function to call when a scroll will complete very soon (called when scrollThreshold is surpassed and `touchend` is fired). |

### Instance API
#### initialize ()
Starts event listening, and renders initial styles on the elements found by the given `options.targetClass`. Requires a global `document` to be available when called. No arguments, no return.

#### destroy ()
Stops event listening and any pending animations. Requires a global `document` to be available when called. No arguments, no return.

## How To Use
### Vanilla JS
See `DOMContentLoaded`, `unload` event handlers in the [example](index.js).

### General Usage (frameworks, universal)
Deliver the `horizontal-pager.js` script with your markup. After that, here are the **when**s:
  1.  **When** you have the options ready/known, call the top-level api function `createHorizontalPager` to assign options and get the instance API. No browser required.
  2.  **When** a global `document` is available, call `initialize` to start the horizontal pager.
  3.  **After** `initialize` has been called AND **when** a global `document` is available, call `destroy` to stop everything.
