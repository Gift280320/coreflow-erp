import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(leaveTypes);
  } catch (error: any) {
    console.error('Get leave types error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { name, code, description, daysAllowed, isActive } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    // Check if code already exists
    const existing = await prisma.leaveType.findUnique({
      where: { code },
    });
    if (existing) {
      return res.status(400).json({ error: 'Leave type code already exists' });
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        name,
        code,
        description: description || null,
        daysAllowed: daysAllowed ? parseInt(daysAllowed) : 30,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(leaveType);
  } catch (error: any) {
    console.error('Create leave type error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, daysAllowed, isActive } = req.body;

    const existing = await prisma.leaveType.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Leave type not found' });
    }

    // If code is changed, check uniqueness
    if (code && code !== existing.code) {
      const duplicate = await prisma.leaveType.findUnique({ where: { code } });
      if (duplicate) {
        return res.status(400).json({ error: 'Leave type code already exists' });
      }
    }

    const leaveType = await prisma.leaveType.update({
      where: { id },
      data: {
        name: name || existing.name,
        code: code || existing.code,
        description: description !== undefined ? description : existing.description,
        daysAllowed: daysAllowed ? parseInt(daysAllowed) : existing.daysAllowed,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    res.json(leaveType);
  } catch (error: any) {
    console.error('Update leave type error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteLeaveType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.leaveType.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Leave type not found' });
    }
    await prisma.leaveType.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete leave type error:', error);
    res.status(500).json({ error: error.message });
  }
};
