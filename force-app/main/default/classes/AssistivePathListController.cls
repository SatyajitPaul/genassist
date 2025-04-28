public with sharing class AssistivePathListController {
    @AuraEnabled(cacheable=true)
    public static List<Assistive_Path__mdt> getAssistivePaths() {
        return [SELECT Id, MasterLabel, Object_Name__c, Is_Active__c FROM Assistive_Path__mdt Limit 200];
    }
    @AuraEnabled(cacheable=true)
    public static Assistive_Path__mdt getAssistivePathById(String recordId) {
        return [SELECT Id, MasterLabel, Object_Name__c, Is_Active__c , LLM_Instruction_Setting__r.Instruction__c , LLM_Provider__r.MasterLabel FROM Assistive_Path__mdt WHERE Id = :recordId LIMIT 1];
    }

    //Get List of Assistive Path Logic(Assistive_Path_Logic__mdt) With parent Assistive_Path__mdt Object_Name__c value
    @AuraEnabled(cacheable=true)
    public static List<Assistive_Path_Logic__mdt> getAssistivePathLogicByObjectName(String objectName) {
        return [SELECT Id, MasterLabel, Prompt__c, Trigger_Value__c, Is_Active__c, Investigating_Field_API_Name__c, Assistive_Path__r.Object_Name__c FROM Assistive_Path_Logic__mdt WHERE Assistive_Path__r.Object_Name__c = :objectName];
    }
}