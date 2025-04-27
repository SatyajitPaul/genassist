import { LightningElement, track } from 'lwc';

export default class LlmSelector extends LightningElement {
    @track selectedValue = '';
    @track llmOptions = [
        { label: 'LLM Option One', value: 'LLM_Option_One' },
        { label: 'LLM Option Two', value: 'LLM_Option_Two' }
        // This will later come from custom metadata
    ];

    handleChange(event) {
        this.selectedValue = event.detail.value;
    }

    handleSend() {
        if (!this.selectedValue) {
            // You can add toast or error
            console.error('LLM Name should not be blank');
            return;
        }

        // Logic to send the selected LLM to the backend
        console.log('Selected LLM:', this.selectedValue);
    }
    
    renderedCallback(){
        if(this.llmOptions.length > 0 && !this.selectedValue){
            // Set the default value to the first option
            this.template.querySelector('lightning-combobox').value = this.llmOptions[0].value;
        }
    }
    
}