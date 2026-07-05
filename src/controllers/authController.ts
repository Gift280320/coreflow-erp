import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET!, { expiresIn: '7d' });

  await prisma.session.create({
    data: {
      token: refreshToken,
      userId: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ accessToken, user: { id: user.id, email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as any;
    const session = await prisma.session.findUnique({ where: { token: refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await prisma.session.deleteMany({ where: { token: refreshToken } });
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};
