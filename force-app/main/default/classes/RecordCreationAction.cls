public with sharing class RecordCreationAction implements IAgentAction {
    public Object execute(Map<String, Object> parameters, Map<String, Object> context) {
        String objectType = (String)parameters.get('objectType');
        Map<String, Object> fieldValues = (Map<String, Object>)parameters.get('fieldValues');

        SObject sObj = (SObject)Type.forName('Schema.' + objectType).newInstance();
        for (String key : fieldValues.keySet()) {
            sObj.put(key, fieldValues.get(key));
        }

        insert sObj;
        return sObj;
    }
}