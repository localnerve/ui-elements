# **custom-sticky** and **simple-scroll-intersection**

> WIP - Small, fast, no-dependency, scroll intersection and custom sticky implementations.

## simple-scroll-intersection
A scroll intersection observer for a use case where IntersectionObserver doesn't work/make sense.
### Top-level API
#### *Instance* createSimpleScrollIntersection (options)
Creates an instance of scroll intersection interest between a moving element and a stationary element. Returns the instance API.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `scrollSelector` | String | Unique selector of the element that is the source of the `scroll` event. |
| `movingSelector` | String | Unique selector of the moving element that intersects with the stationary element. |
| `stationary` | String or Function | Selector of the non-moving element to test intersection with or a function that returns an arbitrary rect to test intersection with. |
| `notify` | String | Called on intersection or dis-intersection, receives an Object containing two props: `intersection` {Boolean} and `from` {Object}. `intersection` is true if intersecting, false otherwise. `from` contains Booleans indicating side of intersection or dis-intersection: `top`, `bottom`, `left`, and `right`|

### Instance API
#### start ()
Starts scroll event listening.

#### stop ()
Stops scroll event listening.

## custom-sticky
A custom `position: sticky` solution for times when it doesn't make sense or isn't supported. Uses simple-scroll-intersection.
> For now, this implementation only supports scrolling with up/down movement and sticking a moving element to the bottom of a fixed element.

### Top-level API
#### *Instance* createCustomSticky (options)
Creates an instance of custom sticky behavior between a moving element and a stationary element. Returns the instance API.

##### Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `scrollSelector` | String | Unique selector of the element that is the source of the `scroll` event. |
| `movingSelector` | String | Unique selector of the moving element that intersects with the stationary element. |
| `stationary` | String or Function | Selector of the non-moving element to test intersection with or a function that returns an arbitrary rect to test intersection with. |
| `[traverseLength]` | Function | Gets the distance to travel before sticking. Defaults to the distance between stationary and moving element rects. |
| `[direction]` | String | The direction the moving element should move. 'up', 'down', 'left', or 'right', defaults to 'up'. Strings are available as exported constants in `CSDirection`.
| `[resizeWait]` | Number | Milliseconds to wait to update geometry information after window resize event. Optional, defaults to 350 milliseconds. |
| `[transform]` | Function | Returns a custom transform given a scroll position. Defaults to the appropriate translation for the direction. |

### Instance API
#### start ()
Starts custom sticky behavior, scroll event listening.

#### stop ()
Stops custom sticky behavior, scroll event listening.
