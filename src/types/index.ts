export type ProblemType = 'DSA' | 'SD' | 'DB';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Status = 'pending' | 'progress' | 'done';

export interface Problem {
  id: string;
  title: string;
  type: ProblemType;
  diff: Difficulty;
  tags: string[];
  week: number;
  url?: string;
  description: string;
}

export interface Participant {
  id: string;
  name: string;
  created_at: string;
}

export interface Pair {
  id: string;
  week_number: number;
  member1: string;
  member2: string;
  created_at: string;
}

export interface PairSubmission {
  id: string;
  pair_id: string;
  week_number: number;
  problem_id: string;
  status: Status;
  code?: string;
  explanation?: string;
  image_url?: string;
  db_schema?: string;
  db_explanation?: string;
  assessment?: string;
  assessed_at?: string;
  notion_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PairWithSubmissions extends Pair {
  submissions: PairSubmission[];
}
