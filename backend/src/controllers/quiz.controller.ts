import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const toId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

const loadQuestions = (lessonId: string) =>
  prisma.quizQuestion.findMany({ where: { lessonId }, orderBy: [{ position: 'asc' }, { id: 'asc' }] });

export const getQuizByLesson = async (req: Request, res: Response) => {
  try {
    const lessonId = String(req.params.lessonId);
    const questions = await loadQuestions(lessonId);
    if (!questions.length) return res.status(404).json({ error: 'Quiz not found for lesson' });

    // correctAnswer is deliberately not exposed to the client
    return res.json({
      lessonId,
      questions: questions.map(({ id, question, options }) => ({ id, question, options })),
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId, answers } = req.body ?? {};
    if (lessonId === undefined || lessonId === null) return res.status(400).json({ error: 'lessonId is required' });
    const questions = await loadQuestions(String(lessonId));
    if (!questions.length) return res.status(404).json({ error: 'Quiz not found for lesson' });

    const submitted: unknown[] = Array.isArray(answers) ? answers : [];
    const correctAnswers = questions.filter((q, i) => Number(submitted[i] ?? -1) === q.correctAnswer).length;
    const totalQuestions = questions.length;

    const result = await prisma.quizResult.create({
      data: {
        userId: req.user.id,
        lessonId: String(lessonId),
        score: Math.round((correctAnswers / totalQuestions) * 100),
        totalQuestions,
        correctAnswers,
      },
    });
    return res.status(201).json({ quizId: result.id, ...result });
  } catch {
    return res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

export const getQuizResults = async (req: Request, res: Response) => {
  try {
    const id = toId(req.params.quizId);
    if (id === null) return res.status(400).json({ error: 'Invalid quiz id' });
    const result = await prisma.quizResult.findFirst({ where: { id, userId: req.user.id } });
    if (!result) return res.status(404).json({ error: 'Quiz result not found' });
    return res.json({ quizId: result.id, ...result });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
};
