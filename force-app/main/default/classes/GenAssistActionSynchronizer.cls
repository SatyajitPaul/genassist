public class GenAssistActionSynchronizer {
    // Constants
    private static final String META_API_NAMESPACE = 'http://soap.sforce.com/2006/04/metadata';
    private static final String CLASS_TEMPLATE = 
        'public class {0} implements GenAssistAction {\n' +
        '    public String intent() {\n' +
        '        return \'{1}\';\n' +
        '    }\n' +
        '}\n';
    
    // Flag to prevent recursive triggers
    public static Boolean isSynchronizing = false;
    
    // Method to sync from Apex class to custom object
    public static void syncFromClass(String className) {
        if (isSynchronizing) return;
        
        try {
            isSynchronizing = true;
            
            // Use reflection to get the intent from the class
            Type classType = Type.forName(className);
            if (classType == null) return;
            
            Object classInstance = classType.newInstance();
            if (!(classInstance instanceof GenAssistAction)) return;
            
            GenAssistAction action = (GenAssistAction)classInstance;
            String intent = action.intent();
            
            // Find or create GenAssist_Action__c record
            GenAssist_Action__c actionRecord = findOrCreateActionRecord(className, intent);
            update actionRecord;
        } catch (Exception e) {
            System.debug('Error syncing from class: ' + e.getMessage());
        } finally {
            isSynchronizing = false;
        }
    }
    
    // Method to sync from custom object to Apex class
    public static void syncFromRecord(GenAssist_Action__c actionRecord) {
        if (isSynchronizing) return;
        
        try {
            isSynchronizing = true;
            
            String className = actionRecord.Apex_Class_Name__c;
            String intent = actionRecord.Action_Intent__c;
            
            // Check if class exists
            Boolean classExists = doesClassExist(className);
            
            if (classExists) {
                // Update existing class
                updateApexClass(className, intent);
            } else {
                // Create new class
                createApexClass(className, intent);
            }
        } catch (Exception e) {
            System.debug('Error syncing from record: ' + e.getMessage());
        } finally {
            isSynchronizing = false;
        }
    }
    
    // Helper method to find or create an action record
    private static GenAssist_Action__c findOrCreateActionRecord(String className, String intent) {
        List<GenAssist_Action__c> actions = [SELECT Id, Apex_Class_Name__c, Action_Intent__c 
                                            FROM GenAssist_Action__c 
                                            WHERE Apex_Class_Name__c = :className
                                            LIMIT 1];
        
        if (!actions.isEmpty()) {
            GenAssist_Action__c action = actions[0];
            action.Action_Intent__c = intent;
            return action;
        } else {
            return new GenAssist_Action__c(
                Apex_Class_Name__c = className,
                Action_Intent__c = intent
            );
        }
    }
    
    // Helper method to check if a class exists
    private static Boolean doesClassExist(String className) {
        try {
            Type.forName(className);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    // Helper method to create a new Apex class
    private static void createApexClass(String className, String intent) {
        String formattedIntent = intent.replace('\'', '\\\'');
        String classBody = String.format(CLASS_TEMPLATE, new List<String>{className, formattedIntent});
        
        // Use Metadata API to create the class
        MetadataService.MetadataPort service = createMetadataService();
        MetadataService.ApexClass apexClass = new MetadataService.ApexClass();
        apexClass.apiVersion = 63.0;
        apexClass.status = 'Active';
        apexClass.body = classBody;
        apexClass.name = className;
        
        MetadataService.SaveResult[] results = service.createMetadata(
            new MetadataService.Metadata[] { apexClass }
        );
        
        handleMetadataResults(results);
    }
    
    // Helper method to update an existing Apex class
    private static void updateApexClass(String className, String intent) {
        String formattedIntent = intent.replace('\'', '\\\'');
        String classBody = String.format(CLASS_TEMPLATE, new List<String>{className, formattedIntent});
        
        // Use Metadata API to update the class
        MetadataService.MetadataPort service = createMetadataService();
        MetadataService.ApexClass apexClass = new MetadataService.ApexClass();
        apexClass.apiVersion = 55.0;
        apexClass.status = 'Active';
        apexClass.body = classBody;
        apexClass.name = className;
        
        MetadataService.SaveResult[] results = service.updateMetadata(
            new MetadataService.Metadata[] { apexClass }
        );
        
        handleMetadataResults(results);
    }
    
    // Helper method to create a metadata API service
    private static MetadataService.MetadataPort createMetadataService() {
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();
        service.SessionHeader = new MetadataService.SessionHeader_element();
        service.SessionHeader.sessionId = UserInfo.getSessionId();
        return service;
    }
    
    // Helper method to handle metadata API results
    private static void handleMetadataResults(MetadataService.SaveResult[] results) {
        if (results != null && results.size() > 0) {
            if (results[0].success) {
                System.debug('Metadata operation successful');
            } else {
                System.debug('Metadata operation failed: ' + results[0].errors[0].message);
            }
        }
    }
}