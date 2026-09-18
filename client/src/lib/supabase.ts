import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: import.meta.env.DEV
		? {
				lock: async <Result>(_name: string, _acquireTimeout: number, callback: () => Promise<Result>) => callback(),
			}
		: undefined,
})
