import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const toId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

export const createDiscussion = async (req: Request, res: Response) => {
  try {
    const { courseId, title, content } = req.body ?? {};
    const parsedCourseId = Number(courseId);
    if (!title || !content || !Number.isInteger(parsedCourseId)) {
      return res.status(400).json({ error: 'courseId, title, and content are required' });
    }
    const discussion = await prisma.discussion.create({
      data: { courseId: parsedCourseId, userId: req.user.id, title: String(title), content: String(content) },
      include: { answers: true },
    });
    return res.status(201).json(discussion);
  } catch {
    return res.status(500).json({ error: 'Failed to create discussion' });
  }
};

export const getDiscussionsByCourse = async (req: Request, res: Response) => {
  try {
    const courseId = toId(req.params.courseId);
    if (courseId === null) return res.status(400).json({ error: 'Invalid course id' });
    const items = await prisma.discussion.findMany({
      where: { courseId },
      include: { answers: { orderBy: { upvotes: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(items);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch discussions' });
  }
};

export const getDiscussionById = async (req: Request, res: Response) => {
  try {
    const id = toId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid discussion id' });
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: { answers: { orderBy: { upvotes: 'desc' } } },
    });
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    return res.json(discussion);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch discussion' });
  }
};

export const addAnswer = async (req: Request, res: Response) => {
  try {
    const id = toId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid discussion id' });
    const content = String(req.body?.content ?? '').trim();
    if (!content) return res.status(400).json({ error: 'Answer content is required' });

    const discussion = await prisma.discussion.findUnique({ where: { id }, select: { id: true } });
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const answer = await prisma.answer.create({ data: { discussionId: id, userId: req.user.id, content } });
    return res.status(201).json(answer);
  } catch {
    return res.status(500).json({ error: 'Failed to add answer' });
  }
};

export const upvoteAnswer = async (req: Request, res: Response) => {
  try {
    const discussionId = toId(req.params.discussionId);
    const answerId = toId(req.params.answerId);
    if (discussionId === null || answerId === null) return res.status(400).json({ error: 'Invalid id' });

    const result = await prisma.answer.updateMany({
      where: { id: answerId, discussionId },
      data: { upvotes: { increment: 1 } },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Answer not found' });

    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    return res.json({ message: 'Upvoted successfully', answer });
  } catch {
    return res.status(500).json({ error: 'Failed to upvote answer' });
  }
};
