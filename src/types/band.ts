export type Band = {
  id: number;
  bandName: string;
  city: string;
  contact: string | null;
  coverPicture: string | null;
  createdAt: string;
  deletedAt: string | null;
  description: string | null;
  facebook: string | null;
  genre: string;
  instagram: string | null;
  members: number | null;
  profilePicture: string | null;
  twitter: string | null;
  updatedAt: string;
  userId: {
    id: string;
    role: string;
  };
};
