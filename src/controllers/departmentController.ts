import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: { manager: true },
      orderBy: { name: 'asc' },
    });
    res.json(departments);
  } catch (error: any) {
    console.error('Error in getDepartments:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: { manager: true },
    });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error: any) {
    console.error('Error in getDepartment:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description, managerId } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Department name is required' });
    }
    // Convert empty string or whitespace to null
    let managerIdValue = null;
    if (managerId && typeof managerId === 'string' && managerId.trim() !== '') {
      managerIdValue = managerId.trim();
    }
    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        managerId: managerIdValue,
      },
      include: { manager: true },
    });
    res.status(201).json(department);
  } catch (error: any) {
    console.error('Error in createDepartment:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Department name is required' });
    }
    let managerIdValue = null;
    if (managerId && typeof managerId === 'string' && managerId.trim() !== '') {
      managerIdValue = managerId.trim();
    }
    const department = await prisma.department.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        managerId: managerIdValue,
      },
      include: { manager: true },
    });
    res.json(department);
  } catch (error: any) {
    console.error('Error in updateDepartment:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error in deleteDepartment:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};
