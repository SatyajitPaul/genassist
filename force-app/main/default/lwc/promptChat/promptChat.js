import { LightningElement, wire, track } from 'lwc';
import { getPageReference } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import sendMetadataToBackend from '@salesforce/apex/PromptChatController.sendMetadataToBackend';

export default class PromptChat extends LightningElement {
    @track selectedValue = '';
    @track metadataOptions = [
        { label: 'Option One', value: 'Option_One' },
        { label: 'Option Two', value: 'Option_Two' }
        // This will later come from custom metadata
    ];

    @wire(CurrentPageReference) pageRef;

    handleChange(event) {
        this.selectedValue = event.detail.value;
    }

    handleSend() {
        if (!this.selectedValue) {
            // You can add toast or error
            console.error('Custom Metadata Name should not be blank');
            return;
        }

        const pageRef = this.pageRef;
        const recordId = pageRef?.state?.recordId || null;
        const isRecordPage = !!recordId;

        sendMetadataToBackend({
            metadataDevName: this.selectedValue,
            isRecordPage: isRecordPage,
            recordId: recordId
        })
        .then(result => {
            console.log('Backend response:', result);
        })
        .catch(error => {
            console.error('Error sending data to backend:', error);
        });
    }
}