(function() {
    let screenButton = document.getElementById('screenButton')
    let tabButton = document.getElementById('tabButton')
    let stopButton = document.getElementById('stopButton');
    screenButton.addEventListener('click', recordScreen, false);
    tabButton.addEventListener('click', recordTab, false);
    
    chrome.runtime.sendMessage({type: 'checkRecording', recording: false}, function(response) {
        if(response && response.recordingInProcess) {
            screenButton.setAttribute('hidden', 'true');
            tabButton.setAttribute('hidden', 'true');
            stopButton.removeAttribute('hidden');
            stopButton.addEventListener('click', stopScreenRecording);
        }        
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log(sender);
        document.getElementById('timer').innerHTML = request.seconds ? request.seconds : '';
        sendResponse('Ok')
    })
    
    function recordScreen() {
        chrome.runtime.sendMessage({type: 'screen', recording: true}, function(response) {
            console.log(response);
          });

        screenButton.setAttribute('hidden', 'true');
        tabButton.setAttribute('hidden', 'true');
        stopButton.removeAttribute('hidden');
        stopButton.addEventListener('click', stopScreenRecording);  
    }

    function recordTab() {
        chrome.runtime.sendMessage({type: 'tab', recording: true}, function(response) {
            console.log(response);
                screenButton.setAttribute('hidden', 'true');
                tabButton.setAttribute('hidden', 'true');
                stopButton.removeAttribute('hidden');
                stopButton.addEventListener('click', stopTabRecording);
          });

    }


    function stopScreenRecording() {
        chrome.runtime.sendMessage({type: 'screen', recording: false}, function(response) {
            console.log(response);
        })
    }

    function stopTabRecording() {
        chrome.runtime.sendMessage({type: 'tab', recording: false}, function(response) {
            console.log(response);
          });
    }

    
})();
