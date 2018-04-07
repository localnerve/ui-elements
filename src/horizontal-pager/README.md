# horizontal-pager
[![npm version](https://badge.fury.io/js/horizontal-pager.svg)](http://badge.fury.io/js/horizontal-pager)

> A small, fast, no-dependency, horizontal pager.

## Live example
  https://localnerve.github.io/ui-elements/dist/horizontal-pager/

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
  14. ~11k min bundle, ~3k gzip.

## Missing Features
  1.  No touch velocity considerations.

## Old Browser Support
To support older browsers, the following polyfills must be supplied by you (polyfills are not supplied with this lib):
* Promise
* requestAnimationFrame/cancelAnimationFrame
* Object.assign
* Math.trunc
* Array.includes  

For example, here is the v2 [polyfill.io](https://polyfill.io/v2/docs/) tag required prior to loading/parsing this library:
```
<script src="https://ft-polyfill-service.herokuapp.com/v2/polyfill.min.js?features=Promise,requestAnimationFrame,Object.assign,Math.trunc,Array.prototype.includes"></script>
```

## RAF considerations
Since this uses requestAnimationFrame, you may benefit from knowing that RAF will be suspended by browsers under some conditions. There is an answer [here](http://stackoverflow.com/questions/15871942/how-do-browsers-pause-change-javascript-when-tab-or-window-is-not-active) that sheds some good light on this. For example, I discovered via this project's unit tests, that firefox 54 (linux) disables RAF when a "page" (an element identified by `options.targetClass`) has been scrolled beyond viewport visibility.

## API
### Top-level API
#### *Instance* createHorizontalPager (options)
Returns an API to a horizontal-pager instance, sets the instance options, starts event listening, and renders initial styles on the elements found by the given `options.targetClass`.  
`targetClass` is the only required option.  
Requires a global `document` to be available when called.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `targetClass` | String | The class that identifies the scroll targets (pages in the horizontal-pager). Must be supplied. Scroll targets (pages) must be sibling elements. |
| `[startIndex]` | Number | Which scroll target to show initially. Optional, defaults to 0, the first element returned from querySelectorAll on targetClass. |
| `[continuous]` | Boolean | True allows scroll to wrap around the ends. Optional, defaults to false. |
| `[willComplete]` | Function | A function to call when a scroll will complete shortly (called before completion). For touch, called when scrollThreshold is surpassed and `touchend` is fired. The function will receive a [moveResult](#moveresult-object) object. |
| `[scrollThreshold]` | Number | Less than 1, the percentage of width beyond which a touch will cause a complete scroll to the next page. Optional, defaults to 0.35 (35 percent). |
| `[doneThreshold]` | Number | The translateX pixel value below which to stop animations. Optional, defaults to 1 (Will not animate below 1px). |
| `[addParentStyles]` | Boolean | False disables the automatic adding of styles to the parent of the targetClass elements. Defaults to true. If disabled, you must supply the [parent styles](#parent-styles). |
| `[done]` | Function | A function to call after a scroll has completed. Optional. Redundant if [Instance API](#instance-api) used. The function will receive a [moveResult](#moveresult-object) object. |


### Instance API

#### *Promise* next ()
Moves to the next target as identified by `targetClass`. If the current target is the end, nothing happens. No arguments. Returns a Promise that resolves after the move has completed. The resolver receives a [moveResult](#moveresult-object) object on success, or null if the animation could not be executed because one is already in progress.

#### *Promise* prev ()
Moves to the previous target as identified by `targetClass`. If the current target is the beginning, nothing happens. No arguments. Returns a Promise that resolves after the move has completed. The resolver receives a [moveResult](#moveresult-object) object on success, or null if the animation could not be executed because one is already in progress.

#### *Promise* moveRel (distance)
Moves `distance` targets away from the current `targetClass`. If the specified distance would move out of bounds, nothing happens. A `distance` of -1 is a synonym for `prev`. If continuous mode, then absolute value of the distance cannot exceed the number of scroll targets. Returns a Promise that resolves after the move has completed. The resolver receives a [moveResult](#moveresult-object) object on success, or null if the animation could not be executed because one is already in progress or the argument is not acceptable.

#### *Promise* moveAbs (index)
Moves to the `targetClass` at the zero-based index. If an out of bounds or current index is specified, nothing happens. Returns a Promise that resolves after the move has completed. The resolver receives a [moveResult](#moveresult-object) object on success, or null if the animation could not be executed because one is already in progress or the argument is not acceptable.

#### targetCount ()
Returns the number of `targetClass` items found by the horizontal-pager.

#### currTargetIndex ()
Returns the index of the current target.

#### prevTargetIndex ()
Returns the index of the previous target.

#### destroy ()
Stops event listening and any pending animations. Requires a global `document` to be available when called. No arguments, no return.

### moveResult Object
The move animation commands, `next`, `prev`, `moveRel`, and `moveAbs` return a Promise that resolves to **null** on failure, or a `moveResult` object on success. The move result object contains the following properties:
```javascript
// moveResult
{
  currTargetIndex, // The new, current target index
  prevTargetIndex, // The previous target index
  distance         // The distance moved, eg: -1 for one back, 2 for two forward
}
```

## Parent Styles
Here are the styles automatically added to the parent element of the `targetClass` scroll target siblings (the pages), unless the `addParentStyles` option is set to false:
```css
{
  position: relative;
  width: 100%;
  overflow-x: hidden;
}
```
If you disable `addParentStyles`, you must supply at least these styles to *a container element* of the pages identified by `targetClass` for horizontal-pager to work.

## How To Use
### Vanilla JS
See `DOMContentLoaded`, `unload` event handlers in the [example](index.js).
Example markup and styles are supplied in the [example](index.html).

### General Usage (frameworks, universal)
Deliver the `horizontal-pager.js` script with your page. On the server, you will want to deliver the `startIndex` to the client to initially render the proper `targetClass` page for the current route. Also, you need to initially render the markup for the `targetClass` elements (the pages) and their common parent, but **not** the content of the pages (unless they need to be visible immediately). On the client, give the `startIndex` and `targetClass` options to the top-level api function `createHorizontalPager` prior to the first client render. Also, you should use the `willComplete` callback to get the page content if it is not already rendered on the client.  
#### Client-side Usage:
  1.  Call the top-level api function `createHorizontalPager` (the default export), and give it the options. This starts listening to events, and returns an interface to the horizontal-pager instance.
  + Requires a global `document` to be available.
    + In `React`, a good place to do this is in `componentDidMount`.
  2.  When you're done, call `destroy` on the horizontal-pager instance to stop animations and events.
    + Requires a global `document` to be available.
      + In `React`, a good place to do this is in `componentWillUnmount`.
