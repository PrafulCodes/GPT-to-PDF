import { randomUUID } from 'node:crypto';
import { logSecurityEvent } from './security';

export type PdfPipelineStage =
  | 'request_received'
  | 'request_validation'
  | 'rate_limit_check'
  | 'concurrency_check'
  | 'chat_page_fetch'
  | 'upstream_response_validation'
  | 'page_classification'
  | 'html_parsing'
  | 'message_extraction'
  | 'content_normalization'
  | 'pdf_rendering'
  | 'pdf_response_delivery'
  | 'analytics_event_processing';

type StageState = {
  startedAt: number;
};

function deploymentId() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA;
  return commit ? commit.slice(0, 12) : 'local';
}

export function createPipelineObserver(correlationId: string = randomUUID()) {
  const stages = new Map<PdfPipelineStage, StageState>();

  function emit(
    level: 'info' | 'warn' | 'error',
    stage: PdfPipelineStage,
    success: boolean,
    metadata: Record<string, unknown> = {}
  ) {
    logSecurityEvent(level, 'PDF_PIPELINE_STAGE', {
      correlationId,
      deploymentId: deploymentId(),
      environment: process.env.NODE_ENV || 'unknown',
      stage,
      success,
      ...metadata
    });
  }

  return {
    correlationId,
    start(stage: PdfPipelineStage) {
      stages.set(stage, { startedAt: Date.now() });
    },
    complete(stage: PdfPipelineStage, metadata: Record<string, unknown> = {}) {
      const state = stages.get(stage);
      emit('info', stage, true, {
        durationMs: state ? Date.now() - state.startedAt : 0,
        ...metadata
      });
      stages.delete(stage);
    },
    fail(
      stage: PdfPipelineStage,
      metadata: Record<string, unknown> = {},
      level: 'warn' | 'error' = 'error'
    ) {
      const state = stages.get(stage);
      emit(level, stage, false, {
        durationMs: state ? Date.now() - state.startedAt : 0,
        ...metadata
      });
      stages.delete(stage);
    }
  };
}
