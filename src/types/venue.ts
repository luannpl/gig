export interface User {
  id: string;
  email: string;
  password: string;
  role: "venue" | "band" | "client" | string;
  name: string;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  cep: string;
  city: string;
  description: string | null;
  address: string;
  contact: string | null;
  coverPhoto: string | null;
  profilePhoto: string | null;
  twitter: string | null;
  instagram: string | null;
  facebook: string | null;
  user: User;
}
