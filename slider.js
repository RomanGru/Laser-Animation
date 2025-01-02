
const sliderValueL = document.getElementById("range-span-l");
const inputSliderL = document.getElementById("range-input-l");
inputSliderL.oninput = function(){
      let value = inputSliderL.value;
      sliderValueL.textContent = value;
      sliderValueL.style.left = (value/6) + "%";
      sliderValueL.classList.add("show");
      cavity.mleft.roc = parseInt(value);

      if (value == 0) {
            inputSliderL.disabled = true;
            setTimeout (function() { 
                  inputSliderL.disabled = false; },
            50);
            swapLense("mirrorL", value, true);

      } else {
            swapLense("mirrorL", value);

      }
      labelRoc();
      displayFocus();
      if (document.getElementById("updategauss").checked == true) {
          calcBeamParam();
        }
      if (toggleDiagram === 0) {
          let g12 = isLasing(true, true,true);
          redrawStabilityGPlot(g12[0],g12[1]);
        } else if(toggleDiagram === 1) {
          redrawStabilityPPlot();
        }
};

inputSliderL.onblur = function(){
      sliderValueL.classList.remove("show");
};

var hamburger = document.getElementsByClassName("hamburg")[0];
hamburger.addEventListener("click", function () {
      this.classList.toggle("checked");
      document.getElementsByClassName("tools")[0].classList.toggle("hide");
});

var hamburger2 = document.getElementsByClassName("hamburg2")[0];
hamburger2.addEventListener("click", function () {
      this.classList.toggle("checked");
      document.getElementsByClassName("tools-2")[0].classList.toggle("hide");
});

function togglePlot(event = false){
  if (event != false) {
    event.preventDefault();
  }
  let el = document.getElementsByClassName("arrow")[0];
  el.classList.toggle("down");
  let dia = document.getElementById("plotlyDiv");
  dia.classList.toggle("hide");
}
document.getElementById("plot-wrapper").addEventListener("click", function(e){togglePlot(e);});

function switchPlot(event = false){
  if (event != false) {
    event.preventDefault();
  }
  if (toggleDiagram === 1) {
      //change from Quadratische Fkt to 1/x 
      toggleDiagram = 0;
      let g12 = isLasing(true, true,true);
      redrawStabilityGPlot(g12[0],g12[1]);
  } else {
      //change from 1/x Plot to sq
      toggleDiagram = 1;
      redrawStabilityPPlot();
  }

}
document.getElementById("switch-dia").addEventListener("click", function(e){switchPlot(e);});

// Charts

// JSC.Chart('chartDiv', {
//       series: [
//     {
//       points: [{ x: "A", y: 10 }, { x: "B", y: 5 }]
//     }
//   ]
// });

var j = 400;
let myX = new Array();
let myY = new Array();
    var points = new Array();
    for (var i = j; i >= (-1*j); i--) {
        if (i != 0) {
            myX.push(i/100);
            myY.push(100/i);
        }
    }
let half = math.ceil(myX.length / 2);    
let myX1 = myX.slice(0, half);
let myX2 = myX.slice(half);
let myY1 = myY.slice(0, half);
let myY2 = myY.slice(half);

let trace1 = {
  x: myX1,
  y: myY1,
  mode: 'lines',
  hoverinfo: 'none',
  line: {color: "blue", dash: "longdash"},
  showlegend: false,
      fill: 'tozeroy',
      fillcolor: "#75bbffbf",
};

let trace2 = {
  x: myX2,
  y: myY2,
  mode: 'lines',
  hoverinfo: 'none',
  line: {color: "blue", dash: "longdash"},
      showlegend: false,
      fill: 'tozeroy',
      fillcolor: "#75bbffbf",
};

let trace4 = {
  x: [0.5],
  y: [1],
  mode: 'scatter',
  name: "Cavity Alignment",
  line: {color: "red"},
  showlegend: false
};

let trace5 = {
  x: [-10,10],
  y: [0,0],
  mode: 'lines',
  hoverinfo: 'none',
  line: {color: "blue", dash: "longdash"},
  showlegend: false,
  fill: 'tozeroy',
  fillcolor: "#75bbffbf"
};

let trace6 = {
  x: [0,0],
  y: [-10,10],
  mode: 'lines',
  hoverinfo: 'none',
  line: {color: "blue", dash: "longdash"},
  showlegend: false,
  fill: 'tozeroy',
  fillcolor: "#75bbffbf"
};

let pData = [ trace1, trace2,trace5,trace6];

let pLayout = {
  title:'Stabilitätsdiagramm von g1 und g2',
  xaxis: {range: [-4, 4],fixedrange: true,
      title: 'g1',
      titlefont: {
            family: 'Arial, sans-serif',
            size: 18,
            color: 'lightgrey'
      }},
  yaxis: {range: [-2.5, 2.5], fixedrange: true, 
      title: 'g2',
      titlefont: {
            family: 'Arial, sans-serif',
            size: 18,
            color: 'lightgrey'
      }},
  width: 550,
  height: 350,
  margin: {b:45}
};
let pConfig = {responsive: true}
Plotly.newPlot('plotlyDiv', pData, pLayout, pConfig);

function redrawStabilityGPlot(g1 = false,g2 = false){
      if (g1 !== false) {
            g1 = math.round(g1,2);
            g2 = math.round(g2,2);
        trace4 = {
        x: [g1],
        y: [g2],
        mode: 'scatter',
        name: "Cavity Alignment",
        line: {color: "red"},
        showlegend: false
      };
      pData = [ trace1, trace2, trace5,trace6,trace4];
      } else {
      pData = [ trace1, trace2,trace5,trace6];
      } 
      Plotly.newPlot('plotlyDiv', pData, pLayout, pConfig);
}

function redrawStabilityPPlot(){
      let R1 = cavity.mleft.roc;
      let R2 = cavity.mright.roc;
      let R12 = R1+R2;
      let x = math.round(cavity.mright.roc + math.abs(cavity.mleft.roc)) + 20;
      let myX = new Array();
      let myY = new Array();
      let thisY = 0;
      for (var i = x - 1; i >= -19; i--) {
            myX.push(i);
            if (R1 === 0) {
                  myY.push(1-i/R2);

            } else {
                  myY.push(1+i*(i/(R1*R2)-1/R1-1/R2));
            }
      }
      let myTrace1 = {
        x: myX,
        y: myY,
        mode: 'lines',
        hoverinfo: 'none',
        line: {color: "#38b9de", dash: "dot"},
        showlegend: false,
            // fill: 'tozeroy',
            // fillcolor: "#75bbffbf",
      };
      let L = math.round(cavity.mright.position - cavity.mleft.position);
      if (R1 === 0) {
            thisY = 1-L/R2;
      } else {
            thisY = 1+L*(L/(R1*R2)-1/R1-1/R2);
      }
      let myTrace2 = {
        x: [L],
        y: [thisY],
        mode: 'scatter',
        name: "Cavity Alignment",
        line: {color: "red"},
        showlegend: false
      };
      
      let myTrace3 = {
        x: [R1,R1],
        y: [-10,10],
        mode: 'line',
        name: "Cavity Alignment",
        line: {color: "blue", dash: "dash"},
        showlegend: false
      };
      let myTrace4 = {
        x: [R2,R2],
        y: [-10,10],
        mode: 'line',
        name: "Cavity Alignment",
        line: {color: "blue", dash: "dash"},
        showlegend: false
      };
      let myTrace5 = {
        x: [-1000,1000],
        y: [1,1],
        mode: 'line',
        name: "Cavity Alignment",
        line: {color: "blue", dash: "dash"},
        showlegend: false
      };
      let myTrace6 = {
        x: [R12,R12],
        y: [-10,10],
        mode: 'line',
        name: "Cavity Alignment",
        line: {color: "blue", dash: "dash"},
        showlegend: false
      };
      let myTrace7 = 0;
      let myTrace8 = 0;

      if (cavity.mright.roc < cavity.mleft.roc && cavity.mleft.roc != 0) {
        myTrace7 = {
        x: [0,R2],
        y: [1,1],
        mode: 'scatter',
        name: "Cavity Alignment",
        line: {color: "#ffffffff", dash: "none"},
        showlegend: false,
        fill: 'tozeroy',
        fillcolor: "#75bbffbf"
      };
       myTrace8 = {
        x: [R1,R12],
        y: [1,1],
        mode: 'scatter',
        name: "Cavity Alignment",
        line: {color: "#ffffffff", dash: "none"},
        showlegend: false,
        fill: 'tozeroy',
        fillcolor: "#75bbffbf"
      };
      } else if (cavity.mright.roc >= cavity.mleft.roc && cavity.mleft.roc != 0) {
         myTrace7 = {
        x: [0,R1],
        y: [1,1],
        mode: 'scatter',
        name: "Cavity Alignment",
        line: {color: "#ffffffff", dash: "none"},
        showlegend: false,
        fill: 'tozeroy',
        fillcolor: "#75bbffbf"
      };
       myTrace8 = {
        x: [R12,R2],
        y: [1,1],
        mode: 'scatter',
        name: "Cavity Alignment",
        line: {color: "#ffffffff", dash: "none"},
        showlegend: false,
        fill: 'tozeroy',
        fillcolor: "#75bbffbf"
      };
      } else if (cavity.mleft.roc === 0) {
        myTrace7 = {
        x: [0,R2],
        y: [1,1],
        mode: 'scatter',
        name: "Cavity Alignment",
        line: {color: "#ffffffff", dash: "none"},
        showlegend: false,
        fill: 'tozeroy',
        fillcolor: "#75bbffbf"
      }; myTrace8 = {
        x: [10],
        y: [4],        showlegend: false
      };
      }
      

      let pLayout = {
        title:'Stabilitätsdiagramm dieser Spiegelkonfiguration',
        xaxis: {range: [-19, x],fixedrange: true, title: 'Länge des Resonators / mm',
            titlefont: {
                  family: 'Arial, sans-serif',
                  size: 18,
                  color: 'lightgrey'
            }},
        yaxis: {range: [-0.2, 1.4],fixedrange: false, title: 'g1*g2',
        titlefont: {
                  family: 'Arial, sans-serif',
                  size: 18,
                  color: 'lightgrey'
            }},
        width: 550,
        height: 350,
        margin: {b:45}
      };

      //console.log(x,cavity.mright.roc , math.abs(cavity.mleft.roc));

      let pData = [myTrace7,myTrace8,myTrace1, myTrace2,myTrace3,myTrace4,myTrace5,myTrace6];
      Plotly.newPlot('plotlyDiv', pData, pLayout, pConfig);
}

// setTimeout(function(){
//       console.log('drin');
//       trace4 = {
//         x: [-0.5],
//         y: [1],
//         mode: 'scatter'
//       };
//       data = [ trace1, trace2, trace4];
//       Plotly.newPlot('plotlyDiv', data, layout);
// },4000);

