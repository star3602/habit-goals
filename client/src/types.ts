export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type GoalBase = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type Goal = GoalBase & {
  checkedInToday: boolean;
  streak: number;
  totalDays: number;
};

export type Checkin = {
  id: string;
  goal_id: string;
  user_id: string;
  date: string;
  created_at: string;
};

export type GoalCheckinsResponse = {
  goal: GoalBase;
  checkins: Checkin[];
  streak: number;
  totalDays: number;
};
