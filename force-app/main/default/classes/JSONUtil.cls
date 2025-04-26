public class JSONUtil {

    // Method 1: Extract JSON if available, otherwise return original string
    public static String jsonExtractor(String input) {
        input = input.trim();
        try {
            if ((input.startsWith('{') && input.endsWith('}')) || (input.startsWith('[') && input.endsWith(']'))) {
                JSON.deserializeUntyped(input); // Just to validate
                return input;
            } else {
                Integer start = input.indexOf('{');
                Integer endPos = input.lastIndexOf('}');
                if (start != -1 && endPos != -1 && start < endPos) {
                    String jsonCandidate = input.substring(start, endPos + 1);
                    JSON.deserializeUntyped(jsonCandidate); // Validation
                    return jsonCandidate;
                }
            }
        } catch (Exception e) {
            // Invalid JSON, fall through
        }
        return input;
    }

    // Method 2: Extract field value from JSON using dot notation (e.g. user.name or items[0].price)
    public static Object getJsonValue(String jsonStr, String fieldPath) {
        try {
            Object json = JSON.deserializeUntyped(jsonStr);
            List<String> pathParts = fieldPath.split('\\.');
            Object current = json;

            for (String part : pathParts) {
                if (current == null) return null;

                // Handle array notation like items[0]
                if (part.contains('[')) {
                    String base = part.substring(0, part.indexOf('['));
                    Integer index = Integer.valueOf(part.substring(part.indexOf('[') + 1, part.indexOf(']')));
                    if (current instanceof Map<String, Object>) {
                        current = ((Map<String, Object>) current).get(base);
                    }
                    if (current instanceof List<Object>) {
                        current = ((List<Object>) current).get(index);
                    } else {
                        return null;
                    }
                } else {
                    if (current instanceof Map<String, Object>) {
                        current = ((Map<String, Object>) current).get(part);
                    } else {
                        return null;
                    }
                }
            }
            return current;
        } catch (Exception e) {
            return null;
        }
    }
}