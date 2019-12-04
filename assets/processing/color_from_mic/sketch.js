function preload(){
  data = loadTable(
  '/assets/processing/color_from_mic/CIE_table.csv',
	'csv',
	'header');
}

smoothing = 0.6;
bins = 1024;
num_points = 1024.0;

var highest_frequency = 2000.0; // highest frequency that will be included in the color mapping, in Hz
var lowest_frequency = 80.0;
var highest_wl=720;
var lowest_wl =380;

function setup() {
  mic = new p5.AudioIn();
  mic.start();
  var cnv = createCanvas(displayWidth, displayHeight);
  cnv.parent(document.getElementById('markdown'));
  background(0,0,0);
  fft = new p5.FFT(smoothing,bins); // first number is smoothing (0-1), 2nd number is bins (power of two between 16 and 1024)
  fft.setInput(mic);
  frameRate(60);
  isRecording = 1;

}

var weights = new Array(num_points).fill(0);

function get_energies(starting_frequency, ending_frequency, num_buckets) {
	var frequencies = [];
	var amplitudes = [];

	// setting up functions to generate logarithmically spaced buckets
	var b = Math.log(ending_frequency/starting_frequency)/num_buckets;
  var a = starting_frequency;
  fft.analyze();
  // loop through all buckets and get energies for them
	for (var i=0; i < num_buckets; i++) {
		var low = a*Math.exp(b*i); // lower frequency band for getting energy
  	var high = a*Math.exp(b*(i+1)); // upper frequency band for getting energy
  	frequencies[i] = low;
  	amplitudes[i] = fft.getEnergy(low,high);
	}
	return [frequencies, amplitudes];

}

function frequencies2WaveLengths(lower_freq, upper_freq, lower_wl, upper_wl, frequencies) {
	var wavelengths = [];
	var log_upper_freq = Math.log(upper_freq);
	var log_lower_freq = Math.log(lower_freq);

	for (var i=0; i < frequencies.length; i++) {
		wavelengths[i] = lower_wl + (upper_wl-lower_wl) * (log_upper_freq - Math.log(frequencies[i]))/(log_upper_freq - log_lower_freq);
	}
	return wavelengths;
}

function draw() {
  // background(0);
  // calculating frequencies and brightnesses
  
  var wavelengths = []
  var ss_learning_speed = 0.05;

  if(frameCount%6==1) {

  	var frequencies = [];
  	var amplitudes = [];
  	[frequencies, amplitudes] = get_energies(lowest_frequency, highest_frequency, num_points);

	var log_highEnd = Math.log(highest_frequency);
	var log_lowEnd = Math.log(lowest_frequency);
	var wavelengths = frequencies2WaveLengths(lowest_frequency, highest_frequency, lowest_wl, highest_wl, frequencies);
	console.log(wavelengths);
	if(frameCount<2000) {
		learning_speed=0.4;
	} else { 
			learning_speed=ss_learning_speed;
	}

  	for (var i=0; i < num_points; i++) {

  	  if(amplitudes[i] < weights[i]) { weights[i] = weights[i]-learning_speed } else { weights[i] = weights[i] + learning_speed};
  	  amplitudes[i] = amplitudes[i] - weights[i];

    }

    background(0);

    // for (var i=0; i < num_points; i++) {
    // 	if( wavelengths[i] > 300 && wavelengths[i] < 390) { amplitudes[i] = 200;}
    // 	else {amplitudes[i] = 0;}
    // }

	rgb = spectrum_to_color(data, wavelengths, amplitudes);
	background(rgb[0], rgb[1], rgb[2]);

	var hex = rgbToHex(rgb[0], rgb[1], rgb[2])
	fill(255);
	textAlign(LEFT,BOTTOM);
	textSize(20);
	text(hex, displayWidth*0.01, displayHeight*0.8)

  }

  draw_curves(wavelengths,amplitudes);

}

function spectrum_to_color(data, wavelengths, amplitudes) {
	var CIE = {};
	var CIE_wl = data.getColumn("Wavelength");
	var CIE_wl_int = [];
	var CIE_x = data.getColumn("x");
	var CIE_y = data.getColumn("y");
	var CIE_z = data.getColumn("z");
	var total_y = 0;
	for(var i = 0; i < CIE_wl.length; i++) {
	  CIE[CIE_wl[i]] = {x: CIE_x[i], y: CIE_y[i], z: CIE_z[i]};
	  CIE_wl_int[i] = int(CIE_wl[i]);
	  total_y += float(CIE_y[i]);
	}
	// interpolate 
	var total = [0,0,0];
	total_y = total_y;
	for(var i = 0; i < wavelengths.length; i++) {
		var current_wl = wavelengths[i];
		var low_wl = CIE_wl_int.find(function(element) {
			return element > current_wl;
		}) - 5 ;
		var lowerCIE = CIE[low_wl];
		var upperCIE = CIE[low_wl+5];
		var weight = (current_wl - low_wl)/5;
		total[0] += amplitudes[i]/255.0*(lowerCIE.x*(1-weight) + upperCIE.x * weight)/total_y;
		total[1] += amplitudes[i]/255.0*(lowerCIE.y*(1-weight) + upperCIE.y * weight)/total_y;
		total[2] += amplitudes[i]/255.0*(lowerCIE.z*(1-weight) + upperCIE.z * weight)/total_y;
	}
	var sum_total = total[1];
	total[0] = total[0]/sum_total;
	total[1] = total[1]/sum_total;
	total[2] = total[2]/sum_total;
	var rgb = [];
	//console.log("totas",total);
  // D50 non Bradford-adapted D50 matrix
	//rgb[0] = int( 255 * ( 3.1338561 * total[0] - 1.6168667 * total[1] - 0.4906146 * total[2] ) );
	//rgb[1] = int( 255 * (-0.9787684 * total[0] + 1.9161415 * total[1] + 0.0334540 * total[2] ) );
	//rgb[2] = int( 255 * ( 0.0719453 * total[0] - 0.2289914 * total[1] + 1.4052427 * total[2] ) );


  // xyz to RGB D65 matrix conversion (assuming CIE 1964 was using D64)
	rgb[0] = int( 255 * ( 3.2404542 * total[0] - 1.5371385 * total[1] -0.4985314 * total[2] ) );
  rgb[1] = int( 255 * (-0.9692660 * total[0] + 1.8760108 * total[1] + 0.0415560 * total[2] ) );
	rgb[2] = int( 255 * ( 0.0556434 * total[0] - 0.2040259 * total[1] + 1.0572252  * total[2] ) );
	

	if(min(rgb)<0) {
		var min_rgb = min(rgb);
		rgb[0] += -min_rgb;
		rgb[1] += -min_rgb;
		rgb[2] += -min_rgb;
	}
	if(max(rgb)>255) {
		var max_rgb = max(rgb)/255;
		rgb[0] = int(rgb[0]/max_rgb);
		rgb[1] = int(rgb[1]/max_rgb);
		rgb[2] = int(rgb[2]/max_rgb);
	}
	console.log("rgb",rgb);
	return rgb;
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function draw_curves(wavelengths, amplitudes) {
    fill(255,255,255,50);
  	stroke(0);
  	beginShape();
  	hor_max = highest_wl;
  	hor_min = lowest_wl;
  	ver_max = 500;
  	ver_min = 0;	

  	for (var i = 0; i < wavelengths.length; i++) {
    	vertex(map(wavelengths[i], hor_max,hor_min,0,width), map(amplitudes[i], ver_min, ver_max, height, 0));
  	}
  	vertex(width,height);
  	vertex(0,height);
  	endShape();
  	noStroke();
}

function mouseClicked() {
  if(mouseX>0 && mouseY>0 && mouseX<width && mouseY<height) {
    draw();
	  if ( isRecording==1 ) { // .isPlaying() returns a boolean
	    mic.stop();
	    noLoop();
	    isRecording=0;
	  } else {
	    mic.start();
	    loop();
	    isRecording=1;
	  }
	}
}

