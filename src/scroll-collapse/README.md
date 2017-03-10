# scroll-collapse

> A small, no-dependency scroll behavior that vertically collapses (and expands) two regions in relation to a scroll progress.  

> An ongoing challenge for this implementation is to have the least impact on layout (best performance), while retaining native scroll functionality and implementation sanity. The current implementation is a balance.

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

+ ###### SCConstants.END_EXPAND
Passed to the `notify` function when the scroll collapse reversal is complete.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `scrollSelector` | String | Unique selector of the element that is the source of the `scroll` event. |
| `topCollapseSelector` | String | Unique selector of the first (top) element to be collapsed. |
| `bottomCollapseSelector` | String | Unique selector of the second (bottom) element to be collapsed. |
| `props` | Array | The properties to animate for top and bottom collapse. Opacity also allowed. Defaults to `opacity`, `height`, `marginTop`, `marginBottom`, `paddingTop`, `paddingBottom`, `borderTopWidth`, `borderBottomWidth`. |
| `[notify]` | Function | Callback called when collapse starts, ends, and when it starts to reverse. Receives SCConstants.START_COLLAPSE, SCConstants.END_COLLAPSE, SCConstants.START_EXPAND, or SCConstants.END_EXPAND to convey which state occurred. Optional. |
| `[resizeWait]` | Number | Milliseconds to wait to update geometry information after window resize event. Optional, defaults to 350 milliseconds. |

## How To Use
### Vanilla JS
See [the example](index.js).
