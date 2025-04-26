import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SpeechManager from './speechManager';

export default class TextChat extends LightningElement {
    @track messageText = '';
    @track isMuted = false;
    @track isListening = false;

    // Public properties that can be set by parent components
    @api placeholderText = 'Start typing';
    @api maxAttachmentSize = 5; // In MB
    @api showMuteButton = false;
    @api sendLabel = 'Send Message';
    
    // Expose events to parent components
    @api messageSentEvent = new CustomEvent('messagesent');
    @api attachmentEvent = new CustomEvent('attachment');
    @api muteToggleEvent = new CustomEvent('mutetoggle');


    speechManager = new SpeechManager();
    connectedCallback() {
        const speechInitialized = this.speechManager.initialize(
            // onTranscriptReceived
            (transcript) => {
                this.messageText = transcript;
            },
            // onListeningStateChange
            (isListening) => {
                this.isListening = isListening;
            },
            // onError
            (error) => {
                this.showToast('Error', 'Failed to recognize speech. Please try again.', 'error');
            }
        );
    }

    get muteButtonIcon() {
        return this.isListening ? 'utility:unmuted' : 'utility:muted';
    }

    get muteButtonLabel() {
        return this.isListening ? 'Listening' : 'Muted';
    }

    get isMessageEmpty() {
        return !this.messageText || this.messageText.trim() === '';
    }
    get listeningVariant() {
        return this.isListening ? 'brand' : 'neutral';
    }

    handleMessageChange(event) {
        this.messageText = event.target.value;
    }

    handleKeyUp(event) {
        // Send message on Enter key (unless Shift is pressed for new line)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage();
        }
    }

    handleSendMessage() {
        if (this.isMessageEmpty) {
            return;
        }

        // Create custom event with message data
        const messageEvent = new CustomEvent('messagesent', {
            detail: {
                message: this.messageText,
                timestamp: new Date().toISOString()
            }
        });
        
        // Dispatch the event
        this.dispatchEvent(messageEvent);
        
        // Clear the input
        this.messageText = '';
    }
    startVoiceInput(){
        this.isListening = true;
        const success = this.speechManager.toggleVoiceInput();
        
        if (!success && !this.speechManager.isSupported()) {
            this.showToast('Error', 'Speech recognition is not supported in this browser.', 'error');
        }

    }

    // toggleMute() {
    //     this.isMuted = !this.isMuted;
        
    //     // Create custom event for mute toggle
    //     const muteEvent = new CustomEvent('mutetoggle', {
    //         detail: {
    //             muted: this.isMuted
    //         }
    //     });
        
    //     this.dispatchEvent(muteEvent);
    // }

    handleAttachmentClick() {
        // Create file input programmatically
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';
        
        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            
            if (files.length > 0) {
                const fileData = [];
                let filesTooLarge = [];
                
                // Process each selected file
                Array.from(files).forEach(file => {
                    // Check file size
                    const fileSizeInMB = file.size / (1024 * 1024);
                    
                    if (fileSizeInMB > this.maxAttachmentSize) {
                        filesTooLarge.push(file.name);
                    } else {
                        fileData.push({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            file: file // Include the file object
                        });
                    }
                });
                
                // Show warning for files that are too large
                if (filesTooLarge.length > 0) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Files too large',
                            message: `The following files exceed the ${this.maxAttachmentSize}MB limit: ${filesTooLarge.join(', ')}`,
                            variant: 'warning'
                        })
                    );
                }
                
                // If we have valid files to upload
                if (fileData.length > 0) {
                    // Create custom event with file data
                    const attachmentEvent = new CustomEvent('attachment', {
                        detail: {
                            files: fileData
                        }
                    });
                    
                    this.dispatchEvent(attachmentEvent);
                }
            }
        });
        
        // Trigger click on the file input
        fileInput.click();
    }
}