
//xử lý phần visualizer
var canvas,
    ctx,
    source,
    context,
    analyser,
    fbc_array,
    hue,
    bar_count,
    bar_pos,
    bar_width,
    bar_height,
    objectUrl;
   

       var audio = document.getElementById("audio");
       var sourceAudio = document.getElementById("audioSrc");
       audio.controls = true;
       audio.loop = false;
       audio.autoplay = false;
     
    var  changeFile  = function(event){
    var file = event.currentTarget.files[0];
        var url = file.urn || file.name;
          ID3.loadTags(url, function() {
        showTags(url);
       }, {
        tags: ["title","artist","album","picture"],
        dataReader: FileAPIReader(file)
       });
       context.resume().then(() => {  
       
       objectUrl = URL.createObjectURL(file);
       sourceAudio.src = objectUrl;       
       audio.load();
       audio.play();
       });

    };
    
     function showTags(url) {
      var tags = ID3.getAllTags(url);
      document.getElementById('title').textContent = tags.title || "";
      document.getElementById('artist').textContent = tags.artist || "";
      document.getElementById('album').textContent = tags.album || "";
      var image = tags.picture;
      if (image) {
        var base64String = "";
        for (var i = 0; i < image.data.length; i++) {
            base64String += String.fromCharCode(image.data[i]);
        }
        var base64 = "data:" + image.format + ";base64," +
                window.btoa(base64String);
        document.getElementById('picture').setAttribute('src',base64);
        document.getElementById('picture').style.display = "block";
      } else {
        document.getElementById('picture').style.display = "none";
      }
    }


    window.addEventListener(
    "load",
    function() {

        context = new AudioContext();
        analyser = context.createAnalyser();
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        source = context.createMediaElementSource(audio);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        source.connect(analyser);
        analyser.connect(context.destination);

        init();
        FrameLooper();
    },
    false
    );

function FrameLooper() {
    window.RequestAnimationFrame =
        window.requestAnimationFrame(FrameLooper) ||
        window.msRequestAnimationFrame(FrameLooper) ||
        window.mozRequestAnimationFrame(FrameLooper) ||
        window.webkitRequestAnimationFrame(FrameLooper);

    fbc_array = new Uint8Array(analyser.frequencyBinCount);
    bar_count = analyser.frequencyBinCount;
    analyser.getByteFrequencyData(fbc_array);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    for (var i = 0; i < bar_count; i+=1) {
        bar_pos = i * 5;
        bar_width = 3;
        if(i%2==0)
        bar_height = -(fbc_array[i]*2);
        else
        bar_height = -(fbc_array[i]/2);
        hue = i/bar_count*360+i;
        if(hue>=345)
        hue = hue-345;
        ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        ctx.fillRect(bar_pos, canvas.height, bar_width, bar_height);
        ctx.beginPath();
        var cx=Math.random()*(fbc_array[i]/5*canvas.width);
        var cy=Math.random()*(fbc_array[i]/5*canvas.height);
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,2,0,Math.PI*2);   
       
        ctx.fill();
    }

    
}

//xử lý phần equalizer
  function addSlider(name) {
    var controls = document.getElementById("controls");

    var divName = name + "Slider";


    var sliderText = '<div> <input id="' + divName + '" '
     + 'type="range" min="0" max="1" step="0.01" value="0" style="height: 20px; width: 200px;"> <span id="'
     + name
     + '-value" style="position:relative; top:-5px;">'
     + name
     + '</span> </div> <br>  ';

    controls.innerHTML = controls.innerHTML + sliderText;
  }

  function configureSlider(name, value, min, max, handler) {
     
      var divName = name + "Slider";
      var slider = document.getElementById(divName);
      slider.min = min;
      slider.max = max;
      slider.value = value;
      slider.oninput = function() { handler(0, this); };
  }

var filter;
var frequency = 2000;
var resonance = 5;
var gain = 2;


function frequencyHandler(event,ui) { 
  var value = ui.value;
  var nyquist = context.sampleRate * 0.5;
  var noctaves = Math.log(nyquist / 10.0) / Math.LN2;
  var v2 = Math.pow(2.0, noctaves * (value - 1.0));
  var cutoff = v2*nyquist;  
  var info = document.getElementById("frequency-value");
  info.innerHTML = "frequency = " + (Math.floor(cutoff*100)/100) + " Hz";
  filter.frequency.value = cutoff;
 
}

function resonanceHandler(event,ui) {
   var value = ui.value;
  var info = document.getElementById("Q-value");
  info.innerHTML = "Q = " + (Math.floor(value*100)/100) + " dB";
  filter.Q.value = value;
  
}

function gainHandler(event,ui) {
  var value = ui.value;
  var info = document.getElementById("gain-value");
  info.innerHTML = "gain = " + (Math.floor(value*100)/100);  
  filter.gain.value = value;
  
}


function initAudio() {
    filter = context.createBiquadFilter();
    filter.Q.value = 5;
    filter.frequency.value = 2000;
    filter.gain.value = 2;
   
}

function init() {
    initAudio();      
    addSlider("frequency");
    addSlider("Q");
    addSlider("gain");    
    configureSlider("frequency", .68, 0, 1, frequencyHandler);
    configureSlider("Q", resonance, 0, 20, resonanceHandler);
    configureSlider("gain", gain, 0, 5, gainHandler);
   
}

function changeFilterType( value ) {
  filter.type = value;
}


function toggleFilter() {
   var checkBox = document.getElementById("onFilter");
  if (checkBox.checked==false) {
   
   
    analyser.disconnect(context.destination);
    filter.disconnect(analyser);
    source.disconnect(filter);
    source.connect(analyser);
    analyser.connect(context.destination);
    

  } else {
    
    analyser.disconnect(context.destination);
    source.disconnect(analyser);
    source.connect(filter);
    filter.connect(analyser);
    analyser.connect(context.destination);
 
  }
};