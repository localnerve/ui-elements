# custom-sticky

> A specialized, composable scroll animation behavior.

## custom-sticky
On every scroll event, moves an element to another element or an arbitrary distance, then stops (or "sticks"). All directions and transforms supported. Can be used in a group of CustomSticky instances for an animated scene. Also, can act as a custom `position: sticky` solution for times when it doesn't make sense or isn't supported.

### Top-level API
#### *Instance* createCustomSticky (options)
Creates an instance of custom sticky behavior for an element. Returns the instance API.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `scrollSelector` | String | Selector of the unique element that is the source of the `scroll` event. |
| `movingSelector` | String | Selector of the unique moving element that intersects with the `target` Rect. |
| `target` | String or Function | Selector of the unique element to move to, or a function that returns an arbitrary Rect to move to. This option is actually not required if you supply the `traverseLength` option. |
| `[traverseLength]` | Function | Gets the distance to travel before sticking. Defaults to the distance between target and moving element Rects. If not supplied, must supply `target`. Somewhat performance sensitive. |
| `[animationLength]` | Function | Gets the vertical distance to animate over. The animation will try to complete within the vertical distance specified. Defaults to window.innerHeight (entire viewport height). |
| `[alwaysVisible]` | Boolean | True indicates the moving element is always visible and never goes out of the viewport. Defaults to false. |
| `[direction]` | String | The direction the moving element should move. 'up', 'down', 'left', or 'right', defaults to 'up'. Strings are available as exported constants in `CSDirection`.
| `[resizeWait]` | Number | Milliseconds to wait to update geometry information after window resize event. Optional, defaults to 150 milliseconds. |
| `[transform]` | Function | Returns a custom transform given a scroll position. Defaults to the appropriate linear translation for the direction. Very performance sensitive. |
| `[notify]` | Function | Called when "stuck" or "un-stuck". Callback receives `true` for stuck, `false` for un-stuck. |

### Instance API

#### getLastY ()
Returns the last y seen during animation or the upper bound.

#### start ([peers], [startY])
Starts custom sticky behavior, scroll event listening.
+ `[peers]` is an optional Array of CustomSticky instances that also listen to the same scroll source (specified by `scrollSelector`). When using multiple CustomSticky behaviors on a single scroll source, specifying this option will dramatically increase performance. See the [example](index.js) for usage.
+ `[startY]` is an optional Number indicating a desired start scrollTop Y position. Subject to upper bound restriction inferred from `target` or `traverseLength`.

#### stop ()
Stops custom sticky behavior, scroll event listening.
