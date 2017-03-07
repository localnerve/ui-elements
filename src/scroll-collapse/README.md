# scroll-collapse

> A small, no-dependency scroll behavior that vertically collapses (and expands) two regions in relation to a scroll progress.  

> This is a WIP under development and can change at any time. The ongoing challenge is get an implementation to have the least impact on layout (reflows), getting as much of the work as possible into the compositor.

## Exports
### Top-level API
#### startScrollCollapse (options)
Starts the scroll collapse behavior listening on `scroll` and sets the options. No return value.

### Class
#### SCConstants
A Class that contains ScrollCollapse constants. It exposes some properties useful to the `notify` callback:

+ ###### SCConstants.START_COLLAPSE
Passed to the `notify` function at the start of scroll collapse.

+ ###### SCConstants.END_COLLAPSE
Passed to the `notify` function when scroll collapse has completed.

+ ###### SCConstants.START_EXPAND
Passed to the `notify` function when the scroll collapse begins to reverse.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `scrollSelector` | String | Unique selector of the element that is the source of the `scroll` event. |
| `topCollapseSelector` | String | Unique selector of the first (top) element to be collapsed. |
| `bottomCollapseSelector` | String | Unique selector of the second (bottom) element to be collapsed. |
| `[notify]` | Function | Callback called when collapse starts, ends, and when it starts to reverse. Receives SCConstants.START_COLLAPSE, SCConstants.END_COLLAPSE, or SCConstants.START_EXPAND to convey which state occurred. Optional. |
| `[resizeWait]` | Number | Milliseconds to wait to update geometry information after window resize event. Optional, defaults to 350 milliseconds. |

## How To Use
### Vanilla JS
See [the example](index.js).
