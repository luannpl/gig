export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
};

export type ReviewCreateDto = {
  comment?: string;
  rating: number;
  bandId: number;
  userId: string;
};
