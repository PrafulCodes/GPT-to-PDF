import { after } from 'next/server';
import { logSecurityEvent } from './security';

export async function runBackgroundTask(task: () => Promise<void>, operation: string) {
  try {
    await task();
  } catch (error) {
    logSecurityEvent('error', 'BACKGROUND_OPERATION_FAILED', {
      operation,
      errorType: error instanceof Error ? error.name : typeof error
    });
  }
}

export function scheduleAfterResponse(task: () => Promise<void>, operation: string) {
  try {
    after(() => runBackgroundTask(task, operation));
  } catch (error) {
    logSecurityEvent('error', 'BACKGROUND_OPERATION_FAILED', {
      operation,
      reason: 'schedule_failed',
      errorType: error instanceof Error ? error.name : typeof error
    });
  }
}
