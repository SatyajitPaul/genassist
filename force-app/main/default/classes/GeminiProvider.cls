public class GeminiProvider implements ILLMProvider {
    private String apiUrl;
    private String modelName;
    private String nameCred;
    private Integer maxToken;

    // Implementing the setupProvider method to initialize the provider with metadata
    public void setupProvider(LLM_Provider__mdt providerMetadata) {
        this.apiUrl = providerMetadata.API_Base_URL__c;
        this.modelName = providerMetadata.Model_Name__c;
        this.nameCred = providerMetadata.Named_Credential__c;
        this.maxToken = (Integer)providerMetadata.Max_Tokens__c;
    }

    // Implementing the sendRequest method to communicate with Gemini
    public String sendRequest(String prompt, Map<String, Object> context) {
        // Gemini API endpoint format - using v1beta and the generateContent endpoint
        String endpoint = apiUrl + '/v1beta/models/' + modelName + ':generateContent?key='+nameCred;

        // Prepare request body for Gemini API
        Map<String, Object> requestBody = new Map<String, Object>();
        
        // Create contents array with text part, matching the curl example
        List<Map<String, Object>> contents = new List<Map<String, Object>>();
        Map<String, Object> content = new Map<String, Object>();
        
        // Add text part to contents
        Map<String, String> textPart = new Map<String, String>();
        textPart.put('text', prompt);
        
        List<Map<String, String>> parts = new List<Map<String, String>>();
        parts.add(textPart);
        
        content.put('parts', parts);
        // Only adding role if needed (removed since not in the curl example)
        contents.add(content);
        
        requestBody.put('contents', contents);
        
        // Add generation config if temperature is provided
        if (context != null && context.containsKey('temperature')) {
            Map<String, Object> generationConfig = new Map<String, Object>();
            generationConfig.put('temperature', context.get('temperature'));
            if (maxToken != null) {
                generationConfig.put('maxOutputTokens', maxToken);
            }
            requestBody.put('generationConfig', generationConfig);
        }
        
        String body = JSON.serialize(requestBody);

        // Perform the HTTP request using Named Credential
        // The Named Credential will handle the authentication
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(body);

        Http http = new Http();
        HttpResponse res;

        try {
            res = http.send(req);
        } catch (Exception e) {
            throw new CustomException('HTTP request failed: ' + e.getMessage());
        }

        // Handle the response
        if (res.getStatusCode() == 200) {
            try {
                Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                // Log the full response for debugging (optional, remove in production)
                System.debug('Gemini API Response: ' + res.getBody());
                
                // Navigate through Gemini's response structure
                List<Object> candidates = (List<Object>) response.get('candidates');
                
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = (Map<String, Object>) candidates[0];
                    Map<String, Object> candidateContent = (Map<String, Object>) candidate.get('content');
                    
                    if (candidateContent != null) {
                        List<Object> candidateParts = (List<Object>) candidateContent.get('parts');
                        
                        if (candidateParts != null && !candidateParts.isEmpty()) {
                            Map<String, Object> part = (Map<String, Object>) candidateParts[0];
                            String resultText = (String) part.get('text');
                            
                            if (resultText != null) {
                                return JSONUtil.jsonExtractor(resultText);
                            }
                            throw new CustomException('Text field not found in Gemini API response part.');
                        }
                        throw new CustomException('No parts found in Gemini API response content.');
                    }
                    throw new CustomException('Content field not found in Gemini API response candidate.');
                } 
                throw new CustomException('No candidates found in Gemini API response.');
            } catch (Exception e) {
                throw new CustomException('Error parsing Gemini API response: ' + e.getMessage() + '. Raw response: ' + res.getBody());
            }
        } else {
            // Detailed error message with response body
            throw new CustomException('Error from Gemini API: ' + res.getStatusCode() + ' - ' + res.getStatus() + ' - ' + res.getBody());
        }
    }
}