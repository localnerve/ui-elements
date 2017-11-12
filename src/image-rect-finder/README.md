# image-rect-finder

> An example that gives alpha transparency to jpeg using Canvas.

## image-rect-finder

### Background
In the absence of cross-browser `webp` format, there is no image format available to web developers that combines good size and presentation qualities with an alpha channel.
Jpeg has good compression as well as progressive rendering. Rendering it to canvas, you can treat it like a png (with an alpha channel). So you get the size benefit of jpeg compression and the alpha channel of png. Depending on your image, this can be a huge benefit, especially on mobile networks.

### Rect-finder Algorithm
To handle multiple, dynamic sizes one needs to find the part of the image to "alpha-ize". This can be challenging and best deferred to image detection libraries like [trackingjs](https://github.com/eduardolundgren/tracking.js). In this example, since just a simple color rect is required, a worker process with a rect-finder algorithm was created.

The rect finder algorithm locates a rectangle by searching the image rgba space for a constant shade rectangle. As it goes, it compares the grayscale value of a pixel to the target shade (also grayscale) to find. It first looks for a top-left corner, then a bottom-right corner, and returns a rect object containing top, left, width, and height properties.

The rect-finder algorithm (with more detail in comments) is found [here](find-rect-worker.js).

#### Algorithm Options
| Option Name | Data Type | Description |
| :--- | :--- | :--- |
| `shade` | Number | The target 8-bit grayscale color of the rectangle to find (range 0-255). |
| `candidateThreshold` | Number | Shade difference under which a pixel is a considered a candidate for corner detection. Same for topLeft and bottomRight, use as a rough filter. |
| `topLeft` | Object | Options specific to top-left corner detection. |
| `topLeft.targetBlockMax` | Number | Shade difference under which a block of pixels (6) around a candidate are considered a solid block. |
| `topLeft.edgeDiffMin` | Number | Shade difference over which a block of pixels (6) adjacent to a candidate are considered an edge. Used for both horizontal and vertical edge. |
| `bottomRight` | Object | Options specific to bottom-right corner detection. |
| `bottomRight.targetBlockMax` | Number | Shade difference under which a block of pixels (6) around a candidate are considered a solid block. |
| `bottomRight.edgeDiffMin` | Number | Shade difference over which a block of pixels (6) adjacent to a candidate are considered an edge. Used for both horizontal and vertical edge. |

### Other Notable Code

#### Canvas Scaling
To show the dynamic image processing abilities, the canvas is scaled to the container. This is a useful technique for other applications. Seen [here](phone-scene.js#L75).

#### Worker
Off-loading work to a worker is great for keeping the main thread free to do user work. In this example, the rect-finder work is off-loaded to a worker. Two-way messaging and data transfer worker interface seen [here](find-rect.js).
