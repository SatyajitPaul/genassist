public with sharing class QueryAction implements IAgentAction {
    public Object execute(Map<String, Object> parameters, Map<String, Object> context) {
        String soql = (String)parameters.get('soql');
        List<SObject> results = Database.query(soql);
        return results;
    }
}