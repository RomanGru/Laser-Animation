function construct(){ 

  C = document.getElementById("AC");    //layer 1, background, all other stuff
  C2 = document.getElementById("AC2");  //layer 2, lenses
  C3 = document.getElementById("AC3");  //layer 3: optical bench, collextion
  C4 = document.getElementById("AC4");  //layer 4: labels ROC
  C5 = document.getElementById("AC5");  //layer 5: rays
  C6 = document.getElementById("AC6");  //layer 6: screen
  C7 = document.getElementById("AC7");  //layer 7: lineal & positions
  C8 = document.getElementById("AC8");  //layer 8: single ray
  C9 = document.getElementById("AC9");  //layer 9: laserpointer
  C10 = document.getElementById("AC10");  //layer 10: Laser intensity
  C11 = document.getElementById("AC11");  //layer 11: Laser dot on screen
  C20 = document.getElementById("AC20");  //layer 20: for Eventhandler
	
	ctx = C.getContext("2d");
  ctx2 = C2.getContext("2d");
  ctx3 = C3.getContext("2d");
  ctx4 = C4.getContext("2d");
  ctx5 = C5.getContext("2d");
  ctx6 = C6.getContext("2d");
  ctx7 = C7.getContext("2d");
  ctx8 = C8.getContext("2d");
  ctx9 = C9.getContext("2d");
  ctx10 = C10.getContext("2d");
  ctx11 = C11.getContext("2d");
  ctx20 = C20.getContext("2d");

  makeTitle(ctx3);

  let urlParam = new URLSearchParams(window.location.search);
  let rroc = 0;
  if (urlParam.has('roc')) {
    rroc = parseInt(urlParam.get('roc'));
  } else {
    rroc = 150;
  } 
  if (urlParam.has('mode') && urlParam.get('mode')=="dark" ) {
    document.getElementById("AC").style.background = "#333";
  }

  cavity = {
    "mleft" : {
      "position" : 50,
      "roc" : 100
      },
    "mright" : {
      "position" : 50,
      "roc" : rroc
      },
    "lens" : {
      "position" : 50,
      "f" : -50
      }, 
    "cavity" : 1280,
    "lmedium" : {
      "position" : 120,
      "length" : 59
    },
    "pump" : 0,
    "lambda" : 635
  };
}

function makeTitle(ctx){
  //Versionsnummer: 
  let version = "Version 0.8";

  if (H < 700 && W < 1200 && W>H) {
    window.alert("Die Animation ist aktuell nur für ein Bildschirm in Full HD (1920x1080 Pixel) im Querformat optimiert. Die Animation sieht ggf. verschoben aus.");
  } else if (H>W) {
    window.alert("Bitte das Tablet in Querformat drehen.");

  }
  ctx.moveTo(W/6, H/2);
  ctx.lineTo((W-W/6), H/2);
  ctx.strokeStyle = "#75007620";
  ctx.stroke();

  opticalAxisLength = W*2/3;
  if (H < 700 && W < 1200 || H>W) { //für Tablets 
    ctx.font = "8px Arial";
    ctx.fillText((version), W/6,H/5);
    ctx.font = "14px Arial";
    ctx.fillText(("Aufbau eines Laserresonators"), W/6,H/5+15);   
    ctx.fillText(("Länge der optischen Achse: "+ math.round(opticalAxisLength) + " mm"), W/6,H/5+35);
  
  } else { //für Full-HD
    ctx.font = "18px Arial";
    ctx.fillText((version), W/6,H/2-280);
    ctx.font = "24px Arial";
    ctx.fillText(("Aufbau eines Laserresonators"), W/6,H/2-250);   
    ctx.fillText(("Länge der optischen Achse: "+ math.round(opticalAxisLength) + " mm"), W/6,H/2-200);
  }

}


function addObject(pathArr = [], layer = 1, type = 'mirror', 
                    interaction = 'drag', state = 0, x = 1,y = 1, 
                    scale = 1,maxwidth = 0){
  // pathArr = ['/path/0', '/path/1', ...], state (starting with 0) chooses index of pathArr
  // layer indicated #canvaslayer (stating with 1)
  // type could be lense, mirror, powersource, powermeter
  // interaction could be none, drag, click
  // x & y indicate position in canvas
  // scale = 0 & maxwidth >0 scales the image according width

  // create Img & puts it to according layer
  let im = new Image();
  im.onload = function(){
    im.width = math.round(im.naturalWidth*scale);
    im.height = math.round(im.naturalHeight*scale); 
    if (layer == 1) { ctx.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 2) {ctx2.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 3) {ctx3.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 4) {ctx4.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 5) {ctx5.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 6) {ctx6.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 7) {ctx7.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 8) {ctx8.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 9) {ctx9.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 10) {ctx10.drawImage(im, x,y, im.width, im.height);}
    else if (layer == 11) {ctx11.drawImage(im, x,y, im.width, im.height);}
    let item = {
        "x": x,
        "y": y,
        "w": im.width,
        "h": im.height,
        "z": layer,
        "type": type, //mirrorL, pumpsource, powermeter, none
        "interaction": interaction, //click
        "state": state, // 0, 1, 2 ...
        "url": pathArr
    };
     Obj.push(item);
  }
  im.src = pathArr[state];
}

function isLasing(skipLaserMedium = false, virtualMedium = false, returnG = false){
  let mR = cavity.mright.position;
  let mL = cavity.mleft.position;
  let lmL = cavity.lmedium.position;
  let lmR = cavity.lmedium.position + cavity.lmedium.length;
  let L = mR - mL;
  let g1 = 0;
  let g2 = 0;
  if (cavity.mleft.roc == 0) {g1 = 1} else {g1 = 1-(L/cavity.mleft.roc);}
  if (cavity.mright.roc == 0) {g2 = 1} else {g2 = 1-(L/cavity.mright.roc);}
  let erg = g1*g2;
  if (returnG) {
    return [g1,g2];
  } else {
    if ((0 <= erg && 1 >= erg) && (cavity.pump == 1 || skipLaserMedium) && ((lmL > (mL-lmediumInMirrorOffset) && lmR < (mR+lmediumInMirrorOffset)) || virtualMedium)) {
      return true;
    } else {
      return false;
    }
  }
}

function updateObjectState(newState, index){
  Obj[index].state = newState;
  drawLayer(Obj[index].z, true);
}

function clearLayer(layer){
  if (layer == 1) {
    ctx.clearRect(0, 0, C.width, C.height);
    return ctx;
  } else if (layer == 2) {
    ctx2.clearRect(0, 0, C2.width, C2.height);
    return ctx2;
  } else if (layer == 3) {
    ctx3.clearRect(0, 0, C3.width, C3.height);
    return ctx3;
  } else if (layer == 4) {
    ctx4.clearRect(0, 0, C4.width, C4.height);
    return ctx4;
  } else if (layer == 5) {
    ctx5.clearRect(0, 0, C5.width, C5.height);
    return ctx5;
  } else if (layer == 6) {
    ctx6.clearRect(0, 0, C6.width, C6.height);
    return ctx6;
  } else if (layer == 7) {
    ctx7.clearRect(0, 0, C7.width, C7.height);
    return ctx7;
  } else if (layer == 8) {
    ctx8.clearRect(0, 0, C8.width, C8.height);
    return ctx8;
  } else if (layer == 9) {
    ctx9.clearRect(0, 0, C9.width, C9.height);
    return ctx9;
  } else if (layer == 10) {
    ctx10.clearRect(0, 0, C10.width, C10.height);
    return ctx10;
  } else if (layer == 11) {
    ctx11.clearRect(0, 0, C11.width, C11.height);
    return ctx11;
  } 
}

function findObjectInArray(type){
  let temp = 0;
  Obj.forEach(function(o, index){
    if (o.type == type) {
      temp = index;
    } 
  });
  if (temp != null) {
    return temp;
  } else {
    return false;
  }
}

  // Functions for Userinteraction


function labelRoc(event = false){
  if (event != false) {
      event.preventDefault();
  }
  let el = document.getElementById("display-label-roc");
  if (el.checked) {
    ctx4.clearRect(0, 0, W, H);
    let m1 = Obj[findObjectInArray("mirrorL")];
    let m2 = Obj[findObjectInArray("mirrorR")];
    let textHeight = m1.y + 30+ m1.h;
    ctx4.font = "18px Arial";
    ctx4.fillText(("R1: "+ cavity.mleft.roc + " mm"), (m1.x - 10),textHeight);
    ctx4.fillText(("R2: "+ cavity.mright.roc + " mm"), (m2.x - 10),textHeight);
  } else {
      ctx4.clearRect(0, 0, W, H);
  }
}

function autopAlign(event = false){
  if (event != false) {
      event.preventDefault();
  }
  updateObjectPosition((W/6+100), H/2, findObjectInArray("mirrorL"));
  updateObjectPosition((W/6+280), H/2, findObjectInArray("mirrorR"));
  updateObjectPosition((W/6+150), H/2, findObjectInArray("lmedium"));
  drawLayer(2, true);
  displayFocus();
  labelRoc();
}

function displayFocus(event = false){
  if (event != false) {
      event.preventDefault();
  }
  let el = document.getElementById("display-focus");
  ctx5.clearRect(0, 0, W, H);

  if (el.checked) {
    ctx5.clearRect(0, 0, W, H);

    let m1 = Obj[findObjectInArray("mirrorL")];
    let m2 = Obj[findObjectInArray("mirrorR")];
    let ROC1 = cavity.mleft.roc;
    let ROC2 = cavity.mright.roc;

    ctx5.strokeStyle="#03820485"; //#5affaf // rgbs(90,255,175,0.52)
    ctx5.beginPath();
    //left mirror rays
    ctx5.moveTo((m1.x+m1.w), (m1.y+2));
    ctx5.lineTo((m1.x+m1.w+ROC1), (m1.y + m1.h/2));
    ctx5.moveTo((m1.x+m1.w), (m1.y-2+m1.h));
    ctx5.lineTo((m1.x+m1.w+ROC1), (m1.y + m1.h/2));
    //right mirror rays
    ctx5.moveTo((m2.x), (m2.y+2));
    ctx5.lineTo((m2.x-ROC2), (m2.y + m2.h/2));
    ctx5.moveTo((m2.x), (m2.y-2+m2.h));
    ctx5.lineTo((m2.x-ROC2), (m2.y + m2.h/2));

    ctx5.stroke();
    ctx5.closePath();
  }
}

function swapLense(type, val, bool = false){
  if (val == 0) {
    Obj[findObjectInArray(type)].state = 1;
  } else if (val > 0) {
    Obj[findObjectInArray(type)].state = 0;
  } else if (val < 0) {
    Obj[findObjectInArray(type)].state = 2;
  }
  drawLayer(2, bool);
}

function drawRuler(offset, currX, baseY){
  ctx7.beginPath();
  ctx7.strokeStyle="#111"
  ctx7.lineWidth = 2;
  ctx7.moveTo(offset, baseY);
  ctx7.lineTo((offset+opticalAxisLength), baseY);
   ctx7.stroke();
  ctx7.strokeStyle="#555";
  ctx7.lineWidth = 1;
  ctx7.font = "10px Arial";
  while (currX < opticalAxisLength){
    if (currX%100 == 0 ) {
      ctx7.moveTo((offset+currX), baseY);
      ctx7.lineTo((offset+currX), baseY+15);
      ctx7.fillText(currX,offset+currX-5,baseY-2);
    } else {
      ctx7.moveTo((offset+currX), baseY);
      ctx7.lineTo((offset+currX), baseY+8);
    }
    currX=currX+10;
  }
  ctx7.stroke();
  ctx7.closePath();
}

function absolutePosition(event = false){
  if (event != false) {
      event.preventDefault();
  }
  let el = document.getElementById("abs-position");
  if (el.checked) {
    document.getElementById("rel-position").checked = false;
    let offset = W/6;
    let currX = 0;
    let baseY = H*5/12;

    ctx7.clearRect(0, 0, W, H);
    drawRuler(offset, currX, baseY);

    ctx7.strokeStyle="#bbb";
    ctx7.moveTo(cavity.mleft.position, baseY-12);
    ctx7.lineTo(cavity.mleft.position, H/2);
    ctx7.moveTo(cavity.mright.position, baseY-12);
    ctx7.lineTo(cavity.mright.position, H/2);

    ctx7.stroke();
    ctx7.font = "14px Arial";
    if (cavity.mleft.position != -1) {
      ctx7.fillText(math.round(cavity.mleft.position-offset)+ " mm", cavity.mleft.position,(baseY-18));
    }
    if (cavity.mright.position != -1) {
      ctx7.fillText(math.round(cavity.mright.position-offset)+ " mm", cavity.mright.position,(baseY-18));
    }

    ctx7.closePath();

  } else if(!document.getElementById("rel-position").checked){
    ctx7.clearRect(0, 0, W, H);
  }
}

function relativePosition(event = false){
  if (event != false) {
      event.preventDefault();
  }
  let el = document.getElementById("rel-position");
  if (el.checked) {
    document.getElementById("abs-position").checked = false;
    let offset = W/6;
    let currX = 0;

    ctx7.clearRect(0, 0, W, H);
    drawRuler(offset, currX, rulerBaseY);

    ctx7.strokeStyle="#bbb";
    ctx7.moveTo(cavity.mleft.position, rulerBaseY-12);
    ctx7.lineTo(cavity.mleft.position, H/2);
    ctx7.moveTo(cavity.mright.position, rulerBaseY-12);
    ctx7.lineTo(cavity.mright.position, H/2);

    ctx7.stroke();
    ctx7.font = "14px Arial";
    if (cavity.mleft.position != -1) {
      ctx7.fillText("0 mm", cavity.mleft.position,(rulerBaseY-18));
    }
    if (cavity.mright.position != -1) {
      ctx7.fillText((cavity.mright.position-cavity.mleft.position)+ " mm", cavity.mright.position,(rulerBaseY-18));
    }

    ctx7.closePath();

  } else if(!document.getElementById("abs-position").checked){
    ctx7.clearRect(0, 0, W, H);
  }
}

function nmToRGB(wavelength){ // 380 <= lambda <= 781
  var Gamma = 0.80,
  IntensityMax = 255,
  factor, red, green, blue;
  if((wavelength >= 380) && (wavelength<440)){
      red = -(wavelength - 440) / (440 - 380);
      green = 0.0;
      blue = 1.0;
  }else if((wavelength >= 440) && (wavelength<490)){
      red = 0.0;
      green = (wavelength - 440) / (490 - 440);
      blue = 1.0;
  }else if((wavelength >= 490) && (wavelength<510)){
      red = 0.0;
      green = 1.0;
      blue = -(wavelength - 510) / (510 - 490);
  }else if((wavelength >= 510) && (wavelength<580)){
      red = (wavelength - 510) / (580 - 510);
      green = 1.0;
      blue = 0.0;
  }else if((wavelength >= 580) && (wavelength<645)){
      red = 1.0;
      green = -(wavelength - 645) / (645 - 580);
      blue = 0.0;
  }else if((wavelength >= 645) && (wavelength<781)){
      red = 1.0;
      green = 0.0;
      blue = 0.0;
  }else{
      red = 0.0;
      green = 0.0;
      blue = 0.0;
  };
  // Let the intensity fall off near the vision limits
  if((wavelength >= 380) && (wavelength<420)){
      factor = 0.3 + 0.7*(wavelength - 380) / (420 - 380);
  }else if((wavelength >= 420) && (wavelength<701)){
      factor = 1.0;
  }else if((wavelength >= 701) && (wavelength<781)){
      factor = 0.3 + 0.7*(780 - wavelength) / (780 - 700);
  }else{
      factor = 0.0;
  };
  if (red !== 0){
      red = math.round(IntensityMax * math.pow(red * factor, Gamma));
  }
  if (green !== 0){
      green = math.round(IntensityMax * math.pow(green * factor, Gamma));
  }
  if (blue !== 0){
      blue = math.round(IntensityMax * math.pow(blue * factor, Gamma));
  }
  return [red,green,blue];
}

function toHex(number){
  //converts a decimal number into hex format
  var hex =  number.toString(16);
  if (hex.length < 2){
      hex = "0" + hex;
  }
  return hex;
}

function rgbToHex(color){
  //takes an 3 element array (r,g,b) and returns a hexadecimal color
  var hexString = '#';
  for (var i = 0 ; i < 3 ; i++){
      hexString += this.toHex(color[i]);
  }
  return hexString;
}

function point(x= false,y = false, array = false, timeout = 50, wavelength = 0){
  //ctx8.strokeStyle = "#3333338A";
  let s = Obj[findObjectInArray("laserpointer")].state;
  if (wavelength != 0) {
    ctx8.strokeStyle = rgbToHex(nmToRGB(wavelength));
  } else if (s == 1) {
    ctx8.strokeStyle = "#088b0094";
  } else if (s == 2) {
    ctx8.strokeStyle = "#2034ff94";
  } else if (s == 0){
    ctx8.strokeStyle = "#ef000094";
  }
  if (x == false && y == false) {
    setTimeout(function() {
      clearLayer(8);
      ctx8.beginPath();
      for (var i = array.length - 1; i >= 0; i--) {
        ctx8.moveTo(array[i][0], array[i][1]);
        ctx8.lineTo(array[i][0]+1, array[i][1]);
      }
      ctx8.stroke();
    }, timeout);
  } else {
    setTimeout(function() {
      ctx8.beginPath();
      ctx8.moveTo(x, y);
      ctx8.lineTo(x+1, y);
      ctx8.stroke();
    }, timeout);
  }
}

function singleRay(event = false){
  if (event != false) {
      event.preventDefault();
  }
  rayTrace = new Array();
  let j = 0;
  let posY = 0;
  let offs = cavity.mleft.position;

  let lp = Obj[findObjectInArray("laserpointer")];
  let startY = lp.y+lp.h/2;
  rayTrace.push([lp.x+lp.w,startY]);
  beam = math.matrix([[H/2-startY],[0],[math.round((lp.x+lp.w)-offs)],[1]]);

  while ((math.abs(posY) < 50) && (j < singleRayPropCycles)){
    setTimeout(function() {
      posY = rayPropagation(offs);
      // point(false,false,rayTrace);
      for (var i = rayTrace.length - 1; i >= 0; i--) {
        point(rayTrace[i][0],rayTrace[i][1],false,200);
      }
    }, 10);
    j=j+1;
  }
}

function rayPropagation(offset){ 
  if (math.abs(beam._data[0][0]) < rayOutOfCavity) {
    if ((beam._data[3][0] > 0) && (beam._data[2][0] < cavity.mright.position-offset)) {
          //Beam propagates to right Mirror
      let L = math.matrix([[1,1,0,0],[0,1,0,0],[0,0,1,1],[0,0,0,1]]);
      beam = math.multiply(L,beam); //beam is global variable
      rayTrace.shift();
      rayTrace.push([math.round(offset+beam._data[2][0]),math.round(H/2-beam._data[0][0])]);
      return beam._data[0][0];
    } else if ((beam._data[3][0] < 0) && (beam._data[2][0] > 0)) {
          //Beam propagates to left Mirror
      let L = math.matrix([[1,1,0,0],[0,1,0,0],[0,0,1,1],[0,0,0,1]]);
      beam = math.multiply(L,beam); //beam is global variable
      rayTrace.shift();
      rayTrace.push([math.round(offset+beam._data[2][0]),math.round(H/2-beam._data[0][0])]);
      return beam._data[0][0];
    } else if ((beam._data[3][0] > 0) && (beam._data[2][0] == cavity.mright.position-offset)) {
        //Beam hits right Mirror
      let M2 = getMirrorMatrix("r",4);
      beam = math.multiply(M2,beam); //beam is global variable
      rayTrace.shift();
      rayTrace.push([math.round(offset+beam._data[2][0]),math.round(H/2-beam._data[0][0])]);
      return beam._data[0][0];
    } else if ((beam._data[3][0] < 0) && (beam._data[2][0] == 0)) {
      //Beam hits left Mirror
      let M1 = getMirrorMatrix("l",4);
      beam = math.multiply(M1,beam); //beam is global variable
      rayTrace.shift();
      rayTrace.push([math.round(offset+beam._data[2][0]),math.round(H/2-beam._data[0][0])]);
      return beam._data[0][0];
    } else if ((beam._data[3][0] > 0) && (beam._data[2][0] < 0)) {
          //Beam propagates tinto cavity
      let L = math.matrix([[1,1,0,0],[0,1,0,0],[0,0,1,1],[0,0,0,1]]);
      beam = math.multiply(L,beam); //beam is global variable
      rayTrace.shift();
      rayTrace.push([math.round(offset+beam._data[2][0]),math.round(H/2-beam._data[0][0])]);
      return beam._data[0][0];
    } else {
      console.log('ray somewhere but not propperly in cavity');
      return -1000;
    } 
  } else {
    return -1000;
  }
  
}

function clearRayLayer(event = false){
    if (event != false) {
      event.preventDefault();
    }
    clearLayer(8);
}

function calcBeamParam(event = false, showRay = true, returnVal = false){
  if (event != false) {
    event.preventDefault();
  }
  if (cavity.mright.position > 0 && cavity.mleft.position > 0 && isLasing(true, true)) {
    let lam = document.getElementById("lambda").value;
    cavity.lambda = lam;
    let z0 = 0;
    let omegaNull = 0;
    let M1 = getMirrorMatrix("l",2);
    let M2 = getMirrorMatrix("r",2);
    let posOfWaist = 0; //relative Position in cavity
    let omega = 0;
    let scaleFac = document.getElementById("gaussscalefactor").value;
    gaussRayTrace = new Array();
    let offs = cavity.mleft.position;

    
    let L = math.matrix([[1,(cavity.mright.position-cavity.mleft.position)],[0,1]]);
    
    let M = math.multiply(M1,L);
    M = math.multiply(M,M2);
    M = math.multiply(M,L);

    let A = M._data[0][0];
    let B = M._data[0][1];
    let C = M._data[1][0];
    let D = M._data[1][1];

    lam = lam * (10 ** -6);
    let zw = math.sqrt(B/(math.sqrt(1-((A+D)/2)**2)));
    if (math.re(zw) != 0) {
      zw = math.re(zw);
    } else {
      zw = math.im(zw);
    }
    omegaNull = math.sqrt(lam / math.pi)*zw;
    z0 = math.pi*omegaNull*omegaNull/lam;
    document.getElementById("omega0").value = math.round(omegaNull,2);

    let eq11 = 0;
    let eq12 = 0;
    let eq1e = 0;
    let eq21 = 0;
    let eq22 = 0;
    let eq2e = 0;
    let zwi = 0;
    if (cavity.mright.roc != 0 && cavity.mleft.roc != 0) {
      //posOfWaist = (cavity.mright.position-cavity.mleft.position)/2 + (1-cavity.mleft.roc/cavity.mright.roc)*(cavity.mright.position-cavity.mleft.position)/2; 
      //  circle M1
      zwi = cavity.mleft.roc/2;
      eq11 = - 2*zwi;
      eq12 = zwi ** 2;
      eq1e = (cavity.mleft.roc/2) ** 2;
      //  circle M2 
      zwi = (cavity.mright.position-offs)-cavity.mright.roc/2;
      eq21 = - 2*zwi;
      eq22 = zwi ** 2;
      eq2e = (cavity.mright.roc/2) ** 2;
      //  solve Eq
      eq11 = eq11-eq21;
      eq12 = eq12-eq22;
      eq1e = eq1e-eq2e;
      eq1e = eq1e + (-1)*eq12;
      posOfWaist = eq1e / eq11;
    } else if (cavity.mright.roc == 0) {
      posOfWaist = cavity.mright.position-cavity.mleft.position; 
    } else if (cavity.mleft.roc == 0) {
      posOfWaist = 0; 
    }
    for (var i = cavity.mright.position-cavity.mleft.position - 1; i >= 0; i--) {
      omega = omegaNull**2 * (1+((i-posOfWaist)/z0)**2);
      gaussRayTrace.unshift([i+offs,H/2-math.round(omega*scaleFac)],[i+offs,H/2+math.round(omega*scaleFac)]);
    }
    if (showRay) {
      point(false,false,gaussRayTrace,0,math.round(lam*10**6));
    } 

    if (returnVal) { //gives minimal Beam Waist with respect to Lasermedium by cycling throu Beam array and finds the minimal point
      let p = cavity.lmedium.position;
      let l = cavity.lmedium.length;
      let d = 100000;
          //HIER LIEGT DER HUND BEGRABEN ..... ->>>>>>>>>>>>>>>>>
      for (var i = gaussRayTrace.length - 1; i >= 0; i--) {
        if (gaussRayTrace[i][0] >= p && gaussRayTrace[i][0] <= (p+l)) {
          if(math.abs(gaussRayTrace[i][1] - H/2)*2/scaleFac < d) {
            d = math.abs(gaussRayTrace[i][1] - H/2)*2/scaleFac;
          }
        } 
      }
      if (returnVal > 1) { // gives more values with respekt to the 3 positions left, middle, right of the lasermedium

      } else { //returns single value (as usual)
        return d;
      }
    }

    let rMax = 2 * z0;
    return [omegaNull,posOfWaist,z0,offs,rMax];

  } else {
    clearLayer(8);
    return false;
  }
}

function laserIntensity(){
  clearLayer(10);
  // nur wenn ausgewählt ist, dass Intensität angezeigt werden soll
  if (document.getElementById("laserintensity").checked == true) { 
    if (cavity.pump == 1) {
      let d = calcBeamParam(false,false,true);
      let I = 0;
      if (d) {
        I = getIntensity(d);
      }
      let str = "Laserintensität: " + I + "%";
      if ((W < 1200)) {
        // Adjustment for smaller Screens
        ctx10.font = "14px Arial";
        ctx10.fillText((str), W*5/6-10,H/2-70);
      } else {
        ctx10.font = "24px Arial";
        ctx10.fillText((str), W*5/6,H/2-100);
      }
    } 
  } 
}

function getIntensity(d = 1){
  let I = 0;
  if (d > minLaserRadius) {
    I = math.ceil((minLaserRadius / d)**2 * 100);
  } else {
    I = 100;
  } return I;
}

function showGauss(event = false){
  if (event != false) {
    event.preventDefault();
  }
  let el = document.getElementById("updategauss");
  if (el.checked == true) {
    calcBeamParam();
  } else {
    clearLayer(8);
  }
}

function getMirrorMatrix(type, size) {
  let M = 0;
  if (type == "l") {
    if (size == 2) {
      if (cavity.mleft.roc == 0) {
        M = math.matrix([[1,0],[0, 1]]);
      } else {
        M = math.matrix([[1,0],[-2/cavity.mleft.roc, 1]]);
      }
    } else if (size == 4) {
      if (cavity.mleft.roc == 0) {
        M = math.matrix([[1,0,0,0],[0, 1,0,0],[0,0,1,0],[0,0,0,-1]]);
      } else {
        M = math.matrix([[1,0,0,0],[-2/cavity.mleft.roc, 1,0,0],[0,0,1,0],[0,0,0,-1]]);
      }
    } else {
      return false;
    } return M;
  } else if (type == "r") {
    if (size == 2) {
      if (cavity.mright.roc == 0) {
        M = math.matrix([[1,0],[0, 1]]);
      } else {
        M = math.matrix([[1,0],[-2/cavity.mright.roc, 1]]);
      }
    } else if (size == 4) {
      if (cavity.mright.roc == 0) {
        M = math.matrix([[1,0,0,0],[0, 1,0,0],[0,0,1,0],[0,0,0,-1]]);
      } else {
        M = math.matrix([[1,0,0,0],[-2/cavity.mright.roc, 1,0,0],[0,0,1,0],[0,0,0,-1]]);
      }
    } else {
      return false;
    } return M
  } else {
    return false;
  }
}

function charBeamParam(omegaNull, posInCav, zR, offset){
  drawRuler(W/6, 0, rulerBaseY);
  ctx7.beginPath();
  ctx7.strokeStyle="#c38aff";
  ctx7.moveTo(offset+posInCav, rulerBaseY-24);
  ctx7.lineTo(offset+posInCav, H/2);
  ctx7.moveTo(offset+posInCav+zR, rulerBaseY-24);
  ctx7.lineTo(offset+posInCav+zR, H/2);

  ctx7.stroke();
  ctx7.font = "14px Arial";
  ctx7.fillText("Größe der Strahltaille omega0: " + math.round(omegaNull,2) + " mm", offset+posInCav,(rulerBaseY-30));
  ctx7.fillText("Entfernung von Taille z0: " + math.round(zR,2) + " mm", offset+posInCav+zR,(rulerBaseY-45));
  ctx7.closePath();
  //document.getElementById("rel-position").checked = true;

}

function showWaist(event = false){
  if (event != false) {
    event.preventDefault();
  }
  let erg = calcBeamParam(false,false);
  if (erg) {
    charBeamParam(erg[0],erg[1],erg[2],erg[3]);
  }
}

  // Functions for Mouseevents


function drawLayer(layer, boolean = false){ //boolean = true läd alle Elemente neu
  let context = clearLayer(layer);
  Obj.forEach(function(o, index){
     if (o.z == layer) { //Object is in correct layer
      let im = new Image();
      im.width = o.w;
      im.height = o.h;
      if (boolean) { // beheben des Flackerns
        im.onload = function(){
          context.drawImage(im, o.x, o.y, im.width, im.height);
        } 
          im.src = o.url[o.state];

      } else {
        im.src = o.url[o.state];
        
        im.onload = function(){
          context.drawImage(im, o.x, o.y, im.width, im.height);
        }      
      }
      // im.onload = function() {
      //     context.drawImage(im, o.x, o.y, o.w, o.h);  // Zeichne nur nach vollständigem Laden
      // };
      
      // im.onerror = function() {
      //     console.error(`Fehler beim Laden des Bildes: ${o.url[o.state]}`);
      // };

    } /*else if(o.type == "screen") {  //Update the screen with laserpoint
      clearLayer(6);
      let im = new Image();
      im.width = o.w;
      im.height = o.h;
      if (isLasing()) {
        im.onload = function(){
          ctx6.drawImage(im, o.x, o.y, im.width, im.height);
        } 
        im.src = o.url[1];
      } else {
        im.onload = function(){
          ctx6.drawImage(im, o.x, o.y, im.width, im.height);
        } 
        im.src = o.url[0];
      }
    }*/
  });
  if (layer == 3) {
      ctx3.moveTo(W/6, H/2);
      ctx3.lineTo((W-W/6), H/2);
      ctx3.stroke();
  }
}

function redrawDot(){
  let x = W*5/6+95;
  let y = H/2+1
  if ((W < 1200)) {
    // Adjustment for smaller Screens
    x=W*5/6+57;
  } 
  let ctx = clearLayer(11); 
  if (isLasing()){
     let hex = rgbToHex(nmToRGB(cavity.lambda));
    let gradient = ctx.createRadialGradient(x, y, 6, x, y, 13);
    gradient.addColorStop(0, hex);
    gradient.addColorStop(1, hex + '00');
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, 2* Math.PI, false);
    ctx.fillStyle = gradient;
    ctx.fill();
    let op = math.sqrt((getIntensity(calcBeamParam(false,false,true)))/100);
    document.getElementById("AC11").style.opacity = op;
  }
}

function updateObjectPosition(x, y, activeIndex){
  let activeObject = Obj[activeIndex];
  if (activeObject.type == "laserpointer") {
    Obj[activeIndex].x=2/24*W;
    Obj[activeIndex].y=y;
  } else {
    if (y>(H/2-clippingRadiusY) && y<(H/2+clippingRadiusY)) {
      Obj[activeIndex].y = (H/2-Obj[activeIndex].h/2);
      if (activeObject.type == "mirrorL") { //write to cavity array left position
        cavity.mleft.position = math.round(x + activeObject.w);
      } else if(activeObject.type == "mirrorR") { //write to cavity array right position
        cavity.mright.position = math.round(x);
      } else if(activeObject.type == "lmedium") { //write to cavity array right position
        cavity.lmedium.position = math.round(x);
      }
    } else {
      Obj[activeIndex].y=y;
      if (activeObject.type == "mirrorL") { //write to cavity array left position
        cavity.mleft.position = -1;
      } else if(activeObject.type == "mirrorR") { //write to cavity array right position
        cavity.mright.position = -1;
      } else if(activeObject.type == "lmedium") { //write to cavity array right position
        cavity.lmedium.position = -1;
      }
    } 
    Obj[activeIndex].x=x;
  }
}

function detectObject(x,y) {
  for (var i = Obj.length - 1; i >= 0; i--) {
    if (Obj[i].x <= x && (Obj[i].x + Obj[i].w) >= x) { //Courserposition x is between Obj in x direction
      if (Obj[i].y <= y && (Obj[i].y + Obj[i].h) >= y) { //Courserposition y is between Obj in y direction
        if (Obj[i].z != 3) {
          actIndex = i;
          return Obj[i];
        }
      }
    }
  }
  return false;
}

function canObjectMove(x,y){
  let Ob = detectObject(x,y);
  let index = actIndex;
  if (Ob) {
    if (Ob.interaction == "click") { //onclick change state & draw new
      
      if (Ob.state == 0) {
        updateObjectState(1,index);
        if (Ob.type == "pumpsource") {
          cavity.pump = 1;
          Obj[findObjectInArray("lmedium")].state = 1;
          drawLayer(2, true);
          redrawDot();
          return false;
        }

      } else if (Ob.state == 1) {
        if (Ob.type == "pumpsource") {
          updateObjectState(0,index);
          cavity.pump = 0;
          laserIntensity(); //delete Text of laserIntensity
          Obj[findObjectInArray("lmedium")].state = 0;
          drawLayer(2, true);
          clearLayer(11); 
          return false;
        } else if(Ob.type == "laserpointer") {
          setTimeout(function() {updateObjectState(2,index);},10); //without timeout it goes in next condidtion
        }
      } if (Ob.state == 2) {
        if(Ob.type == "laserpointer") {
          updateObjectState(0,index);
        }
      } return Ob;

    } else if (Ob.interaction == "drag") {
      return Ob;
    }
  }
}



window.onload = function() {
  //drag image around
  //var ctx=C.getContext("2d");
  var offsetX=C.offsetLeft;
  var offsetY=C.offsetTop;
  var canvasWidth=C.width;
  var canvasHeight=C.height;
  var isDragging=false;

  function handleMouseDown(e,type){
    if (type == "m") {
      canMouseX=parseInt(e.clientX-offsetX);
      canMouseY=parseInt(e.clientY-offsetY);
    } else if (type =="t") {
      canMouseX=parseInt(e.touches[0].clientX-offsetX);
      canMouseY=parseInt(e.touches[0].clientY-offsetY);
    }
    // set the drag flag
    if(retObj = canObjectMove(canMouseX, canMouseY)){
      isDragging=true;
      actObj = retObj;
    }
  }

  function handleMouseUp(e,type){
    // clear the drag flag
    isDragging=false;
  }

  function handleMouseOut(e,type){
    if (type == "m") {
      canMouseX=parseInt(e.clientX-offsetX);
      canMouseY=parseInt(e.clientY-offsetY);
    } else if (type =="t") {
      canMouseX=parseInt(e.touches[0].clientX-offsetX);
      canMouseY=parseInt(e.touches[0].clientY-offsetY);
    }
    // user has left the canvas, so clear the drag flag
    //isDragging=false;
  }

  function handleMouseMove(e,type){
    
    if (type == "m") {
      canMouseX=parseInt(e.clientX-offsetX);
      canMouseY=parseInt(e.clientY-offsetY);
    } else if (type =="t") {
      canMouseX=parseInt(e.touches[0].clientX-offsetX);
      canMouseY=parseInt(e.touches[0].clientY-offsetY);
    }
    let ObT = detectObject(canMouseX, canMouseY).type;
    if(ObT == "pumpsource"){
      C20.style.cursor = "pointer";
    } else if(ObT == "lmedium" || ObT == "mirrorL" || ObT == "mirrorR" || ObT == "laserpointer" ) {
      C20.style.cursor = "grab";
    } else {
      C20.style.cursor = "default";
    }
    // if the drag flag is set, clear the canvas and draw the image

    if(isDragging){ //all functions that should fire on dragging
        updateObjectPosition(parseInt(canMouseX), parseInt(canMouseY), actIndex);
        drawLayer(actObj.z);
        redrawDot();
        labelRoc();
        displayFocus();
        absolutePosition();
        relativePosition();
        laserIntensity();
        if (document.getElementById("updategauss").checked == true) {
          calcBeamParam();
        }
        if (document.getElementById("show-waist").checked == true) {
          showWaist();
        }
        if (toggleDiagram === 0) {
          let g12 = isLasing(true, true,true);
          redrawStabilityGPlot(g12[0],g12[1]);
        } else if(toggleDiagram === 1) {
          redrawStabilityPPlot();
        }
    } 
  }

  C20.addEventListener("mousedown", function(e){handleMouseDown(e,"m");});
  C20.addEventListener("mousemove", function(e){handleMouseMove(e,"m");});
  C20.addEventListener("mouseup", function(e){handleMouseUp(e,"m");});
  C20.addEventListener("mouseout", function(e){handleMouseOut(e,"m");});
  //mobile (buggy)
  C20.addEventListener("touchstart", function(e){;handleMouseDown(e,"t");}); //just listens to on touch, not swiping as mouse down
  C20.addEventListener("touchmove", function(e){handleMouseMove(e,"t");});
  C20.addEventListener("touchend", function(e){handleMouseUp(e,"t");});
  C20.addEventListener("touchcancel", function(e){handleMouseOut(e,"t");});

  //add Eventlisteners to Elements of Toolbar
  document.getElementById("display-label-roc").addEventListener("change", function(e){labelRoc(e);});
  document.getElementById("auto-align").addEventListener("click", function(e){autopAlign(e);});
  document.getElementById("display-focus").addEventListener("change", function(e){displayFocus(e);});
  document.getElementById("abs-position").addEventListener("change", function(e){absolutePosition(e);});
  document.getElementById("rel-position").addEventListener("change", function(e){relativePosition(e);});
  document.getElementById("single-ray").addEventListener("click", function(e){singleRay(e);});
  document.getElementById("clear-l8").addEventListener("click", function(e){clearRayLayer(e);});
  document.getElementById("lambda").addEventListener("input", function(e){calcBeamParam(e);});
  document.getElementById("updategauss").addEventListener("change", function(e){showGauss(e);});
  document.getElementById("show-waist").addEventListener("change", function(e){showWaist(e);});

  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // true for mobile device
    console.log("mobile device");
  }else{
    // false for not mobile device
    console.log("not mobile device");
  }

  if (W > H && H > 1000 && W > 1200) { // Full-HD & größer
    addObject(["gfx/pumpquelle-off.png","gfx/pumpquelle-on.png"], 1, "pumpsource", "click", 0, W*11/24,H*18/24);
    addObject(["gfx/m-kk-l.png","gfx/m-p-l.png","gfx/m-kv-l.png"], 2, "mirrorL", "drag", 0, (W/6+100),H/2);
    addObject(["gfx/m-kk-r.png","gfx/m-p-r.png","gfx/m-kv-r.png"], 2, "mirrorR", "drag", 0, (W/6+280),H/2);
    addObject(["gfx/screen-off.png","gfx/screen-on.png"], 6, "screen", "none", 0, W*5/6+20,H/2-70);
    addObject(["gfx/lasermedium-off.png","gfx/lasermedium-on.png"], 2, "lmedium", "drag", 0, (W/6+150),H/2);
    addObject(["gfx/laserpointer-r.png","gfx/laserpointer-g.png","gfx/laserpointer-b.png"], 9, "laserpointer", "click", 0, W*2/24,H*12/24-23);
  } else if (W > H && (H > 700 || W > 1200)) { // kleiner Bildschirm - Landscape
    addObject(["gfx/pumpquelle-off.png","gfx/pumpquelle-on.png"], 1, "pumpsource", "click", 0, W*13/24,H*19/24, 0.6);
    addObject(["gfx/m-kk-l.png","gfx/m-p-l.png","gfx/m-kv-l.png"], 2, "mirrorL", "drag", 0, (W/6+100),H/2);
    addObject(["gfx/m-kk-r.png","gfx/m-p-r.png","gfx/m-kv-r.png"], 2, "mirrorR", "drag", 0, (W/6+280),H/2);
    addObject(["gfx/screen-off.png","gfx/screen-on.png"], 6, "screen", "none", 0, W*5/6+20,H/2-70, 0.8);
    addObject(["gfx/lasermedium-off.png","gfx/lasermedium-on.png"], 2, "lmedium", "drag", 0, (W/6+150),H/2);
    addObject(["gfx/laserpointer-r.png","gfx/laserpointer-g.png","gfx/laserpointer-b.png"], 9, "laserpointer", "click", 0, W*2/24,H*12/24-23);
  } else if(W < H){ // Hochformat
    addObject(["gfx/pumpquelle-off.png","gfx/pumpquelle-on.png"], 1, "pumpsource", "click", 0, W*13/24,H*19/24, 0.6);
    addObject(["gfx/m-kk-l.png","gfx/m-p-l.png","gfx/m-kv-l.png"], 2, "mirrorL", "drag", 0, W*2/24,H/2);
    addObject(["gfx/m-kk-r.png","gfx/m-p-r.png","gfx/m-kv-r.png"], 2, "mirrorR", "drag", 0, W*3/24,H/2);
    addObject(["gfx/screen-off.png","gfx/screen-on.png"], 6, "screen", "none", 0, W*5/6+20,H/2-70, 0.8);
    addObject(["gfx/lasermedium-off.png","gfx/lasermedium-on.png"], 2, "lmedium", "drag", 0, W*4/24,H/2);
    addObject(["gfx/laserpointer-r.png","gfx/laserpointer-g.png","gfx/laserpointer-b.png"], 9, "laserpointer", "click", 0, W*2/24,H*12/24-23);
  } else if (W > H && (H < 700 && W < 1200)) { // Tablett
    addObject(["gfx/pumpquelle-off.png","gfx/pumpquelle-on.png"], 1, "pumpsource", "click", 0, W*13/24,H*18/24, 0.6);
    addObject(["gfx/m-kk-l.png","gfx/m-p-l.png","gfx/m-kv-l.png"], 2, "mirrorL", "drag", 0, (W/6+100),H/2);
    addObject(["gfx/m-kk-r.png","gfx/m-p-r.png","gfx/m-kv-r.png"], 2, "mirrorR", "drag", 0, (W/6+280),H/2);
    addObject(["gfx/screen-off.png","gfx/screen-on.png"], 6, "screen", "none", 0, W*5/6+10,H/2-50, 0.6);
    addObject(["gfx/lasermedium-off.png","gfx/lasermedium-on.png"], 2, "lmedium", "drag", 0, (W/6+150),H/2);
    addObject(["gfx/laserpointer-r.png","gfx/laserpointer-g.png","gfx/laserpointer-b.png"], 9, "laserpointer", "click", 0, W*2/24,H*12/24-23);
  }
  // document.getElementsByClassName("tools-2")[0].classList.add("hide");
  //add Objects to Canvas
  setTimeout(function() {
  // Code, der erst nach 2 Sekunden ausgeführt wird
        autopAlign(false);
        //turns on the Pump
        cavity.pump = 1;
        updateObjectState(1,0);
        Obj[findObjectInArray("lmedium")].state = 1;
        drawLayer(2, true);
        redrawDot();
  }, 500);

  if (W<600) {
    document.getElementById("plot-wrapper").classList.add("hide");
  }
}

 window.onresize = function(){
  setTimeout(function() {
    // Code, der erst nach 2 Sekunden ausgeführt wird
          window.location.reload();
    }, 500);
 }