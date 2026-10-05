import { Request, Response } from 'express';

type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  skills: string[];
  avatar: string | null;
  createdAt: string;
};

const profileStore: Record<string, Profile> = {
  'demo-user': {
    id: 'demo-user',
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Full-stack developer passionate about building great products.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    github: 'johndoe',
    linkedin: 'johndoe',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    avatar: null,
    createdAt: new Date().toISOString(),
  },
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'demo-user';
    const profile = profileStore[userId] ?? {
      id: userId,
      name: 'New User',
      email: `${userId}@example.com`,
      bio: '',
      location: '',
      website: '',
      github: '',
      linkedin: '',
      skills: [],
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'demo-user';
    const updates = req.body ?? {};
    const current = profileStore[userId] ?? {
      id: userId,
      name: 'New User',
      email: `${userId}@example.com`,
      bio: '',
      location: '',
      website: '',
      github: '',
      linkedin: '',
      skills: [],
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    const updatedProfile = {
      ...current,
      ...updates,
      id: userId,
    } as Profile;

    profileStore[userId] = updatedProfile;
    return res.json(updatedProfile);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'demo-user';
    const file = (req as Request & { file?: { filename?: string; path?: string; originalname?: string } }).file;

    if (!file) {
      return res.status(400).json({ error: 'An avatar file is required' });
    }

    const avatarUrl = `https://example.com/avatars/${userId}-${file.originalname}`;
    const existing = profileStore[userId];

    if (existing) {
      existing.avatar = avatarUrl;
      profileStore[userId] = existing;
    }

    return res.json({ avatarUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body ?? {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'oldPassword and newPassword are required' });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to change password' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'demo-user';
    delete profileStore[userId];
    return res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete account' });
  }
};


