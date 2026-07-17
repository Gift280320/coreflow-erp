import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Unauthorized - No token' });
    }

    console.log('🔐 Token received:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    console.log('✅ Decoded userId:', decoded.userId);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    if (!user.isActive) {
      console.log('❌ Account disabled');
      return res.status(401).json({ message: 'Unauthorized - Account disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};