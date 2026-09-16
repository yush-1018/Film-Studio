import assert from 'node:assert';
import { test } from 'node:test';
import { CreateProjectSchema, TriggerWorkflowRequestSchema } from '../contracts/types';

test('Contracts: CreateProjectSchema validates valid project input', () => {
  const valid = {
    title: 'Neon Horizon',
    logline: 'In a rain-drenched cyberpunk metropolis, a rogue synthetics detective uncovers an artificial memory syndicate.',
    genre: 'Cyberpunk Thriller',
    aspectRatio: '2.39:1',
    visualStyle: 'cyberpunk_noir',
  };

  const parsed = CreateProjectSchema.parse(valid);
  assert.strictEqual(parsed.title, 'Neon Horizon');
  assert.strictEqual(parsed.aspectRatio, '2.39:1');
});

test('Contracts: CreateProjectSchema rejects invalid aspect ratio', () => {
  const invalid = {
    title: 'Neon Horizon',
    logline: 'Short valid logline.',
    genre: 'Drama',
    aspectRatio: 'invalid_ratio',
  };

  assert.throws(() => {
    CreateProjectSchema.parse(invalid);
  });
});

test('Contracts: TriggerWorkflowRequestSchema validates agent trigger request', () => {
  const validTrigger = {
    projectId: 'proj_12345',
    workflowType: 'script_to_storyboard',
    parameters: { numScenes: 3 },
    interruptOnHumanApproval: true,
  };

  const parsed = TriggerWorkflowRequestSchema.parse(validTrigger);
  assert.strictEqual(parsed.workflowType, 'script_to_storyboard');
  assert.strictEqual(parsed.interruptOnHumanApproval, true);
});
