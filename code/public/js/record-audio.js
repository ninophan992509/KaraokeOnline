'use strict';
    
       var context ,source, stream_dest, mediaStream, gainNode;
       var audio = document.querySelector("#audio");
       var sourceAudio = document.querySelector("#audioSrc");
       var file = document.querySelector('#file');
       audio.loop = false;
       audio.autoplay = false;

       window.onload = function()
       {
           btnStart.disabled = false;

           context = new AudioContext();
           source = context.createMediaElementSource(audio);
           
       }

       
       function stopAudio(audio) {
           if(audio.currentTime > 0){
            audio.pause();
            audio.currentTime = 0;
           }
           
        }
     
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
       
       var objectUrl = URL.createObjectURL(file);
       sourceAudio.src = objectUrl;       
       audio.load();
      
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

   var audioRecord = document.querySelector("#record"),
       audioContainer = document.querySelector("#audio-container"),
       btnStart = document.querySelector("#startRecord"),
       btnStop = document.querySelector("#stopRecord"),
       btnPause = document.querySelector("#pauseRecord"),
       btnResume = document.querySelector("#resumeRecord"),
       btnSave = document.querySelector("#saveRecord"),
       notify = document.querySelector("#alert"),
       mediaConstraints = {
         audio: true,
         video:false
       },
       mediaRecorder,
       recordedBlobs,
       index = 1;

       function  captureUserMedia(mediaConstraints, successCallback, errorCallback){
           navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
       }

       btnStart.onclick = function()
       {
           this.disabled = true;
           captureUserMedia(mediaConstraints,onMediaSuccess,onMediaError);
       }

       btnPause.onclick = function()
       {
           if(mediaRecorder!=null){
           this.disabled = true;
           btnResume.disabled = false;
           mediaRecorder.pause();
            audio.pause();
           notify.innerHTML ="Record paused!";
           }
           

       }

        btnResume.onclick = function()
       {
           if(mediaRecorder!=null){
           this.disabled = true;
           btnPause.disabled = false;
           mediaRecorder.resume();  
           audio.play();
           notify.innerHTML ="Recording...."; 
           }     
       }
       
       btnStop.onclick = function()
       {
           if(mediaRecorder!=null){
           this.disabled = true;
           btnPause.disabled = true;
           mediaRecorder.stop();
           stopAudio(audio);
           file.disabled = false;
           notify.innerHTML ="Record stopped";    
           btnStart.disabled = false;
           btnSave.disabled = false;
           btnResume.disabled = true;

               var a = document.createElement('a');
               var blob = new Blob(recordedBlobs, {type: 'audio/webm'});
               a.target = '_blank';
               a.innerHTML ="Recorded Audio No."+(index++);
               a.href = window.URL.createObjectURL(blob);
               audioContainer.appendChild(a);
               audioContainer.appendChild(document.createElement('hr'));
           }

       }

       btnSave.onclick = function()
       {
            if(mediaRecorder!=null){
            var fileExtension ="webm";
            var fileFullName = (Math.round(Math.random() * 9999999999) + 888888888) + '.' + fileExtension;
            this.disabled = true;
            var blob = new Blob(recordedBlobs, {type: 'auido/webm'});
            var url = window.URL.createObjectURL(blob);  
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileFullName;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
             document.body.removeChild(a);
             window.URL.revokeObjectURL(url);
            }, 100);
            }

       } 

       function onMediaSuccess(stream)
       {

          var merger = context.createChannelMerger(2);
          var splitter = context.createChannelSplitter(2);
          var channel1 = [0,1];
          var channel2 = [1,0];

           gainNode = context.createGain();
           gainNode.gain.value = 0.5;
           source.connect(gainNode);
           stream_dest = context.createMediaStreamDestination();
           gainNode.connect(splitter);
           splitter.connect(merger,channel1[0],channel1[1]);

           var microphone = context.createMediaStreamSource(stream);
           microphone.connect(splitter);
           splitter.connect(merger,channel2[0],channel2[1]);
           merger.connect(stream_dest);
           merger.connect(context.destination);


           var tracks=stream.getVideoTracks().concat(stream_dest.stream.getAudioTracks());
           mediaStream = new MediaStream(tracks);
           audioRecord.controls = false;
           window.stream = stream;
           audioRecord.srcObject = stream;
  
           audioRecord.play();
           btnPause.disabled = false;
           btnStop.disabled = false;   
           recordedBlobs = []; 
         
          var options = { audioBitsPerSecond : 128000, mimeType : 'audio/webm;codecs=opus'};
           try{   
              
             mediaRecorder = new MediaRecorder(mediaStream,options);
             mediaRecorder.ondataavailable = handleDataAvailable; 
             mediaRecorder.start(3000);
            
             if(audio.currentTime == 0)
             {
               audio.play();
             }
             file.disabled = true;
             notify.innerHTML ="Recording....";    
            } catch(e)
            { 
               alert("MediaRecorder is not supported by this browser.");
               notify.innerHTML ="Error....";    
               return;
            }

       }
    
       function handleDataAvailable(event)
       {
                if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
                }
               
       }
       function onMediaError(e)
       {
           alert(e);
       }



