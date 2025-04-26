/**
 * @description Module for managing chat messages and rendering
 */
import { speakText, stopSpeaking } from './utils/speechUtils';

export default class MessageManager {
    messages = [];
    messageCounter = 0;
    isSpeaking = false;
    currentSpeakingMessageId = null;
    
    /**
     * Add a user message to the chat
     * @param {String} message - Message text
     * @returns {Object} Added message object
     */
    addUserMessage(message) {
        this.messageCounter++;
        const newMessage = {
            id: `msg-${this.messageCounter}`,
            text: message,
            type: 'user',
            timestamp: new Date().toISOString()
        };
        this.messages.push(newMessage);
        return newMessage;
    }
    
    /**
     * Add an AI message to the chat
     * @param {String} message - Message text
     * @returns {Object} Added message object
     */
    addAiMessage(message) {
        this.messageCounter++;
        const newMessage = {
            id: `msg-${this.messageCounter}`,
            text: message,
            type: 'ai',
            timestamp: new Date().toISOString()
        };
        this.messages.push(newMessage);
        return newMessage;
    }
    
    /**
     * Clear all messages except the welcome message
     */
    clearMessages() {
        // Stop any ongoing speech
        this.stopSpeaking();
        
        // Clear all messages except the welcome message
        this.messageCounter = 1;
        this.messages = [{
            id: 'msg-1',
            text: "Hello! I'm Gen Assist. How can I help you today?",
            type: 'ai',
            timestamp: new Date().toISOString()
        }];
    }
    
    /**
     * Render messages to the DOM
     * @param {HTMLElement} container - Container element for messages
     * @param {Function} handleSpeakerClick - Function to handle speaker icon clicks
     * @returns {Boolean} Whether rendering was performed
     */
    renderMessages(container) {
        if (!container) return false;
        
        // Only render if the DOM is empty or we have new messages
        if (container.childElementCount === 0 || container.childElementCount !== this.messages.length) {
            // Clear existing messages
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            
            // Create document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Render all messages
            this.messages.forEach(message => {
                const messageEl = document.createElement('div');
                messageEl.className = `message ${message.type}-message`;
                messageEl.dataset.id = message.id;
                
                if (message.type === 'ai') {
                    // AI message with speaker icon
                    const contentWrapper = document.createElement('div');
                    contentWrapper.className = 'message-content';
                    
                    const textEl = document.createElement('div');
                    textEl.className = 'message-text';
                    textEl.innerText = message.text;
                    
                    const speakerIcon = document.createElement('button');
                    speakerIcon.className = 'speaker-icon';
                    speakerIcon.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                    `;
                    speakerIcon.dataset.messageId = message.id;
                    
                    contentWrapper.appendChild(textEl);
                    contentWrapper.appendChild(speakerIcon);
                    messageEl.appendChild(contentWrapper);
                } else {
                    // User message
                    const textEl = document.createElement('div');
                    textEl.className = 'message-text';
                    textEl.innerText = message.text;
                    messageEl.appendChild(textEl);
                }
                
                fragment.appendChild(messageEl);
            });
            
            container.appendChild(fragment);
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle click on a speaker icon
     * @param {String} messageId - ID of the message
     */
    handleSpeakerClick(messageId) {
        // If already speaking this message, stop it
        if (this.isSpeaking && this.currentSpeakingMessageId === messageId) {
            this.stopSpeaking();
            return;
        }
        
        // If speaking another message, stop it first
        if (this.isSpeaking) {
            this.stopSpeaking();
        }
        
        // Start speaking this message
        this.speakMessage(messageId);
    }
    
    /**
     * Speak a message
     * @param {String} messageId - ID of the message to speak
     * @param {HTMLElement} container - Container element for messages
     */
    speakMessage(messageId, container) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        this.currentSpeakingMessageId = messageId;
        this.isSpeaking = true;
        
        // Update the UI to show the message is being spoken
        if (container) {
            const speakerIcon = container.querySelector(`.speaker-icon[data-message-id="${messageId}"]`);
            if (speakerIcon) {
                speakerIcon.classList.add('speaking');
            }
        }
        
        // Use the speakText utility function
        speakText(
            message.text,
            () => {
                // onStart callback
                this.isSpeaking = true;
            },
            () => {
                // onEnd callback
                this.isSpeaking = false;
                this.currentSpeakingMessageId = null;
                
                // Update the UI
                if (container) {
                    const speakerIcon = container.querySelector(`.speaker-icon[data-message-id="${messageId}"]`);
                    if (speakerIcon) {
                        speakerIcon.classList.remove('speaking');
                    }
                }
            },
            { rate: 1.0, pitch: 1.0 }
        );
    }
    
    /**
     * Stop speaking
     * @param {HTMLElement} container - Container element for messages
     */
    stopSpeaking(container) {
        // Use the stopSpeaking utility function
        stopSpeaking();
        
        // Update the UI
        if (this.currentSpeakingMessageId && container) {
            const speakerIcon = container.querySelector(`.speaker-icon[data-message-id="${this.currentSpeakingMessageId}"]`);
            if (speakerIcon) {
                speakerIcon.classList.remove('speaking');
            }
        }
        
        this.isSpeaking = false;
        this.currentSpeakingMessageId = null;
    }
    
    /**
     * Scroll the message container to the bottom
     * @param {HTMLElement} container - Message container element
     */
    scrollToBottom(container) {
        if (container) {
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    }
    
    /**
     * Get all messages
     * @returns {Array} Array of message objects
     */
    getMessages() {
        return this.messages;
    }
}