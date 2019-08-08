(function(){

    let mediaRecorder = null;
    let timer = null;

    chrome.runtime.onInstalled.addListener(function() {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {hostEquals: 'developer.chrome.com'}
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }]);
        });
    
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                switch(request.type) {
                    case 'tab': 
                        if(request.recording) {
                            chrome.tabCapture.capture({audio: false, video: true}, startRecordTab)
                            sendResponse({message: 'Recording Started...'});
                        } else {
                            stopRecording();
                            sendResponse('Complete!');
                        }
                        break;
                    case 'screen':
                        if(request.recording) {
                            chrome.desktopCapture.chooseDesktopMedia(['screen'], startRecordScreen);
                            sendResponse({message: 'Recording Started...'});
                        } else {
                            stopRecording();
                            sendResponse('Complete!');
                        }
                        break;
                    case 'checkRecording':
                        if(mediaRecorder != null && typeof mediaRecorder === 'object') {
                            sendResponse({recordingInProcess: true});
                        }
                        break;
                    default:
                        break;
                }
            });
      });
    
    
      function startRecordScreen(screenID) {
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: screenID
                }
            }
        })
        .then(function(stream) {
            startRecording(stream);
        }).catch(function(err) {
            console.error(err);
        });
        
    }

    function startRecording(stream) {
        let chunks = [];
        let videoUrl;
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        mediaRecorder.requestData();
        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        }
        mediaRecorder.onstop = function() {
            stream.getVideoTracks().forEach(track => track.stop());
            let blob = new Blob(chunks);
            chunks = [];
            videoUrl = URL.createObjectURL(blob);
            const showVideo = window.open('showVideo.html');
            showVideo.onload = function(evt) {
                const doc = evt.target;
                const video = doc.getElementById('video');
                video.src = videoUrl;
                mediaRecorder = null;
            }
        }
        stream.getVideoTracks()[0].onended = function() {
            stopRecording();
        }
        let seconds = 0;
        timer = setInterval(function() {
            seconds++;
            chrome.runtime.sendMessage({seconds}, function(response) {
                var lastError = chrome.runtime.lastError;
                if(lastError) {
                    console.log(lastError);
                    return;
                } else {
                    console.log(response);
                }
            });
        }, 1000);
    }

    function startRecordTab(stream) {
        startRecording(stream);
    }

    function stopRecording() {
        mediaRecorder.stop();
        clearInterval(timer);
    };

})()
