function preload(){
	//song = loadSound('assets/SwimGoodxMerival_SinceUAsked.wav');
	data = loadTable(
	'/assets/processing/gazer_mvp/CIE_table.csv',
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
	createCanvas(windowWidth, windowHeight);
	background(255);
	fft = new p5.FFT(smoothing,bins); // first number is smoothing (0-1), 2nd number is bins (power of two between 16 and 1024)
	fft.setInput(mic);
	//song.play();
	frameRate(60);
	isRecording = 1;
	webgazer.begin()
	click_counter = 0;
	position = [width/2, height/2];
	avg_x = position[0];
	avg_y = position[1];
	context = getAudioContext();

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

// **** simulation constants ******

avg_over = 10; // number of positions to average eye tracking predictions over
required_calibration_clicks = 10; // number of calibration clicks before drawing starts
velocity = 0.05; // speed which dot movest towards eye tracking place
ss_learning_speed = 0.05;
drawing_point_size = 10; // size of ellipse

// intro text
s = "1. Make sure that your face is positioned inside the green box in the top left and that the green face outline finds your face \n";
s = s + "2. Calibrate the eye tracker by following the mouse with your eyes and click near the edge of each side of the screen, ";
s = s + "ten times in total \n";
s = s + "3. Once you have done this, the paintbrush will move in the direction of where you are looking and the colour and paintbrush size";
s = s + "will be controled by your voice. No mouse needed.\n";
s = s + "4. If you don't feel the eye tracking model is being accurate, refresh the page and try to calibrate it again more carefully. "; 
s = s + "Avoiding clicking after calibration can also help.\n \n";
s = s + "Press any key to pause and press the 's' key to save a snapshot of your creation."

// initialise variables
counter = 0;
last_x = [];
last_y = [];
wavelengths = [];
rgb=[0,0,0];

function draw() {
	// background(0);
	// calculating frequencies and brightnesses
	//background(200);
	if(click_counter < required_calibration_clicks) {
		fill(255);
		noStroke();
		rect(width-150,0, 150, 50);
		fill(0);
		textSize(32);
		text(click_counter,width-100, 30);
		stroke(0);
		fill(255);
		rect(width/4,2*height/3-50,width/2,height/3);
		noStroke();
		fill(0);
		textSize(16);
		text(s,width/4+10,2*height/3-50+10,width/2-20,height/3-20)
		starting_for_first_time = true;
	}


  if(frameCount%20==1 && click_counter >= required_calibration_clicks) {

		if(starting_for_first_time) {
			background(255);
			starting_for_first_time = false;
		}

		context.resume();
	  	var prediction = webgazer.getCurrentPrediction();
		if (prediction) {
		    var eyex = prediction.x;
		    var eyey = prediction.y;
		}
		last_x[counter] = eyex;
		last_y[counter] = eyey;
		sum_x=0;
		sum_y=0;
		for(var i=0; i<last_x.length; i++) {
			sum_x += last_x[i];
			sum_y += last_y[i];
		}
		avg_x = sum_x/avg_over;
		avg_y = sum_y/avg_over;
		//console.log(avg_x, avg_y);

		// incements or resets the counter to the number to average over each time
		counter += 1;
		if(counter>avg_over) {counter = 0;}
	}

	if(frameCount%2==1 && click_counter >= required_calibration_clicks) {

		var frequencies = [];
  		var amplitudes = [];
  		[frequencies, amplitudes] = get_energies(lowest_frequency, highest_frequency, num_points);

		loudness = max(amplitudes);
		drawing_point_size = loudness/3;
		console.log(loudness);

		var log_highEnd = Math.log(highest_frequency);
		var log_lowEnd = Math.log(lowest_frequency);
		var wavelengths = frequencies2WaveLengths(lowest_frequency, highest_frequency, lowest_wl, highest_wl, frequencies);

		// tries to use the first 2000 frames to "learn" the ambient sound level and adjust for it
		// after 20000 frames, it uses the predefined learning factor
		if(frameCount<2000) {
			learning_speed=0.4;
		} else { 
			learning_speed=ss_learning_speed;
		}

		// removes the time average for each of the frequencies (e.g. to remove/adjust for a persistent background noise)
		for (var i=0; i < num_points; i++) {

			if(amplitudes[i] < weights[i]) { weights[i] = weights[i]-learning_speed } else { weights[i] = weights[i] + learning_speed};
			amplitudes[i] = amplitudes[i] - weights[i];

		}

		rgb = spectrum_to_color(data, wavelengths, amplitudes);
		//console.log(rgb);

		// draw sound spectrum at the bottom
		fill(255);
		rect(0,height-200,width,200);
		draw_curves(wavelengths,amplitudes);

	}

	if(!starting_for_first_time || click_counter ==9) {
		diff_vector = [(avg_x-position[0])*velocity, (avg_y-position[1])*velocity];
		position = [position[0]+diff_vector[0], position[1]+diff_vector[1]];
		fill(rgb[0],rgb[1],rgb[2]);
		ellipse(position[0],position[1],drawing_point_size,drawing_point_size);
	}

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
	// interpolate for wavelengths that end up between onces that are in the CIE table
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
	rgb[0] = int( 255 * ( 3.2404542 * total[0] - 1.5371385 * total[1] - 0.4985314 * total[2] ) );
  	rgb[1] = int( 255 * (-0.9692660 * total[0] + 1.8760108 * total[1] + 0.0415560 * total[2] ) );
	rgb[2] = int( 255 * ( 0.0556434 * total[0] - 0.2040259 * total[1] + 1.0572252 * total[2] ) );
	
	// normalizing the resulting RGB colour so it ends up being visualizable
	// by removing negatives or values above 255 in a sensible way
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
    	vertex(map(wavelengths[i], hor_max,hor_min,0,width), map(amplitudes[i], ver_min, ver_max, height, height-200));
  	}
  	vertex(width,height);
  	vertex(0,height);
  	endShape();
  	noStroke();
}

function keyPressed() {
	if ( isRecording==1 ) { 
		mic.stop();
		noLoop();
		isRecording=0;
	} else {
		mic.start();
		loop();
		isRecording=1;
	}
	if (key === 's') {
		save('gazer.jpg'); 
	}
	// if ( song.isPlaying() ) { // .isPlaying() returns a boolean
	//   song.pause();
	//   noLoop();
	// } else {
	//   song.play();
	//   loop();
	// }
}

function mousePressed() {
	click_counter += 1;

}