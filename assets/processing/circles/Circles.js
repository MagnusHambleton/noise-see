//seed = int(random(999996));
num_circles = 90; 
num_lines = 30; 
opacity = 200;
density = 4;
function setup() {
  var cnv = createCanvas(1660, 960);
  cnv.parent(document.getElementById('markdown'));
  smooth();
  pixelDensity(density);
  background('#FFFCF9');
  strokeWeight(2);
}

counter = 1;
function draw() {
  background('#FFFCF9');
  for (i = 0; i < num_circles; i++) {
    size = int(random(1,20));
    noStroke();
    fillColor = rcol();
    fillColor.setAlpha(opacity);
    fill(fillColor);
    ellipse(int(random(0,width)),int(random(0,height)), size*size, size*size);
  }
  for (i = 0; i < num_lines; i++) {
    size = int(random(5,30));
    strokeWeight(random(0,10));
    noFill();
    strokeCap(PROJECT);
    strokeColor = rcol();
    strokeColor.setAlpha(opacity);
    stroke(strokeColor);
    start = random(0,TWO_PI);
    arc_length = random(0,3*PI/2);
    arc(int(random(0,width)),int(random(0,height)), size*size, size*size, start, start+arc_length);
  }
  console.log(width);
  console.log(height);
  noisee(10, 0, 0, width, height);


  function noisee(n, x, y, w, h) {
    x1 = constrain(x, 0, width);
    x2 = constrain(x+w, 0, width);
    y1 = constrain(y, 0, height);
    y2 = constrain(y+h, 0, height);
    // for (j = y1; j < y2; j+=0.25) {  
    //   for (i = x1; i < x2; i+=0.25) {
    //     let col = get(i, j);
    //     b = random(-n, n);
    //     col = color(red(col)+b, green(col)+b, blue(col)+b);
    //     set(i, j, col);
    //   }
    // }
    loadPixels();
    let d = pixelDensity();
    for (yj = y1; yj < y2; yj++) {  
      for (xi = x1; xi < x2; xi++) {
        for (let i = 0; i < d; i++) {
          for (let j = 0; j < d; j++) {
            // loop over
            b = random(-n, n);
            index = 4 * ((yj * d + j) * width * d + (xi * d + i));
            pixels[index] += b;
            pixels[index+1] += b;
            pixels[index+2] += b;
            pixels[index+3] += b;
          }
        }
      }
    }
    updatePixels();
    console.lot('finished');
  }
  noLoop();

}

function mouseClicked() {
  if(mouseX>0 && mouseY>0 && mouseX<width && mouseY<height) {
    draw();
  }
}


colors = ['#2F1847', '#FF6978', '#475841', '#53DD6C', '#3F403F', '#000000','#FFFCF9'] ;
//old colors = ['#2D2615', '#19647E', '#28AFB0', '#F4D35E', '#EE964B', '#000000'] ;
function rcol() {
  index = int(random(0,colors.length));
  print(index);
  return color(colors[index]);
}
