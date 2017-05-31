// Represents an animation parameter (position, color, speed, ...)
var Parameter = function (name, minValue, maxValue, step, FPS) {
	this.name = name;
	this.minValue = minValue;
	this.maxValue = maxValue;
	this.step = step;
	this.FPS = FPS;

	this.timeAcc = 0;
	this.curOutput = null;
	
	// Scales input value ([0;1]) into [minValue;maxValue].
	this.scale = function (input, timeElapsed) {
		if (this.timeAcc / 1000.0 > 1.0 / this.FPS || this.curOutput == null) {
			this.curOutput = Math.round((input * (this.maxValue - this.minValue) + this.minValue) / step) * step;
			this.timeAcc = 0;
		} else {
			this.timeAcc += timeElapsed;
		}
		return this.curOutput;
	}
}

// Represents a mapping from input features to animation parameters.
var ParamMapping = function(size, params, map) {
	this.size = 0;
	this.params = null;
	this.map = null;

	// Loads parameters from AJAX.
	this.load = function (filePath) {
		var size = 0;
		var params = null;
		var map = null;
	    $.ajax({
	      url: filePath,
	      dataType: 'json',
	      async: false,
	      success: function(data) {
	        console.log("Animation parameters successfully loaded");
		    size = data['parameters'].length;
		    params = [];
		    map = [];
		    for (i = 0; i < size; i++) {
		    	params.push(new Parameter(
		    		data['parameters'][i]['name'],
		    		data['parameters'][i]['min'],
		    		data['parameters'][i]['max'],
		    		data['parameters'][i]['step'],
		    		data['parameters'][i]['FPS'])
		    	);
		    	map.push(i);
		    }
	      }
	    });
	    this.size = size;
	    this.params = params;
	    this.map = map;
	}

	this.randomize = function () {
		// Uses Fisher–Yates shuffle
		var currentIndex = this.map.length;
		while (currentIndex > 0) {
			var randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			var tmp = this.map[currentIndex];
			this.map[currentIndex] = this.map[randomIndex];
			this.map[randomIndex] = tmp;
		}
	}

	// Given some input features, provides a suitable mapping for the animation parameters.
	this.doMap = function (features, timeElapsed) {
		var parameters = [];
		if (features.length !== this.size) {
			console.log("Warning: features vector size and number of animation parameters are different.");
		}
		var parameters = {};
		for (var i = 0; i < this.size; i++) {
			parameters[this.params[i].name] = this.params[i].scale(features[this.map[i]], timeElapsed);
		}
		return parameters;
	}
}