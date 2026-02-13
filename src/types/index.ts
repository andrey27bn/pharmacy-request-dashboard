export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type Status =
  | 'new'
  | 'declined'
  | 'under_review'
  | 'in_progress'
  | 'awaiting_parts'
  | 'ready'
  | 'closed';

export interface Request {
  id: string;
  number: string;
  pharmacy: {
    id: string;
    address: string;
  };
  createdAt: string;
  createdTime: string;
  priority: Priority;
  title: string;
  category: string;
  technician: string;
  deadline: string;
  decision: string;
  status: Status;
}

export interface CreateRequestFormData {
  pharmacy: string;
  category: string;
  isWarranty: boolean;
  title: string;
  priority: Priority;
  description: string;
  files: File[];
}