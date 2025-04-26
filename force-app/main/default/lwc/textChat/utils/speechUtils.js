const speakText = (text, onStart = () =>{}, onEnd = () => {}, options={}) => {
    if(!window.speechSynthesis) {
        console.error('Speech synthesis not supported in this browser.');
        return;
    }
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);

    const defaultOptions = {
        pitch: 1,
        rate: 1,
        volume: 1,
        lang: 'en-US'
    };

    const speechOptions = { ...defaultOptions, ...options };
    utterance.pitch = speechOptions.pitch;
    utterance.rate = speechOptions.rate;
    utterance.volume = speechOptions.volume;
    utterance.lang = speechOptions.lang;

    const voices = window.speechSynthesis.getVoices();
    if(voices.length > 0) {
        if(speechOptions.voice){
            utterance.voice = voices.find(voice => voice.name === speechOptions.voice) || selectPreferredVoice(voices);
        }else{
            utterance.voice = selectPreferredVoice(voices);
        }
    }
    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        onEnd();
    };
    window.speechSynthesis.speak(utterance);
    return true;
};

const stopSpeaking = () => {
    if(window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

const getAvailableVoices = () => {
    return new Promise((resolve) => {
        if (window.speechSynthesis) {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                resolve(voices);
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    resolve(window.speechSynthesis.getVoices());
                };
            }
        } else {
            resolve([]);
        }
    });
}

const initSpeechRecognition = () =>{
    if(window.SpeechRecognition || window.webkitSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        return recognition;
    }
    return null;
}

const configureSpeechRecognition = (recognition, options = {}) => {
    if(!recognition) {
        console.error('Speech recognition not supported in this browser.');
        return;
    }
    const defaultOptions = {
        lang: 'en-US',
        continuous: false,
        interimResults: false,
        maxAlternatives: 1
    };
    const recognitionOptions = { ...defaultOptions, ...options };
    recognition.lang = recognitionOptions.lang;
    recognition.continuous = recognitionOptions.continuous;
    recognition.interimResults = recognitionOptions.interimResults;
    recognition.maxAlternatives = recognitionOptions.maxAlternatives;
}

const preferredVoices = [
    'Samantha',
    'Google US English',
    'Microsoft Zira Desktop - English (United States)', 
    'Google UK English Male'];

const selectPreferredVoice = (voices) => {
    const preferredVoice = voices.find(voice => preferredVoices.includes(voice.name));
    return preferredVoice || voices[0]; // Fallback to the first available voice
}

export {
    speakText,
    stopSpeaking,
    getAvailableVoices,
    initSpeechRecognition,
    configureSpeechRecognition
};