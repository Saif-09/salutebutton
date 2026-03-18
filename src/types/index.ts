export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type Celeb = {
  _id: string;
  name: string;
  image: string;
  category: Category;
  respectors: number;
  dispiters: number;
  comment: string;
};

export type User = {
  token: string;
  userId: string;
  username: string;
};

export type FeedbackType = "feedback" | "improvement" | "bug" | "other";

export type Feedback = {
  name?: string;
  email?: string;
  type: FeedbackType;
  message: string;
};

export type Particle = {
  id: number;
  x: number;
  emoji: string;
};

export type GroupProfile = {
  _id: string;
  name: string;
  description: string;
  image: string;
  respectors: number;
  dispiters: number;
};

export type Group = {
  _id: string;
  name: string;
  code: string;
  isPublic: boolean;
  createdBy: { _id: string; username: string };
  admins: { _id: string; username: string }[];
  members: { _id: string; username: string }[];
  profiles: GroupProfile[];
  createdAt: string;
};
