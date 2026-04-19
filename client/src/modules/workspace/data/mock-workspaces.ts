import { Briefcase, MessagesSquare, School } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type WorkspaceAccent = 'primary' | 'container' | 'tertiary';

export interface WorkspacePreview {
  id: string;
  name: string;
  description: string;
  plan: string;
  icon: LucideIcon;
  wordCount: number;
  wordTarget: number;
  masteredCount: number;
  reviewDueCount: number;
  streak: number;
  isActive: boolean;
  accent: WorkspaceAccent;
}

export const MOCK_WORKSPACES: WorkspacePreview[] = [
  {
    id: 'default-workspace',
    name: 'IELTS Prep',
    description:
      'Academic reading and listening focusing on vocabulary for band 8.0+',
    plan: 'Pro Plan',
    icon: School,
    wordCount: 1420,
    wordTarget: 3000,
    masteredCount: 1420,
    reviewDueCount: 28,
    streak: 14,
    isActive: true,
    accent: 'primary',
  },
  {
    id: 'ws-business',
    name: 'Business English',
    description:
      'Formal negotiation patterns and professional presentation lexicons.',
    plan: 'Pro Plan',
    icon: Briefcase,
    wordCount: 845,
    wordTarget: 1500,
    masteredCount: 845,
    reviewDueCount: 18,
    streak: 6,
    isActive: false,
    accent: 'container',
  },
  {
    id: 'ws-daily',
    name: 'Daily Conversation',
    description:
      'Idiomatic expressions and common slang for natural communication.',
    plan: 'Free Plan',
    icon: MessagesSquare,
    wordCount: 2110,
    wordTarget: 2500,
    masteredCount: 2110,
    reviewDueCount: 42,
    streak: 21,
    isActive: false,
    accent: 'tertiary',
  },
];
