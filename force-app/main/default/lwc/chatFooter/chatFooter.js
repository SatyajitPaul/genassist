import { LightningElement, track } from 'lwc';

export default class ChatFooter extends LightningElement {
    @track isPrompt = false;
    handlePromptClick() {
        this.isPrompt = true;
        const promptEvent = new CustomEvent('prompttoggle', {
            detail: { isPrompt: this.isPrompt }
        });
        this.dispatchEvent(promptEvent);
    }
    handleChatClick(){
        this.isPrompt = false;
        const chatEvent = new CustomEvent('chattoggle', {
            detail: { isPrompt: this.isPrompt }
        });
        this.dispatchEvent(chatEvent);
    }
    get promptVariant(){
        return this.isPrompt ? 'brand' : 'neutral';
    }
    get chatVariant(){
        return this.isPrompt ? 'neutral' : 'brand';
    }
}