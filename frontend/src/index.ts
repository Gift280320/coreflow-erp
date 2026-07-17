import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
// ... other imports ...
import dashboardRoutes from './routes/dashboard';
import searchRoutes from './routes/search';
import activityRoutes from './routes/activity';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Auth
app.use('/api/auth', authRoutes);

// Core modules
app.use('/api/users', userRoutes);
// ... other routes ...

// NEW ROUTES - Must be after auth and before errorHandler
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity', activityRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));