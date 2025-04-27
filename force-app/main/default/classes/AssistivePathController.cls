public with sharing class AssistivePathController {
    @AuraEnabled(cacheable=true)
    public static Assistive_Path_Logic__mdt getAssistivePathLogic(String triggerObject, String triggerField, String triggerValue) {
        // Query the custom metadata type for the assistive path logic
        List<Assistive_Path_Logic__mdt> assistivePathLogicList = [
            Select Id, Is_Active__c,Prompt__c,Investigating_Field_API_Name__c, Trigger_Value__c, Assistive_Path__r.Object_Name__c, Assistive_Path__r.Trigger_Field_API_Name__c From Assistive_Path_Logic__mdt
            WHERE Is_Active__c = true 
            AND Assistive_Path__r.Object_Name__c = :triggerObject 
            AND Assistive_Path__r.Trigger_Field_API_Name__c = :triggerField 
            AND Trigger_Value__c = :triggerValue
            LIMIT 1
        ];

        // Return the first record if available
        return assistivePathLogicList.isEmpty() ? null : assistivePathLogicList[0];
    }

    //Get Latest AI Assistive Analysis record using Object Name, Trigger Field API Name and Trigger Value and Record Id
    @AuraEnabled(cacheable=true)
    public static AI_Assistive_Analysis__c getAIAssistiveAnalysis(String objectName, String triggerFieldAPI, String triggerValue, Id recordId) {
        // Query the AI Assistive Analysis object for the latest record
        List<AI_Assistive_Analysis__c> assistiveAnalysisList = [
            Select Id, Object_Name__c, Trigger_Field_Name__c, Trigger_Field_Value__c, Record_Id__c,Analysis__c,CreatedDate From AI_Assistive_Analysis__c
            WHERE Object_Name__c = :objectName 
            AND Trigger_Field_Name__c = :triggerFieldAPI 
            AND Trigger_Field_Value__c = :triggerValue 
            AND Record_Id__c = :recordId
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];

        // Return the first record if available
        return assistiveAnalysisList.isEmpty() ? null : assistiveAnalysisList[0];
    }

    //performeAnalysis
    @AuraEnabled
    public static AI_Assistive_Analysis__c performAnalysis(String objectName, String triggerFieldAPI, String triggerValue, Id recordId) {
        // Perform the analysis logic here
        // This is a placeholder for the actual analysis logic
        Assistive_Path_Logic__mdt assistivePathLogic = getAssistivePathLogic(objectName, triggerFieldAPI, triggerValue);
        if (assistivePathLogic != null) {
            // Create a new AI Assistive Analysis record
            AI_Assistive_Analysis__c analysisRecord = new AI_Assistive_Analysis__c();
            analysisRecord.Object_Name__c = objectName;
            analysisRecord.Trigger_Field_Name__c = triggerFieldAPI;
            analysisRecord.Trigger_Field_Value__c = triggerValue;
            analysisRecord.Record_Id__c = recordId;
            analysisRecord.Analysis__c = 'Analysis performed successfully'+assistivePathLogic.Prompt__c+'<h1>Filed Usered:</h1>'+assistivePathLogic.Investigating_Field_API_Name__c; // Placeholder for actual analysis result

            // Insert the record
            insert analysisRecord;
            return analysisRecord;
        } else {
            // Handle the case where no assistive path logic is found
            System.debug('No assistive path logic found for the given parameters.');
        }
        System.debug('Performing analysis for Object: ' + objectName + ', Field: ' + triggerFieldAPI + ', Value: ' + triggerValue + ', Record ID: ' + recordId);
        // Return null if no analysis was performed
        return null;
    }
}