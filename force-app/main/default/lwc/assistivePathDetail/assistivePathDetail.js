import { LightningElement, api, wire, track } from 'lwc';
import getAssistivePathById from '@salesforce/apex/AssistivePathListController.getAssistivePathById';
import getAssistivePathLogicByObjectName from '@salesforce/apex/AssistivePathListController.getAssistivePathLogicByObjectName';

export default class AssistivePathDetail extends LightningElement {
    @api recordId;
    @track assistivePath;
    @track assistivePathLogics;
    error;
    steps = [
        { label: 'Step 1', value: 'step1' },
        { label: 'Step 2', value: 'step2' },
        { label: 'Step 3', value: 'step3' }
    ];

    @wire(getAssistivePathById, { recordId: '$recordId' })
    wiredAssistivePath({ data, error }) {
        if (data) {
            this.assistivePath = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.assistivePath = undefined;
        }
    }
    handleBack() {
        const backEvent = new CustomEvent('handleback');
        this.dispatchEvent(backEvent);
    }
    @wire(getAssistivePathLogicByObjectName, { objectName: '$assistivePath.Object_Name__c' })
    wiredAssistivePathLogic({ data, error }) {
        if (data) {
            this.assistivePathLogics = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.assistivePathLogic = undefined;
        }};

}
