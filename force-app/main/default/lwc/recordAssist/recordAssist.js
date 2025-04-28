import { LightningElement, api, track } from 'lwc';

export default class RecordAssist extends LightningElement {
    @api recordId;
    @api objectApiName;   // Require object API name as input
    @api fieldApiName;

    @track isPrompt = false;
}