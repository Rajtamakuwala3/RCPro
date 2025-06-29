import dotenv from 'dotenv'
import supabase, { checkSupabaseConnection } from './db/dbConnect.js'
import { app } from './app.js'

// Configure environment variables
dotenv.config({
    path: './.env',
})

const PORT = process.env.PORT || 3000

// console.log(PORT)

const startServer = async () => {
    try {
        // Check Supabase connection before starting server
        console.log('Checking Supabase connection...')
        const connectionStatus = await checkSupabaseConnection()

        if (connectionStatus.connected) {
            console.log('✅ Supabase connection established successfully')
            
            // Start Express server
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`)
            })
        } else {
            console.error('❌ Failed to connect to Supabase:', connectionStatus.error)
            process.exit(1) // Exit with error code
        }
    } catch (error) {
        console.error('❌ Error starting server:', error)
        process.exit(1)
    }
}

// Start the application
startServer()