# horizontal-pager

> A small, fast, no-dependency, horizontal pager.

## Features
  1.  Horizontal touch or exposed methods move to next/prev pages.
  2.  Interface allows animated moves by relative distance, or absolute index.
  3.  Initial render at any page.
  4.  Uses `requestAnimationFrame` aligned (decoupled) animations.
  5.  Does not interfere with other vertical/complex page interactions.
  6.  Tracks finger when down, then ease-out.
  7.  Optional continuous scroll (last wraps to first).
  8.  Edge resistance (for when continuous is disabled).
  9.  Minimal DOM update approach.
  10. Passive event listeners.
  11. When navigation certain to complete, calls optional `willComplete` callback.
  12. Optional `done` callback for notification after navigation complete.
  13. A css class identifies scroll level items (pages).
  14. ~9.4k min bundle, ~2.7k gzip.

## Missing Features
  1.  No touch velocity considerations.

## API
### Top-level API
#### *Instance* createHorizontalPager (options)
Returns an API to a horizontal-pager instance, sets the instance options, starts event listening, and renders initial styles on the elements found by the given `options.targetClass`.  
`targetClass` is the only required option.  
Requires a global `document` to be available when called.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `targetClass` | String | The class that identifies the scroll targets (pages in the horizontal-pager). Must be supplied. |
| `[startIndex]` | Number | Which scroll target to show initially. Optional, defaults to 0, the first element returned from querySelectorAll on targetClass. |
| `[continuous]` | Boolean | True allows scroll to wrap around the ends, defaults to false. |
| `[scrollThreshold]` | Number | Less than 1, the percentage of width beyond which a touch will cause a complete scroll to the next page. Optional, defaults to 0.35 (35 percent). |
| `[doneThreshold]` | Number | The translateX pixel value below which to stop animations. Defaults to 1 (Will not animate below 1px). |
| `[done]` | Function | A function to call after a scroll has completed. |
| `[willComplete]` | Function | A function to call when a scroll will complete shortly. For touch, called when scrollThreshold is surpassed and `touchend` is fired. Receives the distance moved as a single argument, -1 for previous, for example. |

### Instance API

#### destroy ()
Stops event listening and any pending animations. Requires a global `document` to be available when called. No arguments, no return.

#### next ()
Moves to the next target as identified by `targetClass`. If the current target is the end, nothing happens. No arguments. Returns a boolean indicating if the animation will occur in the next animation frame.

#### prev ()
Moves to the previous target as identified by `targetClass`. If the current target is the beginning, nothing happens. No arguments. Returns a boolean indicating if the animation will occur in the next animation frame.

#### moveRel (distance)
Moves `distance` targets away from the current `targetClass`. If the specified distance would move out of bounds, nothing happens. A `distance` of -1 is a synonym for `prev`. Returns a boolean indicating if the animation will occur in the next animation frame. If continuous mode, then absolute value of the distance cannot exceed the number of scroll targets.

#### moveAbs (index)
Moves to the `targetClass` at the zero-based index. If an out of bounds or current index is specified, nothing happens. Returns a boolean indicating if the animation will occur in the next animation frame.

#### targetCount ()
Returns the number of `targetClass` items found by the horizontal-pager.

#### currTargetIndex ()
Returns the index of the current target.

#### prevTargetIndex ()
Returns the index of the previous target.

## How To Use
### Vanilla JS
See `DOMContentLoaded`, `unload` event handlers in the [example](index.js).

### General Usage (frameworks, universal)
Deliver the `horizontal-pager.js` script with your page. In a universal app, you will want to deliver the `startIndex` to the client to initially render the proper `targetClass` page for the current route. On the client, give the `startIndex` and `targetClass` options to the top-level api function `createHorizontalPager` prior to the first client render.
Client-side Usage:
  1.  Call the top-level api function `createHorizontalPager` (the default export), and give it the options. This starts listening to events, and returns an interface to the horizontal-pager instance.
    * Requires a global `document` to be available.
      * In `React`, a good place to do this is in `componentDidMount`.
  2.  When you're done, call `destroy` on the horizontal-pager instance to stop animations and events.
    * Requires a global `document` to be available.
      * In `React`, a good place to do this is in `componentWillUnmount`.
