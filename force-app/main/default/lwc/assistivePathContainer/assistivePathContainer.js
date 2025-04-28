import { LightningElement, track } from 'lwc';

export default class AssistivePathContainer extends LightningElement {
    @track selectedRecordId;


    handleViewRecord(event) {
        this.isDetailsPage = true;
        this.selectedRecordId = event.detail.recordId;
    }

    handleBack() {
        this.selectedRecordId = undefined;
    }
}
