function setup() {
  var cnv = createCanvas(displayWidth, displayHeight);
  cnv.parent(document.getElementById('markdown'));
  smooth();
  pixelDensity(4);
  noStroke();
}

function draw() {

  // this part is for making the canvas rotate 90 degrees in case the screen is vertical (e.g. mobile)
  if(displayWidth<displayHeight) {
    canvas_height = displayWidth;
    canvas_width = displayHeight;
    rotate(HALF_PI);
    translate(0,-displayWidth);
  } else {
    canvas_height = displayHeight;
    canvas_width = displayWidth;
  }

  // this part sets how many circles will be generate and how big they will be
  fill(0);
  let num_circles = random(5,20);
  let diameter_diff = (canvas_height*0.75)/num_circles;
  let diameter = canvas_height*0.8;

  // generates circles in decreasing order
  for (var i = 0; i <=num_circles; i++) {
    fill(rcol());
    ellipse(canvas_width/2,canvas_height/2, diameter,diameter);
    
    if (random()<0.5) { // 50% change of generating a half circle on top of the previous one
      fill(rcol());
      arc(canvas_width/2,canvas_height/2, diameter,diameter,PI/2,3*PI/2);
    }
    diameter -=diameter_diff;
  }

  // the matchstick
  fill('#232224')
  rect(canvas_width/2-5, canvas_height/2-10, 10, canvas_height/2+10);

  // generates noise to add texture to the picture
  noisee(10, 0, 0, canvas_width, canvas_height);


  function noisee(n, x, y, w, h) {
    x1 = constrain(x, 0, canvas_width);
    x2 = constrain(x+w, 0, canvas_width);
    y1 = constrain(y, 0, canvas_height);
    y2 = constrain(y+h, 0, canvas_height);
    loadPixels();
    for (j = 0; j < pixels.length; j+=4) {
      pixels[j] = pixels[j]+random(-n, n);
      pixels[j + 1] = pixels[j+1]+random(-n, n);
      pixels[j + 2] = pixels[j+2]+random(-n, n);
      pixels[j + 3] = pixels[j+3]+random(-n, n);
    }
    updatePixels();
  }

  variable_grainsize(1, 4);
  variable_grainsize(2, 4);

  noLoop();

}

// color array and function to return a random one from the array
hilma_colors = ['#f5f2e6','#040204','#306dc9','#D1AE45','#b53012'];
function rcol() {
  index = int(random(0,hilma_colors.length));
  print(index);
  return color(hilma_colors[index]);
}


// function to add noise at an arbitrary grain size 
// i.e. not just at the pixel level, but also at higher levels if wanted
function variable_grainsize(grain_size,amount) {
  let d = pixelDensity()*grain_size;
  adjusted_width = canvas_width/grain_size;
  adjusted_height = canvas_height/grain_size;

  loadPixels();
  for (let x_coord = 0; x_coord < adjusted_width; x_coord++) {
    for (let y_coord = 0; y_coord < adjusted_height; y_coord++) {
      b_r = random(-amount,amount);
      b_g = random(-amount,amount);
      b_b = random(-amount,amount);
      b_a = 0;
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          // loop over
          index = 4 * ((y_coord * d + j) * width * d + (x_coord * d + i));
          pixels[index] = pixels[index]+b_r;
          pixels[index+1] = pixels[index+1]+b_g;
          pixels[index+2] = pixels[index+2]+b_b;
          pixels[index+3] = pixels[index+3]+b_a;
        }
      }
    }
  }
  updatePixels();
}

function mouseClicked() {
  if(mouseX>0 && mouseY>0 && mouseX<width && mouseY<height) {
    draw();
  }
}