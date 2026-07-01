const warnedKeys = new Set<string>();

/**
 * Logs a single deprecation warning for a legacy environment variable name.
 * Ensuring that it is only emitted once per process execution.
 */
export function warnDeprecated(legacyKey: string, standardKey: string): void {
  if (!warnedKeys.has(legacyKey)) {
    warnedKeys.add(legacyKey);
    console.warn(
      `[DEPRECATION WARNING] Environment variable "${legacyKey}" is deprecated and will be removed in a future release. Please transition to "${standardKey}".`
    );
  }
}
