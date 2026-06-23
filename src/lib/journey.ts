import type { JourneyStage, TaskStatus } from '../types';

// The 4-stage development journey (spec §5). Stage names and default tasks are stored
// as data on each candidate so they can diverge per candidate over time.
const STAGE_TEMPLATE: { code: string; name: string; tasks: string[] }[] = [
  {
    code: 'STG1',
    name: 'Assessment & Planning',
    tasks: [
      'Review the current leadership structure',
      'Define the target role profile',
      'Agree on selection criteria',
    ],
  },
  {
    code: 'STG2',
    name: 'Building & Development',
    tasks: [
      'Run the qualification program',
      'Assign a mentor',
      'Track progress against the plan',
    ],
  },
  {
    code: 'STG3',
    name: 'Application & Evaluation',
    tasks: [
      'Lead a stretch assignment',
      'Evaluate development outcomes',
      'Refine the plan',
    ],
  },
  {
    code: 'STG4',
    name: 'Sustainability & Improvement',
    tasks: ['Follow up after transition', 'Monitor sustained impact'],
  },
];

let taskCounter = 0;

export function defaultJourney(initialStatuses: TaskStatus[][] = []): JourneyStage[] {
  return STAGE_TEMPLATE.map((stage, si) => ({
    code: stage.code,
    name: stage.name,
    tasks: stage.tasks.map((title, ti) => ({
      id: `task-${stage.code}-${ti}-${taskCounter++}`,
      title,
      status: initialStatuses[si]?.[ti] ?? ('notStarted' as TaskStatus),
    })),
  }));
}
