import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import departmentRoutes from './routes/departments';
import employeeRoutes from './routes/employees';
import leaveTypeRoutes from './routes/leaveTypes';
import leaveRequestRoutes from './routes/leaveRequests';
import supplierRoutes from './routes/suppliers';
import purchaseRequestRoutes from './routes/purchaseRequests';
import purchaseOrderRoutes from './routes/purchaseOrders';
import productRoutes from './routes/products';
import warehouseRoutes from './routes/warehouses';
import stockRoutes from './routes/stock';
import customerRoutes from './routes/customers';
import invoiceRoutes from './routes/invoices';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
