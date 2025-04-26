public interface ILLMProvider {
    // Method to send the request to the LLM and return the response
    String sendRequest(String prompt, Map<String, Object> context);
    
    // Method to initialize the provider with metadata (instead of using initialize())
    void setupProvider(LLM_Provider__mdt providerMetadata);
}