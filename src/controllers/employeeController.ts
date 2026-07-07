import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, departmentId, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (departmentId) where.departmentId = departmentId as string;
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { jobTitle: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: { user: true, department: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({ data: employees, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true, department: true },
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { userId, departmentId, jobTitle, hireDate, salary, status } = req.body;
    const employee = await prisma.employee.create({
      data: {
        userId,
        departmentId,
        jobTitle,
        hireDate: new Date(hireDate),
        salary: salary ? parseFloat(salary) : null,
        status: status || 'active',
      },
      include: { user: true, department: true },
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'User already has an employee record' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid user or department ID' });
    }
    res.status(500).json({ message: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId, jobTitle, hireDate, salary, status } = req.body;
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        departmentId,
        jobTitle,
        hireDate: new Date(hireDate),
        salary: salary ? parseFloat(salary) : null,
        status,
      },
      include: { user: true, department: true },
    });
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};
