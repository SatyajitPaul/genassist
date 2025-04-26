public class LLMProviderFactory {

    // This method returns an appropriate provider based on the LLM selection
    public static ILLMProvider getProvider(String providerName) {
        // Retrieve the provider details from the LLM_Provider__mdt custom metadata type
        LLM_Provider__mdt providerMetadata = [SELECT Provider_Name__c, API_Base_URL__c, Model_Name__c, Auth_Type__c,Named_Credential__c, Max_Tokens__c 	
                                              FROM LLM_Provider__mdt 
                                              WHERE Is_Active__c = true And DeveloperName = :providerName 
                                              LIMIT 1];
        
        // Build the class name dynamically by appending 'Provider' to the provider name
        String className = providerMetadata.Provider_Name__c + 'Provider';
        
        // Use the Type class to get the class dynamically
        Type providerType = Type.forName(className); // Replace 'YourNamespace' with your actual Salesforce namespace
        
        if (providerType == null) {
            throw new CustomException('Provider class not found: ' + className);
        }

        // Create an instance of the provider dynamically using the Type class
        ILLMProvider provider = (ILLMProvider) providerType.newInstance();
        
        // Setup the provider with the metadata
        provider.setupProvider(providerMetadata);
        
        return provider;
    }
}