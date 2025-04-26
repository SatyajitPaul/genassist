public with sharing class GenAssistController {

    @AuraEnabled(cacheable=true)
    public static List<LLM_Provider__mdt> getAvailableLLMs() {
        return [SELECT Id, Provider_Name__c FROM LLM_Provider__mdt WHERE Is_Active__c = TRUE];
    }

    @AuraEnabled
    public static List<AI_Conversation_Turn__c> processUserInput(String input, Id providerId, Id instructionId) {
        if (String.isBlank(input)) {
            throw new AuraHandledException('User input cannot be empty.');
        }

        if (providerId == null) {
            throw new AuraHandledException('Provider must be selected.');
        }

        try {
            return GenAssistManager.processUserInput(input, providerId, instructionId);
        } catch (Exception ex) {
            System.debug('Error: ' + ex.getMessage());
            throw new AuraHandledException('An error occurred while processing your message.');
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<AI_Conversation_Turn__c> getConversationHistory() {
        Id userId = UserInfo.getUserId();
        List<AI_Conversation__c> sessions = [
            SELECT Id FROM AI_Conversation__c 
            WHERE CreatedById = :userId 
            ORDER BY CreatedDate DESC 
            LIMIT 1
        ];

        if (sessions.isEmpty()) {
            return new List<AI_Conversation_Turn__c>();
        }

        return [
            SELECT Id, Sender__c, Message__c, CreatedDate 
            FROM AI_Conversation_Turn__c 
            WHERE Conversation__c = :sessions[0].Id 
            ORDER BY CreatedDate ASC
        ];
    }
    @AuraEnabled(cacheable=true)
public static List<Prompt_Template__mdt> getActivePromptTemplates() {
    return [
        SELECT Id, MasterLabel, Category__c, Expected_Output_Type__c, Is_Active__c, 
               LLM_Provider__c, Prompt_Body__c, Prompt_Label__c, Use_Context__c
        FROM Prompt_Template__mdt
        WHERE Is_Active__c = true
    ];
}
}