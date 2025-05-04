import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with absolute path
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

let supabase = null
let connectionError = null

try {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or API key is missing in environment variables')
    }
    
    supabase = createClient(supabaseUrl, supabaseKey)
    // console.log(supabase)
} catch (error) {
    connectionError = error.message
    console.error('Failed to initialize Supabase client:', error.message)
}

export const checkSupabaseConnection = async () => {
    if (!supabase) {
        return { connected: false, error: connectionError || 'Supabase client not initialized' }
    }
    
    try {
        // Use a simple RPC call to check connection without querying tables
        const { error, data } = await supabase.rpc('get_service_status')
        // console.log(data)
        if (error) {
            // Fall back to a simpler check - just retrieving auth config
            const { error: authError } = await supabase.auth.getSession()
            
            if (authError) {
                console.error('Error connecting to Supabase:', authError)
                return { connected: false, error: authError.message }
            }
        }
        
        console.log('Connected to Supabase successfully')
        return { connected: true }
    } catch (error) {
        console.error('Error checking Supabase connection:', error)
        return { connected: false, error: error.message }
    }
}

export default supabase