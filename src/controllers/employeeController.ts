import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          department: true,
          role: true,
          company: true,
        },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error: any) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: true,
        role: true,
        company: true,
      },
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error: any) {
    console.error('Get employee by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      position,
      departmentId,
      roleId,
      userId,
      managerId,
      hireDate,
      salary,
      status,
    } = req.body;

    const user = (req as any).user;
    const companyId = user?.companyId;

    if (!companyId) {
      return res.status(400).json({ error: 'Logged-in user has no company assigned' });
    }

    if (!employeeId || !firstName || !lastName || !email || !position || !hireDate) {
      return res.status(400).json({
        error: 'Missing required fields: employeeId, firstName, lastName, email, position, hireDate are required',
      });
    }

    const existing = await prisma.employee.findFirst({
      where: { OR: [{ employeeId }, { email }] },
    });
    if (existing) {
      return res.status(400).json({
        error: existing.employeeId === employeeId ? 'Employee ID already exists' : 'Email already exists',
      });
    }

    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return res.status(400).json({ error: 'User not found' });
      }
      const existingEmployeeForUser = await prisma.employee.findFirst({ where: { userId } });
      if (existingEmployeeForUser) {
        return res.status(400).json({ error: 'This user is already linked to another employee' });
      }
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        position,
        departmentId: departmentId || null,
        roleId: roleId || null,
        userId: userId || null,
        managerId: managerId || null,
        hireDate: new Date(hireDate),
        salary: salary ? parseFloat(salary) : null,
        status: status || 'ACTIVE',
        companyId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: true,
        role: true,
      },
    });

    res.status(201).json(employee);
  } catch (error: any) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      departmentId,
      roleId,
      userId,
      managerId,
      hireDate,
      salary,
      status,
    } = req.body;

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Validate email uniqueness (if changed)
    if (email && email !== existing.email) {
      const emailExists = await prisma.employee.findFirst({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Validate userId uniqueness (if changed)
    if (userId && userId !== existing.userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return res.status(400).json({ error: 'User not found' });
      }
      const existingEmployeeForUser = await prisma.employee.findFirst({ where: { userId } });
      if (existingEmployeeForUser) {
        return res.status(400).json({ error: 'This user is already linked to another employee' });
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        departmentId: departmentId || null,
        roleId: roleId || null,
        userId: userId || null,
        managerId: managerId || null,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        salary: salary ? parseFloat(salary) : null,
        status: status || 'ACTIVE',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: true,
        role: true,
      },
    });

    res.json(employee);
  } catch (error: any) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: error.message });
  }
};
