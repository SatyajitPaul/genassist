public with sharing class AssistivePathController {

    @AuraEnabled(cacheable=true)
    public static Assistive_Path_Logic__mdt getAssistivePathLogic(String triggerObject, String triggerField, String triggerValue) {
        if (String.isBlank(triggerObject) || String.isBlank(triggerField) || String.isBlank(triggerValue)) {
            return null;
        }

        return [
            SELECT Id, Is_Active__c, Prompt__c, Investigating_Field_API_Name__c, Trigger_Value__c,
                   Assistive_Path__r.Object_Name__c, Assistive_Path__r.Trigger_Field_API_Name__c,
                   Assistive_Path__r.LLM_Provider__c,
                   Assistive_Path__r.LLM_Instruction_Setting__r.Instruction__c
            FROM Assistive_Path_Logic__mdt
            WHERE Is_Active__c = TRUE
              AND Assistive_Path__r.Object_Name__c = :triggerObject
              AND Assistive_Path__r.Trigger_Field_API_Name__c = :triggerField
              AND Trigger_Value__c = :triggerValue
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static AI_Assistive_Analysis__c getAIAssistiveAnalysis(String objectName, String triggerFieldAPI, String triggerValue, Id recordId) {
        if (String.isBlank(objectName) || String.isBlank(triggerFieldAPI) || String.isBlank(triggerValue) || recordId == null) {
            return null;
        }

        return [
            SELECT Id, Object_Name__c, Trigger_Field_Name__c, Trigger_Field_Value__c,
                   Record_Id__c, Analysis__c, CreatedDate
            FROM AI_Assistive_Analysis__c
            WHERE Object_Name__c = :objectName
              AND Trigger_Field_Name__c = :triggerFieldAPI
              AND Trigger_Field_Value__c = :triggerValue
              AND Record_Id__c = :recordId
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static AI_Assistive_Analysis__c performAnalysis(String objectName, String triggerFieldAPI, String triggerValue, Id recordId) {
        if (String.isBlank(objectName) || String.isBlank(triggerFieldAPI) || String.isBlank(triggerValue) || recordId == null) {
            return null;
        }

        Assistive_Path_Logic__mdt logic = getAssistivePathLogic(objectName, triggerFieldAPI, triggerValue);

        if (logic == null) {
            System.debug('No matching Assistive Path Logic found.');
            return null;
        }

        String prompt = buildPrompt(
            logic.Prompt__c,
            objectName,
            logic.Investigating_Field_API_Name__c,
            triggerValue,
            recordId,
            logic.Assistive_Path__r.LLM_Instruction_Setting__r.Instruction__c
        );

        List<AI_Conversation_Turn__c> aiResponse = GenAssistManager.processUserInput(prompt, logic.Assistive_Path__r.LLM_Provider__c);

        AI_Assistive_Analysis__c analysis = new AI_Assistive_Analysis__c(
            Object_Name__c = objectName,
            Trigger_Field_Name__c = triggerFieldAPI,
            Trigger_Field_Value__c = triggerValue,
            Record_Id__c = recordId,
            Analysis__c = aiResponse[0].Message__c // Optional: Replace with actual result from aiResponse
        );

        insert analysis;
        return analysis;
    }

    private static String buildPrompt(String promptTemplate, String objectName, String fieldAPI, String triggerValue, Id recordId, String instruction) {
        String responseString = '';

        if (!String.isBlank(instruction)) {
            responseString += 'INSTRUCTION: ' + instruction + '\n';
        }

        if (!String.isBlank(promptTemplate)) {
            responseString += '\nPROMPT: ' + promptTemplate + '\n';
        }

        if (!String.isBlank(fieldAPI) && !String.isBlank(objectName)) {
            try {
                String query = 'SELECT ' + fieldAPI + ' FROM ' + objectName + ' WHERE Id = :recordId LIMIT 1';
                List<SObject> results = Database.query(query);

                if (!results.isEmpty()) {
                    SObject record = results[0];

                    if (record != null) {
                        responseString += '\nDATA: ' + String.valueOf(record) + '\n';
                    }
                }
            } catch (Exception ex) {
                responseString += 'DATA: Issue With Data Extraction\n';
                System.debug('Error executing dynamic SOQL: ' + ex.getMessage());
            }
        }

        return responseString.trim();
    }
}