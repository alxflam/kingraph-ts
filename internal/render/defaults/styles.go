package defaults

var DefaultStyles = map[string]map[string]any{
	":edge": {
		"dir":   "none",
		"color": "#cccccc",
	},
	":house": {
		"style":     "filled",
		"labeljust": "l",
		"fontname":  "Helvetica, Arial, sans-serif",
		"fontsize":  16,
		"margin":    10,
	},
	":house-2": {
		"color": "#ffffff",
	},
	":family": {
		"label":  "",
		"style":  "invis",
		"margin": 0,
	},
	":node": {
		"shape":    "box",
		"style":    "filled",
		"fontname": "Helvetica, Arial, sans-serif",
		"width":    2.5,
		"color":    "#cccccc",
	},
	":digraph": {
		"rankdir": "LR",
		"ranksep": 0.4,
		"splines": "ortho",
	},
	":union": {
		"shape":    "circle",
		"style":    "filled",
		"penwidth": 1,
		"label":    "",
		"height":   0.1,
		"width":    0.1,
	},
	":children": {
		"shape":    "box",
		"style":    "filled",
		"label":    "",
		"height":   0.005,
		"penwidth": 0,
		"width":    0.1,
	},
	":parent-link": {
		"weight": 2,
	},
	":parent2-link": {
		"style":    "dashed",
		"penwidth": 1,
		"weight":   1,
	},
	":parent-child-link": {
		"weight": 3,
	},
	":child-link": {
		"dir":       "forward",
		"arrowhead": "tee",
		"arrowsize": 2,
		"weight":    2,
	},
	":child2-link": {
		"style":    "dashed",
		"penwidth": 1,
		"weight":   1,
	},
}

var LightModeDeviations = map[string]map[string]any{
	":house": {
		"color": "#FAFAFA",
	},
	":node": {
		"fillcolor": "white",
	},
}

var DarkModeDeviations = map[string]map[string]any{
	":bgcolor": {
		"bgcolor": "#23272A",
	},
	":house": {
		"color":     "#2C2F33",
		"fontcolor": "white",
	},
	":node": {
		"fillcolor": "#36393F",
		"fontcolor": "white",
	},
	":union": {
		"color": "white",
	},
}
