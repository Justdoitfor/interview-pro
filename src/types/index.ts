export interface Question {
  id: string;
  title: string;
  content: string; // Markdown
  answer: string; // Markdown
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: 0 | 1 | 2; // 0: 未掌握, 1: 模糊, 2: 熟练
  lastReviewedAt: number; // timestamp
  reviewCount: number;
  nextReviewAt: number; // timestamp
  intervalDays: number;
  easeFactor: number;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
