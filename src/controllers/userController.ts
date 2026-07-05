import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get current user (me)
export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { role: true },
  });
  res.json(user);
};

// Get all users (with pagination and search)
export const getUsers = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = search ? {
    OR: [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { role: true, company: true },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ data: users, total, page: Number(page), limit: Number(limit) });
};

// Get single user
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true, company: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// Create user (admin only)
export const createUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, roleId, companyId } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      roleId,
      companyId,
    },
    include: { role: true },
  });
  res.status(201).json(user);
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, firstName, lastName, roleId, isActive } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: { email, firstName, lastName, roleId, isActive },
    include: { role: true },
  });
  res.json(user);
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
};
