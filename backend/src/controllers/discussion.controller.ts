import { Request, Response } from 'express';

type Answer = {
  id: number;
  userId: string;
  content: string;
  createdAt: Date;
  upvotes: number;
};

type Discussion = {
  id: number;
  courseId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  answers: Answer[];
};

const discussionStore: Discussion[] = [
  {
    id: 1,
    courseId: '1',
    userId: 'system-user',
    title: 'How should I structure a React project?',
    content: 'Looking for a clean structure for a growing front-end app.',
    createdAt: new Date(),
    answers: [
      { id: 101, userId: 'user-2', content: 'Keep feature folders and shared UI separate.', upvotes: 7, createdAt: new Date() },
    ],
  },
];

export const createDiscussion = async (req: Request, res: Response) => {
  try {
    const { courseId, title, content } = req.body ?? {};
    const userId = req.user?.id ?? 'anonymous-user';

    if (!title || !content || !courseId) {
      return res.status(400).json({ error: 'courseId, title, and content are required' });
    }

    const discussion = {
      id: Date.now(),
      courseId: String(courseId),
      userId,
      title: String(title),
      content: String(content),
      createdAt: new Date(),
      answers: [],
    } satisfies Discussion;

    discussionStore.unshift(discussion);
    return res.status(201).json(discussion);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create discussion' });
  }
};

export const getDiscussionsByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const items = discussionStore.filter((discussion) => discussion.courseId === courseId);
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch discussions' });
  }
};

export const getDiscussionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const discussion = discussionStore.find((item) => item.id === Number(id));

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    return res.json(discussion);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch discussion' });
  }
};

export const addAnswer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body ?? {};
    const userId = req.user?.id ?? 'anonymous-user';

    const discussion = discussionStore.find((item) => item.id === Number(id));
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Answer content is required' });
    }

    const answer: Answer = {
      id: Date.now(),
      userId,
      content: String(content),
      createdAt: new Date(),
      upvotes: 0,
    };

    discussion.answers.push(answer);
    return res.status(201).json(answer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add answer' });
  }
};

export const upvoteAnswer = async (req: Request, res: Response) => {
  try {
    const { discussionId, answerId } = req.params;
    const discussion = discussionStore.find((item) => item.id === Number(discussionId));

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const answer = discussion.answers.find((item) => item.id === Number(answerId));
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    answer.upvotes += 1;
    return res.json({ message: 'Upvoted successfully', answer });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to upvote answer' });
  }
};