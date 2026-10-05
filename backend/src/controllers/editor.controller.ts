import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const toId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

// NOTE: no real sandbox exists yet; this endpoint only echoes the submitted code.
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
    if (!title || !code || !language) {
      return res.status(400).json({ error: 'title, code, and language are required' });
    }
    const snippet = await prisma.snippet.create({
      data: {
        userId: req.user.id,
        title: String(title),
        code: String(code),
        language: String(language),
        description: description ? String(description) : '',
      },
    });
    return res.status(201).json(snippet);
  } catch {
    return res.status(500).json({ error: 'Failed to save snippet' });
  }
};

export const getSnippets = async (req: Request, res: Response) => {
  try {
    return res.json(await prisma.snippet.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }));
  } catch {
    return res.status(500).json({ error: 'Failed to fetch snippets' });
  }
};

export const getSnippetById = async (req: Request, res: Response) => {
  try {
    const id = toId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid snippet id' });
    const snippet = await prisma.snippet.findFirst({ where: { id, userId: req.user.id } });
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    return res.json(snippet);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch snippet' });
  }
};

export const updateSnippet = async (req: Request, res: Response) => {
  try {
    const id = toId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid snippet id' });
    const body = req.body ?? {};
    const data: Record<string, string> = {};
    for (const key of ['title', 'code', 'language', 'description']) {
      if (typeof body[key] === 'string') data[key] = body[key];
    }
    const result = await prisma.snippet.updateMany({ where: { id, userId: req.user.id }, data });
    if (result.count === 0) return res.status(404).json({ error: 'Snippet not found' });
    return res.json(await prisma.snippet.findUnique({ where: { id } }));
  } catch {
    return res.status(500).json({ error: 'Failed to update snippet' });
  }
};

export const deleteSnippet = async (req: Request, res: Response) => {
  try {
    const id = toId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid snippet id' });
    const result = await prisma.snippet.deleteMany({ where: { id, userId: req.user.id } });
    if (result.count === 0) return res.status(404).json({ error: 'Snippet not found' });
    return res.json({ message: 'Snippet deleted successfully' });
  } catch {
    return res.status(500).json({ error: 'Failed to delete snippet' });
  }
};
