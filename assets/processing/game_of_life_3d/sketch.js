let w;
let columns;
let rows;
let running = true;
let num_layers = 5; // 3 color layers plus one boundary layer at the top and bottom
let remain_living = [ 4, 4 ]; // sets for which number of neighbours cells will remain alive
let become_alive = [ 4, 4 ]; // sets for which number of neighbours cells will become alive if dead
let ints = [5,7,9];

function setup() {
  middle_int = random(ints);
  var cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.getElementById('markdown'));
  w = random(5,50);
  c_size = w;
  distance_between_circles = c_size*4/7;
  pixelDensity(4);
  
  offset_config = floor(random(3));
  x_offset_configs = [[0,0,0],[0, distance_between_circles, distance_between_circles / 2 ],[0, w, 2*w]];
  y_offset_configs = [[0,0,0],[0, 0, 0.866 * distance_between_circles ],[0, w, 2*w]] ;
  x_offsets = x_offset_configs[offset_config];
  y_offsets = y_offset_configs[offset_config];


  colors = [color(0, 0, 255), color(0, 255, 0), color( 255, 0, 0)];

  // Calculate columns and rows
  columns   = ceil(width / w) + 4;
  rows      = ceil(height / w) + 4;
  universe  = new Universe(columns, rows, colors, x_offsets, y_offsets);
  frameRate(5);
  noStroke();
  strokeWeight(0);
}

function draw() {
  blendMode(BLEND);
  background(255);
  blendMode(DIFFERENCE);
  universe.generate();
  universe.draw_universe();
}

// reset board when mouse is pressed
function mousePressed() {
  if (running) {
    noLoop();
    running = false;
  } else if (!running) {
    loop();
    running = true;
  }
}

function keyTyped() {
	if(key==='r') {
		setup();
  }
  if (key === 's') {
		save('game_of_life.jpg'); 
	}
}



// Fill board randomly
class Universe {
	constructor(uni_width, uni_height, colors, offset_x, offset_y) {
    this.columns = uni_width;
    this.rows = uni_height;
    this.colors = colors;
    this.offset_x = offset_x;
    this.offset_y = offset_y;

    // Wacky way to make a 3D array in JS
    this.layers = new Array(num_layers);
    for (let i = 0; i < num_layers; i++) {
      this.layers[i] = new Array(this.columns);
      for (let j = 0; j < this.columns; j++) {
        this.layers[i][j] = new Array(this.rows);
      }
    }

    // Going to use multiple 3D arrays and swap them
    this.next = new Array(num_layers);
    for (let i = 0; i < num_layers; i++) {
      this.next[i] = new Array(this.columns);
      for (let j = 0; j < this.columns; j++) {
        this.next[i][j] = new Array(this.rows);
      }
    }
    for(let k = 0; k < num_layers; k++) {
      for (let i = 0; i < this.columns; i++) {
        for (let j = 0; j < this.rows; j++) {
          // Lining the edges with 0s
          if (k == 0 || i == 0 || j == 0 || i == this.columns-1 || j == this.rows-1 || k == num_layers-1) this.layers[k][i][j] = 0;
          // Filling the rest randomly
          else if ( 
              i < (floor(middle_int/2) * columns / middle_int) || 
              i > (ceil(middle_int/2) * columns / middle_int) || 
              j < (floor(middle_int/2) * rows / middle_int) || 
              j > (ceil(middle_int/2) * rows / middle_int)
              ) {
                  this.layers[k][i][j] = 0;
              }
          else this.layers[k][i][j] = floor(random(2));
          this.next[k][i][j] = 0;
        }
      }
    }
  }

// The process of creating the new generation
  generate() {
    // Loop through every spot in our 3D array and check spots neighbors
    // avoids the first and last rows and columns and z to preserve an edge to the universe
    for (let z = 1; z < num_layers -1; z++) {
      for (let x = 1; x < this.columns - 1; x++) {
        for (let y = 1; y < this.rows - 1; y++) {
          // Add up all the states in a 3x3x3 surrounding grid
          let neighbors = 0;
          for (let k = -1; k <= 1; k++) {
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                neighbors += this.layers[z+k][x+i][y+j];
              }
            }
          }

          // A little trick to subtract the current cell's state since
          // we added it in the above loop
          neighbors -= this.layers[z][x][y];
          // Rules of Life
          if      ((this.layers[z][x][y] == 1) && (neighbors == remain_living[0] || neighbors == remain_living[1])) this.next[z][x][y] = 1; // remain alive
          else if ((this.layers[z][x][y] == 0) && (neighbors ==  become_alive[0] || neighbors ==  become_alive[1])) this.next[z][x][y] = 1; // become alive
          else this.next[z][x][y] = 0;           // death by under or over population
        }
      }
    }

    // Swap!
    let temp = this.layers;
    this.layers = this.next;
    this.next = temp;
  }
  draw_universe() {
    for ( let k = 1; k < num_layers - 1; k++) {
      fill(this.colors[k-1]);
      for ( let i = 0; i < this.columns;i++) {
        for ( let j = 0; j < this.rows;j++) {
          if ((this.layers[k][i][j] == 1)) {
            ellipse(i * w - w + this.offset_x[k-1], j * w - w + this.offset_y[k-1], c_size-1, c_size-1);
            //ect(i * w - w + this.offset_x[k-1], j * w - w + this.offset_y[k-1], c_size, c_size);
          }
        }
      }
    }
  }

}
