public with sharing class ContextProvider {
    
    // Return context as a map
    public Map<String, Object> getCurrentContext() {
        Map<String, Object> context = new Map<String, Object>();

        // Example context values
        context.put('userId', UserInfo.getUserId());
        context.put('userName', [SELECT Name FROM User WHERE Id = :UserInfo.getUserId()].Name);
        context.put('orgId', UserInfo.getOrganizationId());
        context.put('language', UserInfo.getLocale());

        // Add more context if needed (e.g., current record ID, page context)
        return context;
    }
}