import { Request, Response } from 'express';

type Course = {
  id: number;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  price: number;
  category: string;
  modules: Array<{ id: number; title: string; duration: string; completed: boolean }>;
};

const courseStore: Course[] = [
  {
    id: 1,
    title: 'Complete React Developer',
    description: 'Learn React from scratch and build production-ready applications',
    instructor: 'John Smith',
    rating: 4.8,
    students: 12500,
    duration: '40 hours',
    level: 'Beginner',
    price: 99,
    category: 'Frontend',
    modules: [
      { id: 1, title: 'React fundamentals', duration: '2h', completed: true },
      { id: 2, title: 'Hooks and state', duration: '3h', completed: true },
      { id: 3, title: 'Routing and data fetching', duration: '4h', completed: false },
      { id: 4, title: 'Deployment patterns', duration: '2h', completed: false },
    ],
  },
  {
    id: 2,
    title: 'Node.js API Mastery',
    description: 'Design production APIs with Express, security, testing, and deployment practices.',
    instructor: 'Alicia Reed',
    rating: 4.9,
    students: 9800,
    duration: '35 hours',
    level: 'Intermediate',
    price: 129,
    category: 'Backend',
    modules: [
      { id: 1, title: 'REST design', duration: '2h', completed: true },
      { id: 2, title: 'Authentication', duration: '3h', completed: true },
      { id: 3, title: 'Queues and jobs', duration: '4h', completed: false },
    ],
  },
];

const enrollmentStore: Array<{ id: number; userId: string; courseId: number; enrolledAt: Date; progress: number }> = [];
const progressStore: Record<string, { progress: number; completedLessons: number; totalLessons: number }> = {};

export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    res.json(courseStore);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const course = courseStore.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.json(course);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch course' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseData = req.body ?? {};
    const payload = {
      id: Date.now(),
      title: courseData.title ?? 'Untitled course',
      description: courseData.description ?? 'No description provided',
      instructor: courseData.instructor ?? 'System',
      rating: Number(courseData.rating ?? 4.5),
      students: Number(courseData.students ?? 0),
      duration: courseData.duration ?? '4 hours',
      level: courseData.level ?? 'Beginner',
      price: Number(courseData.price ?? 0),
      category: courseData.category ?? 'General',
      modules: Array.isArray(courseData.modules) ? courseData.modules : [],
    } as Course;

    courseStore.unshift(payload);
    return res.status(201).json(payload);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create course' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const courseIndex = courseStore.findIndex((item) => item.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updated = {
      ...courseStore[courseIndex],
      ...req.body,
      id: courseId,
      modules: Array.isArray(req.body.modules) ? req.body.modules : courseStore[courseIndex].modules,
    } as Course;

    courseStore[courseIndex] = updated;
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update course' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const initialLength = courseStore.length;

    for (let index = courseStore.length - 1; index >= 0; index -= 1) {
      if (courseStore[index].id === courseId) {
        courseStore.splice(index, 1);
      }
    }

    if (courseStore.length === initialLength) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete course' });
  }
};

export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user?.id ?? 'anonymous-user';

    const course = courseStore.find((item) => item.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existing = enrollmentStore.find((entry) => entry.userId === userId && entry.courseId === courseId);
    if (existing) {
      return res.json({ message: 'User already enrolled', enrollment: existing });
    }

    const enrollment = {
      id: Date.now(),
      userId,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
    };

    enrollmentStore.push(enrollment);
    progressStore[`${userId}:${courseId}`] = {
      progress: 0,
      completedLessons: 0,
      totalLessons: course.modules.length || 1,
    };

    return res.status(201).json(enrollment);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to enroll in course' });
  }
};

export const getEnrolledCourses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'anonymous-user';
    const enrolled = enrollmentStore.filter((entry) => entry.userId === userId);
    const courses = enrolled.map((entry) => {
      const course = courseStore.find((item) => item.id === entry.courseId);
      return course ? { ...course, enrollment: entry } : null;
    }).filter(Boolean);

    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
};

export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user?.id ?? 'anonymous-user';
    const course = courseStore.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const progress = progressStore[`${userId}:${courseId}`] ?? {
      progress: 25,
      completedLessons: 1,
      totalLessons: course.modules.length || 1,
    };

    return res.json(progress);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch course progress' });
  }
};

export const updateCourseProgress = async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user?.id ?? 'anonymous-user';
    const { lessonId } = req.body ?? {};
    const lessonNumber = Number(lessonId ?? 1);
    const course = courseStore.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const totalLessons = course.modules.length || 1;
    const completedLessons = Math.min(Math.max(lessonNumber, 1), totalLessons);
    const progress = Math.round((completedLessons / totalLessons) * 100);

    const nextProgress = {
      progress,
      completedLessons,
      totalLessons,
    };

    progressStore[`${userId}:${courseId}`] = nextProgress;
    return res.json(nextProgress);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update progress' });
  }
};