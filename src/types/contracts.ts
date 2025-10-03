export interface Contract {
  id: string;
  title: string;
  status: 'Pendente' | 'Aceito' | 'Recusado'; // Usando Union Types para status definidos
  type: string;
  dateTime: string;
  location: string;
  price: string;
}