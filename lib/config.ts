export const APP_CONFIG = {
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
    api: {
        n8nWebhookBase: process.env.N8N_WEBHOOK_BASE || '',
        n8nApiKey: process.env.N8N_API_KEY || '',
    },
};
