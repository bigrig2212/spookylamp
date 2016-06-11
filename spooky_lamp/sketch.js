var vivarium_bg;
var backgroundcolor = 'black';
var bugimg;
var lamp1 = []; //store the vertices for our polygon lamps
var lamp2 = [];
var lamp1_center;
var lamp2_center;
var creatures = []; //array to hold creatures
var maxspeedSlider;
var separationSlider;
var maxforceSlider;
var bump_sound;
var soundon = 'off';
var vampfont;
var soundtrack;
var cage;
var cagestartx = 170;
var cagestarty = 110;
var cagerotationcounter = 0;
var cagereverse = false;
var xoff = 0.0;

function preload() {
  bugimg = loadImage("assets/moth.png"); 
  vivarium_bg = loadImage("assets/lights.jpg");
  cageimg = loadImage("assets/cage.png");
  bump_sound = loadSound('assets/buzz.mp3');
  soundtrack = loadSound('assets/spooky2.mp3');
  doorsound = loadSound('assets/door2.mp3');
  vampfont = loadFont('assets/Buffied.ttf');
}

function setup() {
  var canvas = createCanvas(1246, 502); //size of kadenze window
  canvas.parent('canvas');
  canvas.mouseClicked(addCreature); //when mouse clicked, add creature, see: http://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element
  
  soundtrack.loop();
  
  textFont(vampfont);
  fill('white');
  textSize(60);
  
  maxspeedSlider   = createSlider(0, 255, 78).parent('maxspeed');
  separationSlider = createSlider(0, 255, 72).parent('separation');
  maxforceSlider  = createSlider(0, 1, 1, 0.1).parent('maxforce');
  soundRadio = createRadio().parent('sound');
  soundRadio.option('on');
  soundRadio.option('off');
  
  background(backgroundcolor);
  //creatures[0] = new Bug(width / 2, height/2);
  
  //lamp 1
  lamp1[0] = createVector(606,101);     // draw shape of lamp
  lamp1[1] = createVector(669,88);
  lamp1[2] = createVector(772,95);
  lamp1[3] = createVector(803,113);
  lamp1[4] = createVector(769,146);
  lamp1[5] = createVector(745,266);
  lamp1[6] = createVector(650,263);
  
  //lamp 2
  lamp2[0] = createVector(836,126);     
  lamp2[1] = createVector(897,96);
  lamp2[2] = createVector(1021,99);
  lamp2[3] = createVector(1034,129);
  lamp2[4] = createVector(978,268);
  lamp2[5] = createVector(891,264);
  lamp2[6] = createVector(863,145);
  
  //these are the points of attraction
  lamp1_center = createVector(695,184); 
  lamp2_center = createVector(940,200);
}

function draw() {
  background(backgroundcolor);
  image(vivarium_bg, 0, 0);
  displaybugcage();
  
  
  
  welcometext();
  
  //console.log(maxspeedSlider.value(), separationSlider.value(), maxforceSlider.value(), soundRadio.value()); 
  // Update and display bugs
  for (var i=0; i<creatures.length; i++){
    creatures[i].applyBehaviors(creatures);
    creatures[i].update();
    creatures[i].display(); 
  }
  
  //show_shape_debug(lamp1); //draws lamp shape - to check that it's where i want it
  //show_shape_debug(lamp2);
}

//-----------------------------------
function welcometext(){
  text("Velcome to our hotel", 60, 100);
  
  push();
  text("please, release a friend", 60, 150);
  pop();
}
function displaybugcage(){
  //moth inside of cage
  var size = random(28, 48);
  
  
  //swinging cage
  //wow, i have no idea what i'm doing here... but i got it looking neat! 
  //was hoping for a bit of a more lazy swing... but couldn't figure that out,...yet
  push();
  translate(cagestartx, cagestarty); 
  if (cagerotationcounter > 5){
    cagereverse = true;
  } else if (cagerotationcounter < -8){
    cagereverse = false;
  } 
  var isevenframe = frameCount % 2;
  //console.log(isevenframe);
  if (isevenframe){ //was trying to slow down the swing, but instead, creates a neat flicker
    if (cagereverse) {
      cagerotationcounter--;
      xoff = xoff - .01;
    } else {
      cagerotationcounter++;
      xoff = xoff + .01;
    }
    
    var n = noise(xoff);
    var deg = (cagerotationcounter*n)*.6;
    var rad = radians(deg);
    rotate(rad);
  
  image(bugimg, 30, 190, size, size);
  image(cageimg, 0, 0);
  }
  pop();
  
  
}

//show the polgon
function show_shape_debug(poly){
    //draw the polygon from the created Vectors above.
    beginShape();
    for(i=0; i < poly.length; i++){
        vertex(poly[i].x,poly[i].y);
    }
    endShape(CLOSE);
}

//add another bug to the sketch at mouse location
function addCreature(){
  creatures[creatures.length] = new Bug(mouseX, mouseY);
  //doorsound.play();
}

//-------------BUG----------------------
//-----------------------------------
//-----------------------------------
function Bug(posx, posy) {
  //initialize
  this.position = createVector(posx, posy);
  this.velocity = createVector(0,0);
  this.acceleration = createVector(0, 0);
  this.maxspeed = 20;    // Maximum speed
  this.maxforce = random(.2, .8);  // Maximum steering force random
  this.lampnum = Math.floor(Math.random() * 2);
  this.r = 12;
  
  //APPLY
  this.applyBehaviors = function(vehicles) {

     var separateForce = this.separate(vehicles);
     
     //allow bugs to seek either lamp
     //TODO: might be interesting to create more than 1 point of attraction per lamp
     if (this.lampnum==1){
        var seekForce = this.seek(lamp1_center); 
      } else {
        var seekForce = this.seek(lamp2_center); 
      }
     
     separateForce.mult(2);
     seekForce.mult(1);

     this.applyForce(separateForce);
     this.applyForce(seekForce);
  }
  
  this.applyForce = function(force) {
    this.acceleration.add(force);
  }
  
  //UPDATE
  this.update = function() {
    
    //when bug hits lamp, i want them to go radically in a different direction
    if (this.bughitlamp()){
      //this.acceleration.mult(-.8);
      if (soundRadio.value() != 'off'){
        bump_sound.play();
        bump_sound.setVolume(0.1);
      }
    } 
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.maxspeed = maxspeedSlider.value();
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
  }
  
  //HIT 
  //determine if bug has collided with either of the lamps
  this.bughitlamp = function(){
    var hit_lamp1 = collidePointPoly(this.position.x, this.position.y, lamp1); //3rd parameter is an array of vertices.
    var hit_lamp2 = collidePointPoly(this.position.x, this.position.y, lamp2); //3rd parameter is an array of vertices.
    if (hit_lamp1){
      //console.log('hit lamp1: ' + this.position.x + ', ' + this.position.y);
      return(true);
    } else if (hit_lamp2){
      ///console.log('hit lamp2: ' + this.position.x + ', ' + this.position.y);
      return(true);
    } else {
      return (false);
    }
  }

//DISPLAY
//turn bug towards mouse
  this.display = function() {
   
    //show graphic of bug and orient towards attractor
    var theta = this.velocity.heading() + radians(90);
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    var size = random(28, 48); //this has the effect of making them seem to flap wings... but what i really want is bigger close and smaller further away
    image(bugimg, 0, 0, size, size);
    pop();
    
    /*
    //try little circles, for debugging
    fill(127);
    stroke(200);
    strokeWeight(2);
    push();
    translate(this.position.x, this.position.y);
    ellipse(0, 0, this.r, this.r);
    pop();
    */
  }
  
  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  this.seek = function(target) {
    var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired,this.velocity);
    this.maxforce = maxforceSlider.value();
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
  }
  
  // Separation
  // Method checks for nearby vehicles and steers away
  this.separate = function(vehicles) {
    var desiredseparation = separationSlider.value(); //take value from slider
    //console.log(desiredseparation);
    var sum = createVector();
    var count = 0;
    // For every boid in the system, check if it's too close
    for (var i = 0; i < vehicles.length; i++) {
      var d = p5.Vector.dist(this.position, vehicles[i].position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        var diff = p5.Vector.sub(this.position, vehicles[i].position);
        diff.normalize();
        diff.div(d);        // Weight by distance
        sum.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      sum.div(count);
      // Our desired vector is the average scaled to maximum speed
      sum.normalize();
      sum.mult(this.maxspeed);
      // Implement Reynolds: Steering = Desired - Velocity
      sum.sub(this.velocity);
      this.maxforce = maxforceSlider.value();
      sum.limit(this.maxforce);
    }
    return sum;
  }
  
  
}

