PImage img;


void setup() {
  img = loadImage("../me.jpg");
  pixelDensity(2);
  size(1632,2448);
  blendMode(SUBTRACT);
  background(255);
  //image(img, 0, 0, widh, height);
  noStroke();
  noisee(5,0,0,width,height);
  //frameRate(1000);
}

float counter = 0;
float brushSize = 40;

void draw() {
  int x = int(random(width));
  int y = int(random(height));
  color pix = img.get(x*2,y*2);
  float[] rgb = { red(pix), green(pix), blue(pix)};
  float[] cmy = {1-rgb[0]/255, 1-rgb[1]/255, 1-rgb[2]/255};
  //print("rgb:",rgb[0], rgb[1], rgb[2]);
  //println();
  //print("cmy:",cmy[0], cmy[1], cmy[2]);
  //println();
  int rand = int(random(0,3));
  float weight = 0;
  for(int i = 0; i < 3; i++) {
    if(rand != i) { 
      cmy[i]=0;
      rgb[i]=0;
    }
    else { 
      weight = 1-rgb[i]/255;
      cmy[i] = 1;
      rgb[i] = 255;
    }
  }
  float r = (1-cmy[0])*255;
  float g = (1-cmy[1])*255;
  float b = (1-cmy[2])*255;
  //print(r,g,b);
  //println();
  //noLoop();
  fill(rgb[0], rgb[1], rgb[2], 200);
  //if(counter==200){noLoop();}
  ellipse(x, y, brushSize*weight, brushSize*weight);

  if (counter%1000 == 0 && counter !=0) {
    brushSize = brushSize;
  }
  counter = counter + 1;
  //if (counter%21000==0 && counter !=0) {
   // noisee(5,0,0,width,height);
   // noLoop();
  //}
}

boolean running = true;

void keyPressed() {
  //if(key == 's') saveImage();
  
  if(running) {
    noLoop();
    running = false;
  } else {
    loop();
    running = true;
  }
}

void saveImage() {
  String name = "socks"+nf(day(), 2)+nf(hour(), 2)+nf(minute(), 2)+nf(second(), 2);
  saveFrame(name+".png");
}

void noisee(int n, int x, int y, int w, int h) {
  int x1 = constrain(x, 0, width);
  int x2 = constrain(x+w, 0, width);
  int y1 = constrain(y, 0, height);
  int y2 = constrain(y+h, 0, height);
  for (int j = y1; j < y2; j++) {  
    for (int i = x1; i < x2; i++) {
      color col = get(i, j);
      float b = random(-n, n);
      col = color(red(col)+b, green(col)+b, blue(col)+b);
      set(i, j, col);
    }
  }
}
