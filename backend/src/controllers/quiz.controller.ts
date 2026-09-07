import { Request, Response } from 'express';

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

const quizBank: Record<string, QuizQuestion[]> = {
  '1': [
    {
      id: 1,
      question: 'What is the main responsibility of React?',
      options: ['Data persistence', 'Rendering UI', 'Database management', 'Packaging code'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Which hook is used for side effects?',
      options: ['useMemo', 'useEffect', 'useCallback', 'useContext'],
      correctAnswer: 1,
    },
  ],
};

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId, answers } = req.body ?? {};
    const userId = req.user?.id ?? 'anonymous-user';
    const questionSet = quizBank[String(lessonId)] ?? [];
    const normalizedAnswers = Array.isArray(answers) ? answers : [];

    if (!questionSet.length) {
      return res.status(404).json({ error: 'Quiz not found for lesson' });
    }

    let correctAnswers = 0;
    questionSet.forEach((question, index) => {
      const userChoice = Number(normalizedAnswers[index] ?? -1);
      if (userChoice === question.correctAnswer) {
        correctAnswers += 1;
      }
    });

    const totalQuestions = questionSet.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const result = {
      quizId: Date.now(),
      lessonId,
      userId,
      score,
      totalQuestions,
      correctAnswers,
      submittedAt: new Date(),
    };

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

export const getQuizResults = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user?.id ?? 'anonymous-user';

    return res.json({
      quizId,
      userId,
      score: 85,
      totalQuestions: 2,
      correctAnswers: 1,
      submittedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
};

export const getQuizByLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const questions = quizBank[String(lessonId)] ?? [
      {
        id: 1,
        question: 'What is React?',
        options: ['A framework', 'A library', 'A language', 'A database'],
        correctAnswer: 1,
      },
    ];

    return res.json({
      id: Date.now(),
      lessonId,
      questions,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};