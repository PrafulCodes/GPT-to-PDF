/**
 * Centralized, production-grade structured logging utility.
 * Logs are written to stdout/stderr in standard JSON format, 
 * ready to be collected by cloud log aggregation tools (Datadog, Vercel Log Drain, Logflare).
 */

export interface AuditLogData {
  timestamp: string;
  level: 'AUDIT' | 'INFO' | 'WARN' | 'ERROR';
  action: string;
  ip?: string;
  metadata?: Record<string, any>;
}

/**
 * Write a structured audit log entry representing admin operations.
 */
export function logAudit(action: string, ip: string = 'Unknown', metadata?: Record<string, any>): void {
  const logEntry: AuditLogData = {
    timestamp: new Date().toISOString(),
    level: 'AUDIT',
    action,
    ip,
    metadata
  };
  
  // Structured stdout print
  console.log(JSON.stringify(logEntry));
}

/**
 * Write a structured error log entry.
 */
export function logError(action: string, error: any, ip: string = 'Unknown'): void {
  const logEntry: AuditLogData = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    action,
    ip,
    metadata: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }
  };
  
  // Structured stderr print
  console.error(JSON.stringify(logEntry));
}

/**
 * Write standard info logs.
 */
export function logInfo(action: string, metadata?: Record<string, any>): void {
  const logEntry: AuditLogData = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    action,
    metadata
  };
  
  console.log(JSON.stringify(logEntry));
}
