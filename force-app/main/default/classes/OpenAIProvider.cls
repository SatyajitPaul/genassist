public class OpenAIProvider implements ILLMProvider {

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

    // Implementing the sendRequest method to communicate with OpenAI
    public String sendRequest(String prompt, Map<String, Object> context) {
        apiUrl = apiUrl + '/v1/completions';

        // Prepare request body using JSON.serialize
        Map<String, Object> requestBody = new Map<String, Object>();
        requestBody.put('model', modelName);
        requestBody.put('prompt', prompt);
        requestBody.put('temperature', context.get('temperature'));

        String body = JSON.serialize(requestBody);

        // Perform the HTTP request (using Named Credential for security)
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:'+nameCred + apiUrl);
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
            Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

            // Cast 'choices' to a List
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get('choices');
            
            // Access the first element in the list and return the 'text' value
            if (!choices.isEmpty()) {
                return (String) choices.get(0).get('text');
            } else {
                throw new CustomException('No choices returned from OpenAI API.');
            }
        } else {
            // Detailed error message with response body
            throw new CustomException('Error from OpenAI API: ' + res.getStatusCode() + ' - ' + res.getStatus() + ' - ' + res.getBody());
        }
    }
}