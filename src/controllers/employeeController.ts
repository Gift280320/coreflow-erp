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
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message });
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
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { userId, departmentId, jobTitle, hireDate, salary, status } = req.body;
    // Validate required fields
    if (!userId || !departmentId || !jobTitle || !hireDate) {
      return res.status(400).json({ message: 'Missing required fields: userId, departmentId, jobTitle, hireDate' });
    }
    // Convert empty string salary to null
    const salaryValue = salary && salary !== '' ? parseFloat(salary) : null;
    const employee = await prisma.employee.create({
      data: {
        userId,
        departmentId,
        jobTitle,
        hireDate: new Date(hireDate),
        salary: salaryValue,
        status: status || 'active',
      },
      include: { user: true, department: true },
    });
    res.status(201).json(employee);
  } catch (error: any) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId, jobTitle, hireDate, salary, status } = req.body;
    const salaryValue = salary && salary !== '' ? parseFloat(salary) : null;
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        departmentId,
        jobTitle,
        hireDate: new Date(hireDate),
        salary: salaryValue,
        status,
      },
      include: { user: true, department: true },
    });
    res.json(employee);
  } catch (error: any) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};
