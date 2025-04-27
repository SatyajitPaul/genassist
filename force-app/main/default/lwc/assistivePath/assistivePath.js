import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getAssistivePathLogic from '@salesforce/apex/AssistivePathController.getAssistivePathLogic';
import getAIAssistiveAnalysis from '@salesforce/apex/AssistivePathController.getAIAssistiveAnalysis';
import performAnalysis from '@salesforce/apex/AssistivePathController.performAnalysis';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class AssistivePath extends LightningElement {
    @api recordId;
    @api objectApiName;   // Require object API name as input
    @api fieldApiName;

    @track fieldValue;
    @track error;
    @track lastAnalyzedValue;
    @track isLoading = false;
    @track lastAnalyzedTime;

    isLastAnalyzed=false;
    isAnalysisComplete = false;
    @track isAnalysisable = false;

    get fieldPath() {
        return this.objectApiName && this.fieldApiName
            ? [`${this.objectApiName}.${this.fieldApiName}`]
            : [];
    }
    @wire(getAIAssistiveAnalysis, { objectName: '$objectApiName', triggerFieldAPI: '$fieldApiName', triggerValue: '$fieldValue', recordId: '$recordId' })
    wiredAIAssistiveAnalysis({ error, data }) {
        if (data) {
            this.isLoading = false;
            this.isAnalysisComplete = true;
            this.lastAnalyzedValue = data.Analysis__c;
            this.lastAnalyzedTime = data.CreatedDate;
            this.isLastAnalyzed = true;
            this.error = undefined;
        } else if (error) {
            this.isLoading = false;
            this.isAnalysisComplete = false;
            this.error = 'Error loading assistive analysis: ' + error?.body?.message;
        }
    }
    @wire(getAssistivePathLogic, {triggerObject: '$objectApiName', triggerField: '$fieldApiName', triggerValue: '$fieldValue'})
    wiredAssistivePath({ error, data }) {
        if (data) {

            this.isAnalysisable = true;
            this.error = undefined;
        } else if (error) {

            this.isAnalysisable = false;
            this.error = 'Error loading assistive path logic: ' + error?.body?.message;
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$fieldPath' })
    wiredRecord({ data, error }) {
        if (data) {
            const fullFieldPath = `${this.objectApiName}.${this.fieldApiName}`;
            this.fieldValue = getFieldValue(data, fullFieldPath);
            this.error = undefined;
        } else if (error) {
            this.error = 'Error loading record or field: ' + error?.body?.message;
            this.fieldValue = undefined;
        }
    }
    get analyzedResponse(){
        if(!this.isLastAnalyzed){
            return ' <h3 style="color: red;">No analysis has been performed yet for this record.</h3>';
        }
        return this.lastAnalyzedValue;
    }
    performeAnalysis() {
        this.isLoading = true;
        this.isLastAnalyzed = false;
        this.isAnalysisComplete = false;
        this.isAnalysisable = false;
        this.lastAnalyzedValue = undefined;
        performAnalysis({ objectName: this.objectApiName, triggerFieldAPI: this.fieldApiName, triggerValue: this.fieldValue, recordId: this.recordId })
            .then((result) => {
                this.isLoading = false;
                this.lastAnalyzedValue = result.Analysis__c;
                this.lastAnalyzedTime = result.CreatedDate || new Date().toLocaleString();
                this.isLastAnalyzed = true;
                this.isAnalysisComplete = true;
                this.isAnalysisable = true;
                const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Analysis performed successfully.',
                    variant: 'success',
                });
                this.dispatchEvent(evt);
            }
            )
            .catch((error) => {
                this.isLoading = false;
                this.isLastAnalyzed = false;
                this.isAnalysisComplete = false;
                this.isAnalysisable = true;
                this.error = 'Error performing analysis: ' + error?.body?.message;
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Error performing analysis: ' + error?.body?.message,
                    variant: 'error',
                });
                this.dispatchEvent(evt);
            }
            );
            
    }
}
