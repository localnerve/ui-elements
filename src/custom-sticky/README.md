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
| `stationarySelector` | String | Unique selector of the non-moving element to test intersection with. |
| `movingSelector` | String | Unique selector of the moving element that intersects with the stationary element. |
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
| `stationarySelector` | String | Unique selector of the non-moving element to test intersection with. |
| `movingSelector` | String | Unique selector of the moving element that intersects with the stationary element. |
| `traverse` | String or Function | Identifies the element to scroll over before sticking, or a function that returns the `height` of the area to traverse before sticking.|
| `[resizeWait]` | Number | Milliseconds to wait to update geometry information after window resize event. Optional, defaults to 350 milliseconds. |

### Instance API
#### start ()
Starts custom sticky behavior, scroll event listening.

#### stop ()
Stops custom sticky behavior, scroll event listening.
