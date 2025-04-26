public with sharing class GenAssistManager {
    
    private static ActionExecutor actionExecutor = new ActionExecutor();
    private static ContextProvider contextProvider = new ContextProvider();

    public static List<AI_Conversation_Turn__c> processUserInput(String input, Id providerId, Id llmInstruction) {
        String instruction = 'You are a Salesforce AI Assistance, only response what has been asked do not use existing knowledge to answer.';
        // 1. Get provider metadata
        LLM_Provider__mdt provider = [
            SELECT Provider_Name__c, API_Base_URL__c, Model_Name__c, Auth_Type__c,Named_Credential__c, Max_Tokens__c
            FROM LLM_Provider__mdt
            WHERE Id = :providerId
            LIMIT 1
        ];
        if (llmInstruction != null) {
            LLM_Instruction_Setting__mdt inst = [
            SELECT MasterLabel, Instruction__c
            FROM LLM_Instruction_Setting__mdt
            WHERE MasterLabel = :llmInstruction
            LIMIT 1
        ];
            instruction = inst.Instruction__c;
            
        }


        // Build the class name dynamically by appending 'Provider' to the provider name
        String className = provider.Provider_Name__c + 'Provider';
        
        // Use the Type class to get the class dynamically
        Type providerType = Type.forName(className); // Replace 'YourNamespace' with your actual Salesforce namespace
        
        if (providerType == null) {
            throw new CustomException('Provider class not found: ' + className);
        }

        // Create an instance of the provider dynamically using the Type class
        ILLMProvider pd = (ILLMProvider) providerType.newInstance();
        
        // Setup the provider with the metadata
        pd.setupProvider(provider);

        // 3. Build context (optional future use)
        Map<String, Object> context = new Map<String, Object>();

        // 4. Send request to LLM
        String llmResponse = pd.sendRequest(input+instruction, context);

        // 5. Create / get latest conversation for user
        AI_Conversation__c convo;
        List<AI_Conversation__c> existing = [
            SELECT Id FROM AI_Conversation__c 
            WHERE CreatedById = :UserInfo.getUserId() 
            ORDER BY CreatedDate DESC 
            LIMIT 1
        ];
        if (!existing.isEmpty()) {
            convo = existing[0];
        } else {
            convo = new AI_Conversation__c(Start_Time__c  = Datetime.now());
            insert convo;
        }

        // 6. Save user + LLM turn
        List<AI_Conversation_Turn__c> turns = new List<AI_Conversation_Turn__c>();

        turns.add(new AI_Conversation_Turn__c(
            Conversation__c = convo.Id,
            Sender__c = 'User',
            Message__c = input
        ));

        turns.add(new AI_Conversation_Turn__c(
            Conversation__c = convo.Id,
            Sender__c = 'AI',
            LLM_Used__c	= provider.Provider_Name__c,
            Message__c = llmResponse
        ));

        insert turns;

        return turns;
    }
    public Object executeAction(String actionName, Map<String, Object> parameters) {
    if (actionExecutor == null) {
        actionExecutor = new ActionExecutor();
    }

    Map<String, Object> context = contextProvider.getCurrentContext(); // load relevant context
    return actionExecutor.executeAction(actionName, parameters, context);
}
    
}