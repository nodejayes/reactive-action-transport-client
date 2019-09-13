export function debugLog(debugMode, ...message) {
    if (debugMode) {
        console.info(...message);
    }
}
