import { Request, Response } from 'express';

type Enrollment = {
  id: number;
  courseId: number;
  userId: string;
  enrolledAt: Date;
  progress: number;
};

const enrollmentStore: Enrollment[] = [
  {
    id: 1,
    courseId: 1,
    userId: 'demo-user',
    enrolledAt: new Date(),
    progress: 25,
  },
];

export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id ?? 'anonymous-user';
    const parsedCourseId = Number(courseId);

    if (!Number.isFinite(parsedCourseId)) {
      return res.status(400).json({ error: 'Valid courseId is required' });
    }

    const existing = enrollmentStore.find((entry) => entry.userId === userId && entry.courseId === parsedCourseId);
    if (existing) {
      return res.status(200).json(existing);
    }

    const enrollment: Enrollment = {
      id: Date.now(),
      courseId: parsedCourseId,
      userId,
      enrolledAt: new Date(),
      progress: 0,
    };

    enrollmentStore.unshift(enrollment);
    return res.status(201).json(enrollment);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create enrollment' });
  }
};

export const getEnrollments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'anonymous-user';
    const enrollments = enrollmentStore.filter((entry) => entry.userId === userId);
    return res.json(enrollments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const enrollment = enrollmentStore.find((entry) => entry.id === Number(id));

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    return res.json(enrollment);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
};

export const cancelEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = enrollmentStore.findIndex((entry) => entry.id === Number(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    enrollmentStore.splice(index, 1);
    return res.json({ message: 'Enrollment cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel enrollment' });
  }
};