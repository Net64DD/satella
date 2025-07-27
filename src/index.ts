import dotEnv from 'dotenv';
import startServer from './app';
import mongoose from 'mongoose';

dotEnv.config();

const main = async () => {
    const app = await startServer();
    await mongoose.connect(process.env.MONGODB_URI as string);
    app.listen(app.get('port'), () => {
        console.log(`Server running on port ${app.get('port')}`);
    });
};

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('close', () => {
    console.error('Closed MongoDB connection');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

main().catch(console.error);