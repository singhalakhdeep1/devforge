import { Request, Response } from 'express';

type Snippet = {
  id: number;
  userId: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  createdAt: Date;
};

const snippetStore: Snippet[] = [
  {
    id: 1,
    userId: 'demo-user',
    title: 'Hello World',
    code: 'console.log("Hello, world!");',
    language: 'javascript',
    description: 'Starter snippet',
    createdAt: new Date(),
  },
];

export const executeCode = async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body ?? {};
    const normalizedCode = String(code ?? '');
    const normalizedLanguage = String(language ?? 'javascript');

    if (!normalizedCode.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const output = normalizedLanguage === 'python'
      ? `print(${JSON.stringify(normalizedCode)})`
      : `Console output from ${normalizedLanguage}:\n${normalizedCode.split('\n').slice(0, 5).join('\n')}`;

    return res.json({
      output,
      executionTime: '0.5s',
      memory: '10MB',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to execute code' });
  }
};

export const saveSnippet = async (req: Request, res: Response) => {
  try {
    const { title, code, language, description } = req.body ?? {};
    const userId = req.user?.id ?? 'anonymous-user';

    if (!title || !code || !language) {
      return res.status(400).json({ error: 'title, code, and language are required' });
    }

    const snippet: Snippet = {
      id: Date.now(),
      userId,
      title: String(title),
      code: String(code),
      language: String(language),
      description: description ? String(description) : '',
      createdAt: new Date(),
    };

    snippetStore.unshift(snippet);
    return res.status(201).json(snippet);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save snippet' });
  }
};

export const getSnippets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'anonymous-user';
    const items = snippetStore.filter((snippet) => snippet.userId === userId);
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch snippets' });
  }
};

export const getSnippetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snippet = snippetStore.find((item) => item.id === Number(id));

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    return res.json(snippet);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch snippet' });
  }
};

export const updateSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snippetIndex = snippetStore.findIndex((item) => item.id === Number(id));

    if (snippetIndex === -1) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const updated = {
      ...snippetStore[snippetIndex],
      ...req.body,
      id: Number(id),
    } as Snippet;

    snippetStore[snippetIndex] = updated;
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update snippet' });
  }
};

export const deleteSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = snippetStore.findIndex((item) => item.id === Number(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    snippetStore.splice(index, 1);
    return res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete snippet' });
  }
};