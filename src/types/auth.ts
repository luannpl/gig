export type BandSignUpData = {
  name: string;
  city: string;
  genre: string;
  email: string;
  password: string;
  role: "band";
};

export type VenueSignUpData = {
  name: string;
  cep: string;
  city: string;
  address: string;
  type: string;
  email: string;
  password: string;
  role: "venue";
};

export type CepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};
