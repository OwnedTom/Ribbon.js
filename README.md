# Ribbon.js

JS Library for creating an animated, svg ribbon. Inspired by https://bannerwave.com website

# Getting Started

Requires the GSAP TweenMax/TimelineMax and Club Greensock Plugins and Utilities, specifically
* MorphSVG
* ModifiersPlugin

# Using Ribbon.js

Creating a new Ribbon is as simple as `var ribbon = new Ribbon(el, options);`

The options available are as follows

* **type** (string) - (ribbon/wave) Whether the ribbon is displayed as a ribbon or a wave. (Wave has a square base with the top side animated. Ribbon has both sides animated)
* **ribbonWidth** (number) - The width of the ribbon being created. **Ribbon Only**
* **x** (number) - The x value of the start of the ribbon
* **y** (number) - The y value of the start of the ribbon
* **opacity** (number) - The opacity of the created ribbon
* **color** (string) - The color of the ribbon, currently supports hsl, hsla or linear-gradient
* **reverse** (boolean) - Whether the wave is flipped or not. **Wave Only**
* **svgHeight** (number) - The height of the SVG Element. **Default:** height of el parameter
* **svgWidth** (number) - The width of the SVG Element. **Default:** width of el parameter
