PImage img;


void setup() {
  img = loadImage("/assets/images/car.jpg");

  size(1224, 816);
  background(255);
  //image(img, 0, 0, width, height);
  noStroke();
  noisee(5,0,0,width,height);
}

float counter = 0;
float brushSize = 100;

void draw() {
  int x = int(random(width));
  int y = int(random(height));
  color pix = img.get(x*4,y*4);
  fill(pix, 128);
  ellipse(x, y, brushSize, brushSize);

  if (counter%1000 == 0 && counter !=0) {
    brushSize = brushSize*0.8;
  }
  counter = counter + 1;
  if (counter%21000==0 && counter !=0) {
    noisee(5,0,0,width,height);
    noLoop();
  }
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
