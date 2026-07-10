export interface Profile {
  id: string;
  username: string;
  program: string;
  yearStanding: string;
  chatLink: string;
  photoUrl: string;
  skills: string;
  userId: string;
  createdAt: string;
  mentorshipLink?: string;
  mentorshipPrice?: number;
  userType: ("student" | "company")[];
  bio?: string;
  headline?: string;
  collaborationLink?: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: string;
  projectType?: string;
  status?: string;
  requiredSkills?: string;
  profile: Profile;
}
