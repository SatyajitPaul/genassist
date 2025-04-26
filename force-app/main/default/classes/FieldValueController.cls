public with sharing class FieldValueController {
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getFieldValues(String objectName, Id recordId) {
        Map<String, String> fieldValues = new Map<String, String>();
        
        // Get the object's schema
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        // Get all fields for the object
        Map<String, Schema.SObjectField> fields = objDescribe.fields.getMap();
        
        // Query the record to get field values
        String query = 'SELECT ' + String.join(new List<String>(fields.keySet()), ', ') + ' FROM ' + objectName + ' WHERE Id = :recordId LIMIT 1';
        SObject record = Database.query(query);
        
        // Loop through each field and get the value if it's not null
        for (String fieldName : fields.keySet()) {
            Object fieldValue = record.get(fieldName);
            if (fieldValue != null) {
                fieldValues.put(fieldName, String.valueOf(fieldValue));
            }
        }
        
        return fieldValues;
    }
}