# jump-scroll
[![npm version](https://badge.fury.io/js/%40localnerve%2Fjump-scroll.svg)](http://badge.fury.io/js/%40localnerve%2Fjump-scroll)

> A small, fast, no-dependency, jump scroll webcomponent.

## Live example
  https://localnerve.github.io/ui-elements/dist/jump-scroll/

## Summary

Provides a small scrolling control that allows the user to go to the top or bottom, or jump to the next (or previous) section of a page. Non-browser version of the module exports build helpers (for building CSP rules, etc).

## Attributes

* `target` - *Required*. A selector to select all the elements to vertically "jump scroll" to in the page. Defaults to 'section'.  

* `display` - *Optional*.  Values: `"best" | "both"`  
  **"best"** - *Default*. The control displays either [top, previous] OR [bottom, next] jump scrolling options. Which one is displayed depends on the position on the page and the direction of scrolling. If the user is in the middle of the page and scrolls, the control only displays the jump scroll options in the direction of the scroll. Less vertical space required.  
  **"both"** - The control displays both [top, previous] AND [bottom, next] jump scrolling options simulataneously. Larger footprint.  
  
* `colormap` - *Optional*. A map of targets to colors. Changes the color of the jump-scroll control over specific elements.  
  **Format:** `selector@color[;selector@color]*`  
  **selector** - *String*. Must be a selector of DOM element(s). When a selected element crosses the vertical bounds of the `jump-scroll` control, the `js-bg-color` background will be changed to the color (or variable) provided.  
  **color** - *CssColor|CssCustomProperty*. A css color or a custom property (variable) of a color to use for the `js-bg-color` background of the control.  

## Overridable CSS Variables

* `--js-width` - The overall width of the control. Defaults to 3rem.
* `--js-aspect-ratio` - The aspect ratio of the control. Defaults to 1/5.
* `--js-bg-color` - The color of the control arrows. Defaults to black.
* `--js-opacity-full` - The opacity of the control arrows at attention. Defaults to 0.7.
* `--js-opacity-rest` - The opacity of the control arrows at rest. Defaults to 0.3.
* `--js-attach-right` - The distance from the fixed, right-edge attachment. Defaults to 1rem;
* `--js-attach-bottom` - The distance form the fixed, bottom-edge attachment. Defaults to 1rem;

## Usage Example

```html 
  <jump-scroll target="article" display="best" colormap="footer,article:nth-of-type(even)@--bg-color"></jump-scroll>
```
See [The reference implementation](https://github.com/localnerve/ui-elements/blob/master/src/jump-scroll/index.html) for more detailed usage example.

## Non-browser Exports

The non-browser version of the module exports methods to help with builds.

### {Promise} getJumpScrollCssText()

Asynchronously gets the raw shadow css text.  
Useful for computing the hash for a CSP style rule.  
Returns a Promise that resolves to the full utf8 string of css text.

## License

LocalNerve [BSD-3-Clause](https://github.com/localnerve/ui-elements/blob/master/src/jump-scroll/LICENSE.md) Licensed

## Contact

twitter: @localnerve
email: alex@localnerve.com
