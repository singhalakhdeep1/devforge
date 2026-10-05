import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ error: 'Valid courseId is required' });
    }
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const userId = req.user.id;
    const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
    if (existing) return res.status(200).json(existing);

    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.create({ data: { userId, courseId } }),
      prisma.course.update({ where: { id: courseId }, data: { students: { increment: 1 } } }),
    ]);
    return res.status(201).json(enrollment);
  } catch {
    return res.status(500).json({ error: 'Failed to create enrollment' });
  }
};

export const getEnrollments = async (req: Request, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      orderBy: { enrolledAt: 'desc' },
    });
    return res.json(enrollments);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid enrollment id' });
    const enrollment = await prisma.enrollment.findFirst({ where: { id, userId: req.user.id } });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    return res.json(enrollment);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
};

export const cancelEnrollment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid enrollment id' });
    const enrollment = await prisma.enrollment.findFirst({ where: { id, userId: req.user.id } });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    await prisma.$transaction([
      prisma.enrollment.delete({ where: { id } }),
      prisma.course.update({ where: { id: enrollment.courseId }, data: { students: { decrement: 1 } } }),
    ]);
    return res.json({ message: 'Enrollment cancelled successfully' });
  } catch {
    return res.status(500).json({ error: 'Failed to cancel enrollment' });
  }
};
