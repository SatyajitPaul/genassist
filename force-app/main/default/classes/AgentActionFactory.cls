public with sharing class AgentActionFactory {
    public static IAgentAction getActionByName(String actionName) {
        Agent_Action__mdt config = [
            SELECT Apex_Implementation_Class__c 
            FROM Agent_Action__mdt 
            WHERE Action_Name__c = :actionName 
            AND Is_Active__c = true 
            LIMIT 1
        ];
        
        if (config == null) {
            throw new CustomException('Action not found: ' + actionName);
        }

        Type t = Type.forName(config.Apex_Implementation_Class__c);
        if (t == null || !(t.newInstance() instanceof IAgentAction)) {
            throw new CustomException('Invalid implementation class: ' + config.Apex_Implementation_Class__c);
        }

        return (IAgentAction)t.newInstance();
    }
}