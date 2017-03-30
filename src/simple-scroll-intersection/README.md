# simple-scroll-intersection

> Small, fast, no-dependency, scroll intersection implementation.

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
| `notify` | Function | Called on intersection or dis-intersection, receives an Object containing two props: `intersection` {Boolean} and `from` {Object}. `intersection` is true if intersecting, false otherwise. If intersection is true, `from` contains Booleans indicating side of intersection: `top`, `bottom`, `left`, and `right`. |

### Instance API
#### start ()
Starts scroll event listening.

#### stop ()
Stops scroll event listening.

#### getUpdateScroll ()
Returns the instance bound updateScroll worker method. Useful primarily for component composition.
