// API Client for Agentic Film Studio
// Connects React to Node.js Gateway (port 4000) or directly to FastAPI Agent Core (port 8000)

const NODE_API_BASE = 'http://localhost:4000/api/v1';
const AGENTS_API_BASE = 'http://localhost:8000/api/v1';

export interface TriggerWorkflowParams {
  projectId: string;
  workflowType:
    | 'script_ideation'
    | 'script_to_storyboard'
    | 'continuity_validation'
    | 'scene_synthesis'
    | 'render_timeline';
  parameters?: Record<string, any>;
  userFeedback?: string;
  interruptOnHumanApproval?: boolean;
}

export interface WorkflowRunResponse {
  run_id?: string;
  runId?: string;
  project_id?: string;
  status: string;
  progress?: number;
  currentStage?: string;
  current_stage?: string;
  completed_nodes?: string[];
  completedNodes?: string[];
  intermediate_artifacts?: Record<string, any>;
  intermediateArtifacts?: Record<string, any>;
  result?: any;
  error_message?: string;
}

export async function triggerWorkflow(
  params: TriggerWorkflowParams
): Promise<WorkflowRunResponse> {
  // Try Node.js Gateway first (Port 4000)
  try {
    const nodeRes = await fetch(`${NODE_API_BASE}/projects/workflows/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (nodeRes.ok) {
      const json = await nodeRes.json();
      if (json.data) return json.data;
    }
  } catch (err) {
    console.warn('[API Client] Node Gateway unreachable, attempting FastAPI direct connection...', err);
  }

  // Fallback direct connection to FastAPI Agent Engine (Port 8000)
  const agentRes = await fetch(`${AGENTS_API_BASE}/workflows/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: params.projectId,
      workflow_type: params.workflowType,
      parameters: params.parameters || {},
      user_feedback: params.userFeedback,
      interrupt_on_human_approval: params.interruptOnHumanApproval ?? false,
    }),
  });

  if (!agentRes.ok) {
    throw new Error(`Agent engine returned HTTP ${agentRes.status}`);
  }

  return await agentRes.json();
}

export async function getWorkflowState(runId: string): Promise<WorkflowRunResponse> {
  try {
    const res = await fetch(`${NODE_API_BASE}/projects/workflows/${runId}/state`);
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (e) {
    // Fallback to direct FastAPI
  }

  const res = await fetch(`${AGENTS_API_BASE}/workflows/${runId}/state`);
  return await res.json();
}