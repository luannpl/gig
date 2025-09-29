// Para testes em dispositivos móveis, talvez seja necessário substituir 'localhost'
// pelo endereço IP da sua máquina na rede local (ex: 'http://192.168.1.10:5500').
const API_URL = 'http://localhost:5500';

export const getPosts = async () => {
  try {
    const response = await fetch(`${API_URL}/posts`);
    
    if (!response.ok) {
      // Tenta ler o corpo do erro para mais detalhes
      const errorData = await response.text();
      console.error('API response not OK:', errorData);
      throw new Error(`A resposta da rede não foi 'ok': ${response.statusText}`);
    }

    const data = await response.json();
    return data.posts; // Retorna apenas o array de posts
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};