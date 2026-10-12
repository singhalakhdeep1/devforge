import type { Document, DocumentMember } from './generated/client'
import { prisma } from './db'
import type { Access } from './rooms'

type DocWithMembers = Pick<Document, 'ownerId' | 'visibility'> & { members: Pick<DocumentMember, 'userId' | 'role'>[] }

/** What a user may do with a document: own it, edit it, only read it, or nothing. */
export function accessFor(doc: DocWithMembers, userId: string): Access | null {
  if (doc.ownerId === userId) return 'owner'
  const member = doc.members.find((m) => m.userId === userId)
  if (member) return member.role === 'EDITOR' ? 'edit' : 'view'
  if (doc.visibility === 'LINK_EDIT') return 'edit'
  if (doc.visibility === 'LINK_VIEW') return 'view'
  return null
}

export async function loadWithAccess(id: string, userId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const doc = await prisma.document.findUnique({ where: { id }, include: { members: true } })
  if (!doc) return null
  const access = accessFor(doc, userId)
  return access ? { doc, access } : null
}
