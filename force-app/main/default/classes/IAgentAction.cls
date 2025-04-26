public interface IAgentAction {
    Object execute(Map<String, Object> parameters, Map<String, Object> context);
}