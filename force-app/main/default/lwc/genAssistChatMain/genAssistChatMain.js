import { LightningElement } from 'lwc';

export default class GenAssistChatMain extends LightningElement {
    messages = [
        {
            id: '1',
            message: 'Hello! I am Gen Assist. How can I help you today?',
            llm: 'Gen Assist',
            timestamp: new Date().toLocaleString(),
            isAi: true,
        },
        {
            id: '2',
            message: 'I am here to assist you with your queries.',
            llm: 'Satyajit Paul',
            timestamp: new Date().toLocaleString(),
            isAi: false,
        },
        {
            id: '3',
            message: 'Feel free to ask me anything!',
            llm: 'Gen Assist',
            timestamp: new Date().toLocaleString(),
            isAi: true,
        },
        {
            id: '4',
            message: 'What would you like to know?',
            llm: 'Satyajit Paul',
            timestamp: new Date().toLocaleString(),
            isAi: false,
        },
        {
            id: '5',
            message: 'I can help you with various topics.',
            llm: 'Gen Assist',
            timestamp: new Date().toLocaleString(),
            isAi: true,
        },
        {
            id: '6',
            message: 'Let\'s get started!',
            llm: 'Satyajit Paul',
            timestamp: new Date().toLocaleString(),
            isAi: false,
        },
    ];
    renderedCallback() {
        const container = this.template.querySelector('.message-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
}