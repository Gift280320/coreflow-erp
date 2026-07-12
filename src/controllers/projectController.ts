import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = status as string;
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: { manager: true, tasks: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    console.log('📦 Received project data:', req.body);
    const { name, description, startDate, endDate, status, priority, budget, managerId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'planning',
        priority: priority || 'medium',
        budget: budget ? parseFloat(budget) : null,
        managerId: managerId || null,
      },
      include: { manager: true },
    });
    res.status(201).json(project);
  } catch (error: any) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status, priority, budget, spent, managerId } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'planning',
        priority: priority || 'medium',
        budget: budget ? parseFloat(budget) : null,
        spent: spent ? parseFloat(spent) : null,
        managerId: managerId || null,
      },
      include: { manager: true, tasks: true },
    });
    res.json(project);
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
};
