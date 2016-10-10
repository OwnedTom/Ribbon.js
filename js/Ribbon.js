
function Ribbon(el, options) {
	this.svgns = "http://www.w3.org/2000/svg";
	this.el = el.constructor.name == "SVGSVGElement" ? el : document.querySelector("svg");
	this.color = {
		h: 0,
		s: 64,
		l: 22,
		a: .7
	}
	this.paused					= false;
	this.options 				= {};
	this.options.opacity		= options.opacity || 1;
	this.options.type			= options.type || "ribbon";
	this.options.ribbonWidth 	= options.ribbonWidth || 100;
	this.options.reverse 		= options.reverse || false;
	this.options.svgHeight 		= options.svgHeight || this.el.height.baseVal.value;
	this.options.svgWidth 		= options.svgWidth || this.el.width.baseVal.value;
	this.options.x				= options.x || 0;
	this.options.y 				= options.y || 0;
	this.options.color 			= options.color || "hsla(122,64%,22%,.7)";
	this.options.speed 			= options.speed || .2;
	this.options.colorSpeed		= options.colorSpeed || options.speed;
	this.options.increments 	= options.increments || this.options.svgWidth / 10;
	this.options.incrementSize  = this.options.svgWidth / this.options.increments
	this.options.modifiers 		= options.modifiers || {
		o: { m: 12, d: .14, s: 0   },
		a: { m: 13, d: .2,  s: -9  },
		n: { m: 10, d: .15, s: -10 }
	}
	this.props 					= options.props || {
									var1: 0,
									var2: 0,
									var3: 0
								}

	this.path 					= document.createElementNS(this.svgns, "path");
	this.path.style.opacity 	= this.options.opacity;
	//this.path.setAttribute("fill", this.options.color)
	this.el.appendChild(this.path);
	TweenMax.set(this.props, {
				var1: "+=" + .8 * this.options.speed,
				var2: "+=" + 1.4 * this.options.speed,
				var3: "-=" + 1.2 * this.options.speed
			})
	setInterval(function() {
		this.updateColor();
	}.bind(this), this.options.colorSpeed * 1000)
	setInterval(function() {
		
		this.updatePath();
	}.bind(this), 100)
}

Ribbon.prototype.updatePath = function() {
	if(!this.paused) {
		var newPath = "M", revPath = "";
		newPath += this.options.x + "," + this.options.y;
		var e, arr = [];
		TweenMax.set(this.props, {
					var1: "+=" + .8 * this.options.speed,
					var2: "+=" + 1.4 * this.options.speed,
					var3: "-=" + 1.2 * this.options.speed
				})
		for(var e = -1; this.options.increments + 2 > e; e++) {
			arr[e] = {};
			arr[e].x = e * this.options.incrementSize;
			var o = this.options.modifiers.o.m * Math.sin(this.options.modifiers.o.d * e + this.props.var1) + this.options.modifiers.o.s;
			var a = this.options.modifiers.a.m * Math.sin(this.options.modifiers.a.d * e + this.props.var2) + this.options.modifiers.a.s;
			var n = this.options.modifiers.n.m * Math.cos(this.options.modifiers.n.d * e + this.props.var3) + this.options.modifiers.n.s;
			arr[e].y = .5 * this.options.svgHeight + o - a + n;
		}
		for(e = 0; this.options.increments + 2 > e; e++) {
			var p = {};
			p.x = .5 * (arr[e-1].x + arr[e].x);
			p.y = .5 * (arr[e-1].y + arr[e].y);
			newPath += "Q" + arr[e-1].x + "," + arr[e-1].y + " " + p.x + "," + p.y;
			revPath = "Q" + arr[e-1].x + "," + (arr[e-1].y + this.options.ribbonWidth) + " " + p.x + "," + (p.y + this.options.ribbonWidth) + revPath;
		}
		if(this.options.type == "ribbon") {
			newPath += "L" + this.options.svgWidth + "," + (p.y + this.options.ribbonWidth) + revPath;
		} else if(this.options.type == "wave") {
			if(this.options.reverse) {
				newPath += "L" + this.options.svgWidth + "," + this.options.y + "L" + this.options.x + "," + this.options.y;
			} else {
				newPath += "L" + this.options.svgWidth + "," + this.options.svgHeight + "L" + this.options.x + "," + this.options.svgHeight;
			}
		}
		newPath += " Z";
		TweenMax.to(this.path, .2, {
			morphSVG: {
				d: newPath
			},
			ease: Power0.easeNone
		});
	}
}

Ribbon.prototype.updateColor = function() {
	if(!this.paused) {
		var color = this.color;
		if(this.options.color == "rainbow") {
			if(color.h + 1 > 360) {
				color.h = 0;
			}
			TweenMax.set(color, {
				h: "+=" + 1 * this.options.speed
			});
			TweenMax.to(this.path, this.options.colorSpeed, {
				fill: "hsla(" + color.h + "," + color.s + "%," + color.l + "%," + color.a + ")"
			});
		}
		else if(this.options.color.indexOf("linear-gradient") == 0){
			var d = document.createElementNS(this.svgns, "defs");
			var g = document.createElementNS(this.svgns, "linearGradient");
			var gVars = this.options.color.split("(")[1].split(")")[0].split(",")
			g.setAttribute("id", "ribbonGradient");
			var angle = gVars[0].replace("deg", "").trim() - 90;
			g.setAttribute("gradientTransform", "rotate(" + angle + ")");
			var colors = [];
			for(var x = 1; x < gVars.length; x++) {
				var c = gVars[x].trim().split(" ");
				var color = c[0];
				var offset = typeof c[1] !== "undefined" ? c[1] : x == 1 ? "0%" : x == (gVars.length - 1) ? "100%" : null;
				colors.push({color: color, offset: offset})
			}
			for(var x in colors) {
				var stop = document.createElementNS(this.svgns, "stop");
				stop.setAttribute("offset", colors[x].offset);
				stop.setAttribute("stop-color", colors[x].color);
				g.appendChild(stop);
			}

			d.appendChild(g);
			this.el.appendChild(d);
			this.options.color = "url(#ribbonGradient)";
			this.path.setAttribute("fill", this.options.color)
		} else if(this.options.color == "url(#ribbonGradient)") {
			this.path.setAttribute("fill", this.options.color)
		} 

		else {
			/*TweenMax.to(this.path, this.options.colorSpeed, {
				fill: "hsla(" + color.h + "," + color.s + "%," + color.l + "%," + color.a + ")"
			});*/
		}
		this.color = color;
	}
}

Ribbon.prototype.pause = function() {
	this.paused = true;
	return this;
}

Ribbon.prototype.play = function() {
	this.paused = false;
	return this;
}

function OLD() {
		var maintl, width = jQuery(window).outerWidth(), increments = width/10, incrementSize = width / increments, height = 200, speed = .2, props = {}, colors = {}, speed2 = {speed1: .2, speed2: .3}, ribbonWidth = 20;
		props.var1 = 0,
		props.var2 = -10,
		props.var3 = 50,
		props.var4 = -15,
		props.var5 = 10,
		props.var6 = 3;
		colors.path = {h: 0, s: 64, l: 22};
		colors.path2 = {h: colors.path.h, s: colors.path.s, l: colors.path.l * 1.4}
		var svgns = "http://www.w3.org/2000/svg";
		var root = document.querySelector("svg");
		var ease = 0.75;
		var path = document.createElementNS(svgns, "path");
		path.classList.add("wave");
		//path.setAttribute("fill", "rgba(11,124,24,1)");
		var path2 = document.createElementNS(svgns, "path");
		path2.classList.add("wave2");
		//path2.setAttribute("fill", "rgba(13,191,34,0.6)");
		root.appendChild(path);
		root.appendChild(path2);
		TweenMax.to(speed2, 10,{
			speed1: .1,
			speed2: .2,
			repeat: -1,
			yoyo: true
		});
		TweenMax.to(colors.path, speed * 360, {
			h: 360,
			onUpdate: function() {
				TweenMax.set("#waves", { backgroundColor: "hsl(" + colors.path.h + "," + colors.path.s + "%," + colors.path.l * 0.5 + "%)" });
			},
			/*modifiers: {
				h: function(h) {
					if(colors.path.h + 1 >= 360) {
						colors.path.h = 0;
						TweenMax.set("#waves", {backgroundColor: "hsl(" + colors.path.h + "," + colors.path.s + "%," + colors.path.l * 0.5 + "%"});
						TweenMax.set(".wave", {fill: "hsl(" + colors.path.h + "," + colors.path.s + "%," + colors.path.l + "%)"});
						return 0;
					}
					else return colors.path.h + 1;
				}
			},*/
			yoyo: true,
			repeat: -1
		})
		TweenMax.to(colors.path2, speed * 360, {
			h: 360,
			/*modifiers: {
				h: function(h) {
					if(colors.path2.h + 1 >= 360) {
						colors.path2.h = 0;
						TweenMax.set(".wave2", {fill: "hsla(" + colors.path2.h + "," + colors.path2.s + "%," + colors.path2.l + "%, 0.7)"});
						return 0;
					} else return colors.path2.h + 1;
				}
			},*/
			yoyo: true,
			repeat: -1
		})
		TweenMax.to("#waves", speed, {
			backgroundColor: "hsl(" + colors.path.h + "," + colors.path.s + "%," + colors.path.l * 0.5 + "%)",
			repeat: -1
		})
		jQuery(window).resize(function() {
			resizeWaves();
		})
		function setPath() {
			path = "M"
			path2 = "M"
			path += "-10, " + .5 * height;
			path2 += "-10, " + .5 * height;
			var e, t = [], r = [];
			for(e = -1; increments + 2 > e; e++) {
				t[e] = {};
				r[e] = {};
				t[e].x = e * incrementSize;
				r[e].x = e * incrementSize;
				var o = 12 * Math.sin(.14 * e + props.var1)
				,   a = 13 * Math.sin(.2 * e + props.var2) - 9
				,   n = 10 * Math.sin(.15 * e + props.var3) - 10
				,   i = 12 * Math.cos(.25 * e + props.var4) - 3
				,   s = 6  * Math.sin(.21 * e + props.var5) - 5
				,   u = 11 * Math.cos(.17 * e + props.var6) - 7;
				t[e].y = .5 * height + i - s + u,
				r[e].y = .5 * height + o - a + n
			}
			for(e = 0; increments + 2 > e; e++) {
				var h = {};
				h.x = .5 * (t[e-1].x + t[e].x),
				h.y = .5 * (t[e-1].y + t[e].y),
				path += "Q" + t[e-1].x + "," + t[e-1].y + " " + h.x + "," + h.y;
				var c = {};
				c.x = .5 * (t[e-1].x + t[e].x),
				c.y = .5 * (t[e-1].y + t[e].y),
				path2 += "Q" + t[e-1].x + "," + (t[e-1].y + 10) + " " + c.x + "," + (c.y + 10);
			}
			path += "L" + width + ","  + (h.y + ribbonWidth);
			path2 += "L" + width + "," + (c.y + ribbonWidth);
			for(e = increments + 1; e >= 0; e--) {
				var h = {};
				h.x = .5 * (t[e-1].x + t[e].x),
				h.y = .5 * (t[e-1].y + t[e].y),
				path += "Q" + t[e-1].x + "," + (t[e-1].y + ribbonWidth) + " " + h.x + "," + (h.y + ribbonWidth);
				var c = {};
				c.x = .5 * (t[e-1].x + t[e].x),
				c.y = .5 * (t[e-1].y + t[e].y),
				path2 += "Q" + t[e-1].x + "," + (t[e-1].y + 30) + " " + c.x + "," + (c.y + 30);
			}
			
			TweenMax.set(props, {
				var1: "+=" + .8 * speed,
				var2: "+=" + 1.4 * speed,
				var3: "-=" + 1.2 * speed,
				var4: "+=" + .8 * speed,
				var5: "+=" + 1.4 * speed,
				var6: "-=" + 1.3 * speed	
			});

			TweenMax.to(".wave", speed2.speed1, {
				morphSVG: {
					d: path
				},
				fill: "hsl(" + colors.path.h + "," + colors.path.s + "%," + colors.path.l + "%)",
				ease: Power0.easeNone
			});
			TweenMax.to(".wave2", speed2.speed2, {
				morphSVG: {
					d: path2
				},
				fill: "hsla(" + colors.path2.h + "," + colors.path2.s + "%," + colors.path2.l + "%, 0.7)",
				ease: Power0.easeNone
			});
			
			//path.setAttribute("d", d);
		}
		/*function setPath() {
			path = "M"
			path2 = "M"
			path += "-10, " + .5 * height;
			path2 += "-10, " + .5 * height;
			var e, t = [], r = [];
			for(e = -1; increments + 2 > e; e++) {
				t[e] = {};
				r[e] = {};
				t[e].x = e * incrementSize;
				r[e].x = e * incrementSize;
				var o = 12 * Math.cos(.14 * e + props.var1)
				,   a = 13 * Math.sin(.2 * e + props.var2) - 9
				//,   a = 13 * (2 * Math.random()) - 1
				,   n = 10 * Math.cos(.15 * e + props.var3) - 10
				,   i = 12 * Math.cos(.25 * e + props.var4) - 3
				,   s = 6  * Math.sin(.21 * e + props.var5) - 5
				,   u = 11 * Math.cos(.17 * e + props.var6) - 7;
				t[e].y = .5 * height + i - s + u,
				r[e].y = .5 * height + o - a + n
			}
			for(e = 0; increments + 2 > e; e++) {
				var h = {};
				h.x = .5 * (t[e-1].x + t[e].x),
				h.y = .5 * (t[e-1].y + t[e].y),
				path += "Q" + t[e-1].x + "," + t[e-1].y + " " + h.x + "," + h.y;
				var c = {};
				c.x = .5 * (r[e-1].x + r[e].x),
				c.y = .5 * (r[e-1].y + r[e].y),
				path2 += "Q" + r[e-1].x + "," + r[e-1].y + " " + c.x + "," + c.y;
			}
			path += "L" + width + ","  + (h.y + ribbonWidth);
			path2 += "L" + width + "," + (c.y + ribbonWidth);
			for(e = increments + 1; e >= 0; e--) {
				var h = {};
				h.x = .5 * (t[e-1].x + t[e].x),
				h.y = .5 * (t[e-1].y + t[e].y),
				path += "Q" + t[e-1].x + "," + (t[e-1].y + ribbonWidth) + " " + h.x + "," + (h.y + ribbonWidth);
				var c = {};
				c.x = .5 * (r[e-1].x + r[e].x),
				c.y = .5 * (r[e-1].y + r[e].y),
				path2 += "Q" + r[e-1].x + "," + (r[e-1].y + ribbonWidth) + " " + c.x + "," + (c.y + ribbonWidth);
			}
			
			TweenMax.set(props, {
				var1: "+=" + .8 * speed,
				var2: "+=" + 1.4 * speed,
				var3: "-=" + 1.2 * speed,
				var4: "+=" + .8 * speed,
				var5: "+=" + 1.4 * speed,
				var6: "-=" + 1.3 * speed	
			});

			TweenMax.to(".wave", speed2.speed1, {
				morphSVG: {
					d: path
				},
				fill: "hsl(" + colors.path.h + "," + colors.path.s + "%," + colors.path.l + "%)",
				ease: Power0.easeNone
			});
			TweenMax.to(".wave2", speed2.speed2, {
				morphSVG: {
					d: path2
				},
				fill: "hsla(" + colors.path2.h + "," + colors.path2.s + "%," + colors.path2.l + "%, 0.7)",
				ease: Power0.easeNone
			});
			TweenMax.to("#waves", speed2.speed1, {
				backgroundColor: "hsl(" + colors.path.h + "," + colors.path.s + "%," + colors.path.l * 0.5 + "%)"
			})
			//path.setAttribute("d", d);
		}*/

		function resizeWaves() {
			width = jQuery(window).outerWidth(),
		    increments = 800 > width ? 40 : 70,
		    incrementSize = width / increments
		}
		setInterval(setPath, 200)
}