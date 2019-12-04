int seed = int(random(999997));
ArrayList<Agent> agents;
int num_agents = 20;

void setup() {
  size(2767, 1500);
  generate();
  smooth();
  //pixelDensity(2);
  background(255);
  strokeWeight(2);
}

int counter = 1;
void draw() {

  for (int i = 0; i < agents.size(); i++) {
    agents.get(i).update();
    agents.get(i).show();
  }
  counter += 1;
  fill(255);
  fill(0);
  if(counter == 10000) {
    noLoop();
  }
  if(counter==20 || counter==50 || counter == 100 || counter == 200 || counter == 500) {
    int size = agents.size();
    for (int i=0; i < size; i++) {
      agents.add(new Agent(agents.get(i).x, agents.get(i).y, agents.get(i).s, agents.get(i).dir, agents.get(i).c));
    }
  }
}

void generate() {
  seed = int(random(999999));
  agents = new ArrayList<Agent>();
  noiseSeed(seed);
  randomSeed(seed);

  for (int i = 0; i < num_agents; i++) {
    agents.add(new Agent(width/2, height/2, 2, random(TWO_PI), rcol()));
  }
}


class Agent {
  float x, y, s, r;
  float dir;
  float vel, size_vel;
  color c;
  float split_prob = 0.01;
  Agent(float x, float y, float s, float d, color c) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.r = s;
    this.dir = d;
    this.c = c;

    vel = 1;

    size_vel = 1;
  }

  void update() {
    float dist = sqrt(pow((x-width/2),2)+pow((y-height/2),2));
    float drift = 0.005-0.006*dist/( height/2);
    if (dist>height/2) { drift = 0;}
    dir+=random(-0.04,0.04+drift);
    x += cos(dir)*vel;
    y += sin(dir)*vel;
    r*=size_vel;
    /*split_prob = 0.3/pow(sqrt(pow((x-width/2),2)+pow((y-height/2),2)),1.5);
    if(random(0,1)<split_prob) {
      agents.add(new Agent(x, y, r, dir));
    }
    */
  }

  void show() {
    noStroke();
    fill(c, 180);
    ellipse(x, y, r, r);
  }
}

int[] colors = {#2D2615, #19647E, #28AFB0, #F4D35E, #EE964B, #000000} ;
int rcol() {
  int index = int(random(0,colors.length));
  print(index);
  return colors[index];
}
