# **custom-sticky** and **simple-scroll-intersection**

> Small, fast, no-dependency, scroll intersection and custom sticky implementations.

## custom-sticky
On scroll, moves an element to another element (or arbitrary Rect) by way of intersection testing. All directions and transforms supported. Can be used in a group of CustomSticky instances for an animated scene. Also, can act as a custom `position: sticky` solution for times when it doesn't make sense or isn't supported. Uses [simple-scroll-intersection](#simple-scroll-intersection) to stop/start animations.

### Top-level API
#### *Instance* createCustomSticky (options)
Creates an instance of custom sticky behavior between a moving element and a another element. Returns the instance API.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `scrollSelector` | String | Unique selector of the element that is the source of the `scroll` event. |
| `movingSelector` | String | Unique selector of the moving element that intersects with the `target` Rect. |
| `target` | String or Function | Selector of the element to test intersection with or a function that returns an arbitrary Rect to test intersection with. |
| `[traverseLength]` | Function | Gets the distance to travel before sticking. Defaults to the distance between target and moving element Rects. |
| `[direction]` | String | The direction the moving element should move. 'up', 'down', 'left', or 'right', defaults to 'up'. Strings are available as exported constants in `CSDirection`.
| `[resizeWait]` | Number | Milliseconds to wait to update geometry information after window resize event. Optional, defaults to 350 milliseconds. |
| `[transform]` | Function | Returns a custom transform given a scroll position. Defaults to the appropriate linear translation for the direction. Performance sensitive. |
| `[notify]` | Function | Called when stuck or un-stuck. Callback receives `true` for stuck, `false` for un-stuck. |

### Instance API
#### start ([peers], [startY])
Starts custom sticky behavior, scroll event listening.
+ `[peers]` is an optional Array of CustomSticky instances that also listen to the same scroll source (specified by `scrollSelector`). When using multiple CustomSticky behaviors on a single scroll source, specifying this option will dramatically increase performance. See the [example](index.js) for usage.
+ `[startY]` is an optional Number indicating a desired start scrollTop Y position.

#### stop ()
Stops custom sticky behavior, scroll event listening.

#### getUpdateResize ()
Returns the bound updateResize method for the instance. Useful for component composition.

#### getUpdateScroll ()
Returns the bound updateScroll method for the instance. Useful for component composition.

#### getSsiUpdateScroll ()
Returns the bound updateScroll method used for the intersection detection for the instance. Useful for component composition.

#### getLastY ()
Returns the last y seen during animation or the upper bound.

## simple-scroll-intersection
A scroll intersection observer for a use case where IntersectionObserver doesn't work/make sense.
### Top-level API
#### *Instance* createSimpleScrollIntersection (options)
Creates an instance of scroll intersection interest between a moving element and a target Rect. Returns the instance API.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `scrollSelector` | String | Unique selector of the element that is the source of the `scroll` event. |
| `movingSelector` | String | Unique selector of the moving element that intersects with a `target` Rect. |
| `target` | String or Function | Selector of the element to test intersection with or a function that returns an arbitrary Rect to test intersection with. |
| `notify` | String | Called on intersection or dis-intersection, receives an Object containing two props: `intersection` {Boolean} and `from` {Object}. `intersection` is true if intersecting, false otherwise. `from` contains Booleans indicating side of intersection or dis-intersection: `top`, `bottom`, `left`, and `right`|

### Instance API
#### start ()
Starts scroll event listening.

#### stop ()
Stops scroll event listening.

#### getUpdateScroll ()
Returns the instance bound updateScroll method. Useful for component composition.
