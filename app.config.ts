import type { ExpoConfig } from '@expo/config-types'

export default ({ config }: { config: ExpoConfig}): ExpoConfig => ({
    ...config,
    extra: {
        apiUrl: process.env.API_URL || 'http://localhost:8081',
        env: process.env.NODE_ENV
    }
})