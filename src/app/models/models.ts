export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export const STATUSES: Status[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const STATUS_LABELS: Record<Status, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface CategoryRequest {
  name: string;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  done: boolean;
  status: Status;
  position: number;
  categoryId: number | null;
  priority: Priority;
  createdAt: string;
}

export interface TaskRequest {
  title: string;
  categoryId: number | null;
  priority: Priority;
}

export interface MoveRequest {
  status: Status;
  position: number;
}

export interface BoardColumn {
  status: Status;
  title: string;
  tasks: Task[];
}

export interface TaskFilters {
  categoryId?: number | null;
  done?: boolean | null;
  priority?: Priority | null;
}

export interface Stats {
  total: number;
  done: number;
  pending: number;
  completionRate: number;
  byCategory: { categoryId: number; name: string; count: number }[];
  byPriority: Record<Priority, number>;
  byStatus: Record<Status, number>;
}

export interface Health {
  status: string;
  time: string;
}
