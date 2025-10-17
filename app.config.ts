import type { ExpoConfig } from '@expo/config-types'

// Determina a URL da API baseado no ambiente
const getApiUrl = () => {
  // Se houver variável de ambiente definida, use ela
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  
  // Para desenvolvimento local
  // IMPORTANTE: Substitua pelo seu IP local se estiver testando em dispositivo físico
  // Execute 'ipconfig' (Windows) ou 'ifconfig' (Mac/Linux) para encontrar seu IP
  return 'http://localhost:5500';
};

export default ({ config }: { config: ExpoConfig}): ExpoConfig => ({
    ...config,
    extra: {
        apiUrl: getApiUrl(),
        env: process.env.NODE_ENV || 'development'
    }
})