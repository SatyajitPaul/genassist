import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import getAvailableLLMs from '@salesforce/apex/GenAssistController.getAvailableLLMs';
import getActivePromptTemplates from '@salesforce/apex/GenAssistController.getActivePromptTemplates';
import processUserInput from '@salesforce/apex/GenAssistController.processUserInput';
import getConversationHistory from '@salesforce/apex/GenAssistController.getConversationHistory';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import NAME_FIELD from '@salesforce/schema/User.Name';

// Import custom modules
import PageContextManager from './pageContextManager';
import MessageManager from './messageManager';
import SpeechManager from './speechManager';

export default class GenAssistChat extends NavigationMixin(LightningElement)  {
    @track userInput = '';
    @track selectedProvider;
    @track conversationHistory = [];
    @track providerOptions = [];
    @track isLoading = false;
    @track error;
    @track userName;

    // New for toggle/prompt
    @track isPromptMode = false;
    @track promptOptions = [];
    @track selectedPrompt = '';
    @track promptWarning = '';

    // Module instances
    pageContext = new PageContextManager();
    messageManager = new MessageManager();
    speechManager = new SpeechManager();

    connectedCallback() {
        this.loadProviders();
        this.loadConversationHistory();

        const speechInitialized = this.speechManager.initialize(
            // onTranscriptReceived
            (transcript) => {
                this.userInput = transcript;
            },
            // onListeningStateChange
            (isListening) => {
                this.isListening = isListening;
            },
            // onError
            (error) => {
                this.showToast('Error', 'Failed to recognize speech. Please try again.', 'error');
            }
        );
        
        // Add a welcome message
        setTimeout(() => {
            this.messageManager.addAiMessage("Hello! I'm Gen Assist. How can I help you today?");
        }, 500);
    }

    startVoiceInput() {
        const success = this.speechManager.toggleVoiceInput();
        
        if (!success && !this.speechManager.isSupported()) {
            this.showToast('Error', 'Speech recognition is not supported in this browser.', 'error');
        }
    }

    renderedCallback() {
        this.scrollToBottom();
    }

    async loadProviders() {
        try {
            const result = await getAvailableLLMs();
            this.providerOptions = result.map(p => ({
                label: p.Provider_Name__c,
                value: p.Id
            }));

            if (this.providerOptions.length > 0) {
                this.selectedProvider = this.providerOptions[0].value;
            }
        } catch (err) {
            this.error = 'Failed to load LLM providers.';
            console.error(err);
        }
    }

    async loadPromptTemplates() {
        try {
            const result = await getActivePromptTemplates();
            if (result && result.length > 0) {
                this.promptOptions = result.map(p => ({
                    label: p.Prompt_Label__c || p.MasterLabel,
                    value: p.Id,
                    full: p // Save full record for later use if needed
                }));
                this.selectedPrompt = this.promptOptions[0].value;
                this.promptWarning = '';
            } else {
                this.promptOptions = [];
                this.selectedPrompt = '';
                this.promptWarning = 'No Active Prompt for Current Context';
            }
        } catch (err) {
            this.promptOptions = [];
            this.selectedPrompt = '';
            this.promptWarning = 'No Active Prompt for Current Context';
            console.error(err);
        }
    }

    // Toggle between Action/Prompt
    // handleToggleMode(isPromptModeSelected) {
    //     this.isPromptMode = isPromptModeSelected;
    //     if (this.isPromptMode) {
    //         this.loadPromptTemplates();
    //     } else {
    //         this.promptWarning = '';
    //     }
    // }
    switchToPromptMode(){
        this.isPromptMode = true;
        this.loadPromptTemplates();
    }
    switchToActionMode(){
        this.isPromptMode = false;
        this.promptWarning = '';
    }
    get actionButtonVariant(){
        return this.isPromptMode ? 'neutral' : 'brand';
    }
    get promptButtonVariant(){
        return this.isPromptMode ? 'brand' : 'neutral';
    }

    handleProviderChange(event) {
        this.selectedProvider = event.detail.value;
    }

    handlePromptChange(event) {
        this.selectedPrompt = event.detail.value;
    }

    handleInputChange(event) {
        this.userInput = event.detail.value;
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!this.disableSend) {
                this.handleSend();
            }
        }
    }


    async handleSend() {
        if (this.disableSend) return;

        this.isLoading = true;
        this.error = null;

        try {
            let input = this.userInput;
            let instructionId = null;
            if (this.isPromptMode) {
                const selected = this.promptOptions.find(opt => opt.value === this.selectedPrompt);
                if (selected) {
                    input = selected.full.Prompt_Body__c;
                } else {
                    this.error = 'Please select a prompt.';
                    this.isLoading = false;
                    return;
                }
            }
            console.log('Input:', input);
            console.log('Context:', JSON.stringify(this.pageContext));
            const response = await processUserInput({
                input: "Context:"+JSON.stringify(this.pageContext)+"\n User Message:"+input,
                providerId: this.selectedProvider,
                instructionId: instructionId
            });

            this.userInput = '';
            this.conversationHistory = [...this.conversationHistory, ...response];

            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        } catch (err) {
            this.error = 'An error occurred while sending your message.';
            console.error(err);
        } finally {
            this.isLoading = false;
        }
    }

    async loadConversationHistory() {
        try {
            const result = await getConversationHistory();
            this.conversationHistory = result;
            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
        } catch (err) {
            this.error = 'Failed to load conversation history.';
            console.error(err);
        }
    }

    get decoratedConversationHistory() {
        return this.conversationHistory.map(msg => {
            const isUser = msg.Sender__c === 'User';
            return {
                ...msg,
                Sender__c: isUser ? this.userName : msg.Sender__c,
                cssClass: isUser ? 'user-message' : 'llm-message',
                iconName: isUser ? 'utility:user' : 'utility:einstein'
            };
        });
    }

    scrollToBottom() {
        const chatWindow = this.template.querySelector('.chat-window');
        if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }
    get modeText() {
        return this.isPromptMode ? 'Prompt Mode' : 'Action Mode';
    }
    get cardTitle() {
        return `Gen Assist Chat - ${this.modeText}`;
    }

    get disableSend() {
        if (this.isPromptMode) {
            return this.isLoading || !this.selectedPrompt || this.promptWarning !== '';
        }
        return this.isLoading || !this.userInput || this.userInput.trim() === '';
    }

    // Wire services
    @wire(CurrentPageReference)
    pageRef(pageReference) {
        if (pageReference) {
            this.pageContext.processPageReference(pageReference, this.userName);
        }
    }

    @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD] })
    userDetails({error, data}) {
        if (data) {
            this.userName = data.fields.Name.value;
            // Update page context with user name
            const pageRef = this.template.host.pageRef;
            if (pageRef) {
                this.pageContext.processPageReference(pageRef, this.userName);
            }
        } else if (error) {
            console.error('Error retrieving user data', error);
        }
    }
}