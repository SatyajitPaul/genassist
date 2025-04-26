import { LightningElement, api } from 'lwc';

export default class AiMessage extends LightningElement {
    @api id = '';
    @api message = '';
    @api llm = '';
    @api timestamp = '';
    @api isError = false;
    @api isLoading = false;

    
    formattedTimestamp = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: true
      }).format(Date.now());

    speakMessage() {
        const utterance = new SpeechSynthesisUtterance(this.message);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }

}