'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { GitFork, Lock, MessageSquare, Star, Users } from 'lucide-react'
import { teamApi, rows, type Project, type ProjectInput } from '../lib/api/platform'
import { useAuthStore } from '../lib/store/authStore'
import { timeAgo } from '../lib/utils'
import { Field } from './kit'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'

export function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/projects/${p.slug}`}>
      <Card className="flex h-full flex-col p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{p.name}</h3>
          {p.visibility !== 'PUBLIC' && (
            <Badge variant="outline" className="shrink-0 gap-1">
              {p.visibility === 'TEAM' ? <Users className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {p.visibility.toLowerCase()}
            </Badge>
          )}
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.description || 'No description'}</p>
        {p.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {p.tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className={p.starred ? 'h-3.5 w-3.5 fill-yellow-400 text-yellow-400' : 'h-3.5 w-3.5'} />
            {p.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            {p.forks ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {p.comments ?? 0}
          </span>
          <span className="ml-auto">{p.owner?.name} · {timeAgo(p.updatedAt)}</span>
        </div>
      </Card>
    </Link>
  )
}

export function ProjectForm({ initial, onSubmit, busy, submitLabel }: { initial?: Partial<Project>; onSubmit: (v: ProjectInput) => void; busy?: boolean; submitLabel: string }) {
  const user = useAuthStore((s) => s.user)
  const teams = useQuery({ queryKey: ['teams'], queryFn: teamApi.list, enabled: Boolean(user) })
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [readme, setReadme] = useState(initial?.readme ?? '')
  const [visibility, setVisibility] = useState<ProjectInput['visibility']>(initial?.visibility ?? 'PRIVATE')
  const [teamId, setTeamId] = useState(initial?.team?.id ?? '')
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '))
  const [repoUrl, setRepoUrl] = useState(initial?.repoUrl ?? '')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          name,
          description,
          readme,
          visibility,
          teamId: teamId || null,
          tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
          ...(repoUrl ? { repoUrl } : {}),
        })
      }}
    >
      <Field label="Name" htmlFor="p-name">
        <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={80} required />
      </Field>
      <Field label="Description" htmlFor="p-desc">
        <Input id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Visibility" htmlFor="p-vis">
          <Select id="p-vis" value={visibility} onChange={(e) => setVisibility(e.target.value as ProjectInput['visibility'])}>
            <option value="PRIVATE">Private: members only</option>
            <option value="TEAM">Team: everyone in the team</option>
            <option value="PUBLIC">Public: anyone</option>
          </Select>
        </Field>
        <Field label="Team" htmlFor="p-team">
          <Select id="p-team" value={teamId} onChange={(e) => setTeamId(e.target.value)} required={visibility === 'TEAM'}>
            <option value="">No team</option>
            {rows(teams.data).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Tags" htmlFor="p-tags" hint="Comma separated, e.g. react, api">
        <Input id="p-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
      </Field>
      <Field label="Repository URL" htmlFor="p-repo">
        <Input id="p-repo" type="url" placeholder="https://github.com/…" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
      </Field>
      <Field label="README (Markdown)" htmlFor="p-readme">
        <Textarea id="p-readme" rows={6} value={readme} onChange={(e) => setReadme(e.target.value)} />
      </Field>
      <Button type="submit" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
