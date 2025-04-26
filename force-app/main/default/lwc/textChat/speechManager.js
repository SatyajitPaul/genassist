/**
 * @description Module for managing speech recognition
 */
import { initSpeechRecognition, configureSpeechRecognition } from './utils/speechUtils';

export default class SpeechManager {
    speechRecognition = null;
    isListening = false;
    
    /**
     * Initialize speech recognition
     * @param {Function} onTranscriptReceived - Callback when transcript is received
     * @param {Function} onListeningStateChange - Callback when listening state changes
     * @param {Function} onError - Callback when error occurs
     */
    initialize(onTranscriptReceived, onListeningStateChange, onError) {
        this.speechRecognition = initSpeechRecognition();
        
        if (this.speechRecognition) {
            configureSpeechRecognition(this.speechRecognition, {
                continuous: false,
                interimResults: false
            });
            
            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (onTranscriptReceived) {
                    onTranscriptReceived(transcript);
                }
            };
            
            this.speechRecognition.onend = () => {
                this.isListening = false;
                if (onListeningStateChange) {
                    onListeningStateChange(false);
                }
            };
            
            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                if (onListeningStateChange) {
                    onListeningStateChange(false);
                }
                if (onError) {
                    onError(event.error);
                }
            };
        }
        
        return this.speechRecognition !== null;
    }
    
    /**
     * Toggle voice input on/off
     * @returns {Boolean} New listening state
     */
    toggleVoiceInput() {
        if (!this.speechRecognition) {
            return false;
        }
        
        if (!this.isListening) {
            try {
                this.isListening = true;
                this.speechRecognition.start();
                return true;
            } catch (error) {
                console.error('Speech recognition error:', error);
                this.isListening = false;
                return false;
            }
        } else {
            this.isListening = false;
            this.speechRecognition.stop();
            return false;
        }
    }
    
    /**
     * Check if speech recognition is supported
     * @returns {Boolean} Whether speech recognition is supported
     */
    isSupported() {
        return this.speechRecognition !== null;
    }
    
    /**
     * Check if currently listening
     * @returns {Boolean} Whether currently listening
     */
    getListeningState() {
        return this.isListening;
    }
}