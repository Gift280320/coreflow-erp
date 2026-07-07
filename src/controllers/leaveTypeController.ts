import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(types);
  } catch (error: any) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { name, description, daysPerYear, isActive } = req.body;
    if (!name || daysPerYear === undefined) {
      return res.status(400).json({ message: 'Name and daysPerYear are required' });
    }
    const leaveType = await prisma.leaveType.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        daysPerYear: parseFloat(daysPerYear),
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(leaveType);
  } catch (error: any) {
    console.error('Error creating leave type:', error);
    // Handle duplicate name
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A leave type with this name already exists.' });
    }
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, daysPerYear, isActive } = req.body;
    const leaveType = await prisma.leaveType.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        daysPerYear: parseFloat(daysPerYear),
        isActive,
      },
    });
    res.json(leaveType);
  } catch (error: any) {
    console.error('Error updating leave type:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A leave type with this name already exists.' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteLeaveType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.leaveType.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting leave type:', error);
    res.status(500).json({ error: error.message });
  }
};
