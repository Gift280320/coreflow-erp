import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDepartments = async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    include: { manager: true },
    orderBy: { name: 'asc' },
  });
  res.json(departments);
};

export const getDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const department = await prisma.department.findUnique({
    where: { id },
    include: { manager: true },
  });
  if (!department) return res.status(404).json({ message: 'Department not found' });
  res.json(department);
};

export const createDepartment = async (req: Request, res: Response) => {
  const { name, description, managerId } = req.body;
  const department = await prisma.department.create({
    data: { name, description, managerId },
    include: { manager: true },
  });
  res.status(201).json(department);
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, managerId } = req.body;
  const department = await prisma.department.update({
    where: { id },
    data: { name, description, managerId },
    include: { manager: true },
  });
  res.json(department);
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.department.delete({ where: { id } });
  res.status(204).send();
};
