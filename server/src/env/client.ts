import { formatErrors } from './helpers';
import { clientEnv, clientSchema } from './schema';

const _clientEnv = clientSchema.safeParse(clientEnv);

if (_clientEnv.success === false) {
    console.error('❌ Invalid environment variables:\n', ...formatErrors(_clientEnv.error.format()));
    throw new Error('Invalid environment variables');
}

for (const key of Object.keys(_clientEnv.data)) {
    if (!key.startsWith('NEXT_PUBLIC_')) {
        console.warn('❌ Invalid public environment variable name:', key);

        throw new Error('Invalid public environment variable name');
    }
}

export const env = _clientEnv.data;
