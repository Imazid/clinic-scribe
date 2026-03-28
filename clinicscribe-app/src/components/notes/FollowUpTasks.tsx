'use client';

import { Card, CardTitle } from '@/components/ui/Card';
import type { FollowUpTask } from '@/lib/types';
import { ListChecks } from 'lucide-react';

interface FollowUpTasksProps {
  tasks: FollowUpTask[];
  onToggle: (index: number) => void;
}

export function FollowUpTasksSection({ tasks, onToggle }: FollowUpTasksProps) {
  if (tasks.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="w-5 h-5 text-secondary" />
        <CardTitle>Follow-up Tasks</CardTitle>
      </div>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(i)}
              className="mt-0.5 w-4 h-4 rounded accent-secondary"
            />
            <div>
              <p className={`text-sm ${task.completed ? 'text-outline line-through' : 'text-on-surface'}`}>
                {task.description}
              </p>
              {task.due_date && (
                <p className="text-xs text-on-surface-variant mt-0.5">Due: {task.due_date}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </Card>
  );
}
