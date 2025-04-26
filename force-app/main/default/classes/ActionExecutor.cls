public with sharing class ActionExecutor {
    public Object executeAction(String actionName, Map<String, Object> parameters, Map<String, Object> context) {
        IAgentAction action = AgentActionFactory.getActionByName(actionName);
        return action.execute(parameters, context);
    }
}