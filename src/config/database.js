import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('⚠️  No MongoDB URI found. Running in in-memory mode.');
            return null;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        isConnected = true;
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

        // Graceful close on app termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.log(`⚠️  MongoDB connection failed: ${error.message}`);
        console.log('⚠️  Running in in-memory mode. See MONGODB_SETUP.md for database setup.');
        isConnected = false;
        return null;
    }
};

export { connectDB, isConnected };
export default connectDB;
