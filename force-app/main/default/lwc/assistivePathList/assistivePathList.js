import { LightningElement, wire, track } from 'lwc';
import getAssistivePaths from '@salesforce/apex/AssistivePathListController.getAssistivePaths';

export default class AssistivePathList extends LightningElement {
    @track assistivePaths = [];

    columns = [
        { label: 'Master Label', fieldName: 'MasterLabel', type: 'text' },
        { label: 'Object Name', fieldName: 'Object_Name__c', type: 'text' },
        { label: 'Active', fieldName: 'Is_Active__c', type: 'boolean' },
        {
            type: 'button',
            typeAttributes: {
                label: 'View',
                name: 'view',
                title: 'View',
                variant: 'brand',
                iconPosition: 'left'
            }
        }
    ];
    @wire(getAssistivePaths)
    wiredPaths({ error, data }) {
        if (data) {
            this.assistivePaths = data;
        } else if (error) {
            console.error('Error loading assistive paths:', error);
        }
    }

    handleRowAction(event) {
        const row = event.detail.row;
        const recordId = row.Id;

        // Dispatch a custom event or navigate programmatically
        const navigateEvent = new CustomEvent('viewrecord', {
            detail: { recordId }
        });
        this.dispatchEvent(navigateEvent);
    }
}