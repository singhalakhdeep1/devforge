import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

const moduleCount = (modules: unknown) => (Array.isArray(modules) && modules.length > 0 ? modules.length : 1);

export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    res.json(await prisma.course.findMany({ orderBy: { createdAt: 'desc' } }));
  } catch {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.json(course);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch course' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const course = await prisma.course.create({
      data: {
        title: body.title ?? 'Untitled course',
        description: body.description ?? 'No description provided',
        instructor: body.instructor ?? 'System',
        rating: Number(body.rating ?? 0),
        students: 0,
        duration: body.duration ?? '4 hours',
        level: body.level ?? 'Beginner',
        price: Number(body.price ?? 0),
        category: body.category ?? 'General',
        modules: Array.isArray(body.modules) ? body.modules : [],
      },
    });
    return res.status(201).json(course);
  } catch {
    return res.status(500).json({ error: 'Failed to create course' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });
    const body = req.body ?? {};
    const data: Record<string, unknown> = {};
    for (const key of ['title', 'description', 'instructor', 'duration', 'level', 'category']) {
      if (typeof body[key] === 'string') data[key] = body[key];
    }
    for (const key of ['rating', 'price']) {
      if (body[key] !== undefined && Number.isFinite(Number(body[key]))) data[key] = Number(body[key]);
    }
    if (Array.isArray(body.modules)) data.modules = body.modules;

    const course = await prisma.course.update({ where: { id }, data });
    return res.json(course);
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Course not found' });
    return res.status(500).json({ error: 'Failed to update course' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });
    await prisma.course.delete({ where: { id } });
    return res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Course not found' });
    return res.status(500).json({ error: 'Failed to delete course' });
  }
};

export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const userId = req.user.id;
    const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: id } } });
    if (existing) return res.json({ message: 'User already enrolled', enrollment: existing });

    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.create({ data: { userId, courseId: id } }),
      prisma.course.update({ where: { id }, data: { students: { increment: 1 } } }),
    ]);
    return res.status(201).json(enrollment);
  } catch {
    return res.status(500).json({ error: 'Failed to enroll in course' });
  }
};

export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: { course: true },
      orderBy: { enrolledAt: 'desc' },
    });
    return res.json(enrollments.map(({ course, ...enrollment }) => ({ ...course, enrollment })));
  } catch {
    return res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
};

export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: id } },
      include: { course: true },
    });
    if (!enrollment) return res.status(404).json({ error: 'Not enrolled in this course' });
    return res.json({
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      totalLessons: moduleCount(enrollment.course.modules),
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch course progress' });
  }
};

export const updateCourseProgress = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid course id' });
    const userId = req.user.id;
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
      include: { course: true },
    });
    if (!enrollment) return res.status(404).json({ error: 'Not enrolled in this course' });

    const totalLessons = moduleCount(enrollment.course.modules);
    const lessonNumber = Number(req.body?.lessonId ?? 1);
    const completedLessons = Math.min(Math.max(Number.isFinite(lessonNumber) ? lessonNumber : 1, enrollment.completedLessons, 1), totalLessons);
    const progress = Math.round((completedLessons / totalLessons) * 100);

    await prisma.enrollment.update({ where: { id: enrollment.id }, data: { completedLessons, progress } });
    return res.json({ progress, completedLessons, totalLessons });
  } catch {
    return res.status(500).json({ error: 'Failed to update progress' });
  }
};
