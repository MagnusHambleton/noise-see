float[] lines;

void setup() {
  size(1500,1000);
  background(255);
  strokeWeight(0.5);
  lines = new float[40];
  for (int i = 0; i < lines.length; i++) {
    lines[i] = pow(random(0,10),3);
  }
}

int counter = 0;
boolean black=false;
float xPos;
float yPos;


int[][] colours = {{255, 255, 255}, {191,36,36}};

void draw() {
  float x1 = width/2.0;
  float y1 = height*3/4.0;
  float r1 = 0.35/1.5*width;
  
  float x2 = float(width)/2.0;
  float y2 = 1/4.0*height;
  float r2 = 0.35/1.5*width;
  
  float pupilX1 = 720.0/1500.0*width;
  float pupilY1 = height/2.0;
  float pupilR1 = 0.05*height;
  
  float pupilX2 = 780.0/1500.0*width;
  float pupilY2 = height/2.0;
  float pupilR2 = 0.05*height;
  
  if ((counter%50 == 0 && black) || counter%300 == 0) {
    black=!black;
  }
  if (black) {
    noFill();
    stroke(0);
  }  else {
    int[] colour = colours[int(random(0,2))];
    stroke(random(0,255), random(0,255), random(0,255));
  }
  /*if (counter%4000 == 0 && counter != 0) {
    r2 = 450;
    r1 = 450;
    y1 = 850;
    y2 = 150;
  } */

  for (int i = 0; i < lines.length; i++) {
    xPos = random(0,width);
    yPos = random(0,height);
    float distance1 = sqrt(pow(xPos-x1,2)+pow(yPos-y1,2));
    float distance2 = sqrt(pow(xPos-x2,2)+pow(yPos-y2,2));
    
    float distancePupil1 = sqrt(pow(xPos-pupilX1,2)+pow(yPos-pupilY1,2));
    float distancePupil2 = sqrt(pow(xPos-pupilX2,2)+pow(yPos-pupilY2,2));
    
    boolean inside1 = distance1<r1;
    boolean inside2 = distance2<r2;
    
    boolean insidePupil1 = distancePupil1<pupilR1;
    boolean insidePupil2 = distancePupil2<pupilR2;
    
    boolean crossing1 = distance1-lines[i]/2<r1;
    boolean crossing2 = distance2-lines[i]/2<r2;
    
    boolean crossingPupil1 = distancePupil1-lines[i]/2 < pupilR1;
    boolean crossingPupil2 = distancePupil2-lines[i]/2 < pupilR2;
    
    boolean eye = ((inside1 && crossing2) || (inside2 && crossing1)) && !(crossingPupil1 && crossingPupil2);
    if (black) {
      if (eye && (random(0,1)<0.95)) {
      
      } else {
        ellipse(xPos, yPos, lines[i], lines[i]);
      }
    }
    if (!black) {
      if (eye && (random(0,1)<0.95)) {
        ellipse(xPos, yPos, lines[i], lines[i]);
      } else {
        
      }
    }
  }
  counter = counter+1;
  if (counter > 10000) {
    noLoop();
  }
}
