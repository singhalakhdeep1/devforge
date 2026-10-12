'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Loader2, Play, Save, Trash2, Users } from 'lucide-react'
import { apiErrorMessage, editorApi, type Snippet } from '../../lib/api'
import { runJavaScript } from '../../lib/run-js'
import { getSocket } from '../../lib/socket'
import { useAuthStore } from '../../lib/store/authStore'
import { cn } from '../../lib/utils'
import { RequireAuth } from '../../components/require-auth'
import { Loading } from '../../components/state'
import { useToast } from '../../components/toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <Loading label="Loading editor…" /> })

const STARTERS: Record<string, string> = {
  javascript: `// JavaScript runs safely in your browser\nconst greet = (name) => \`Hello, \${name}!\`\nconsole.log(greet('DevForge'))\n`,
  typescript: `const greet = (name: string): string => \`Hello, \${name}!\`\nconsole.log(greet('DevForge'))\n`,
  python: `def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("DevForge"))\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, DevForge!");\n    }\n}\n`,
  c: `#include <stdio.h>\n\nint main(void) {\n    printf("Hello, DevForge!\\n");\n    return 0;\n}\n`,
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, DevForge!" << std::endl;\n    return 0;\n}\n`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, DevForge!")\n}\n`,
  rust: `fn main() {\n    println!("Hello, DevForge!");\n}\n`,
  ruby: `puts "Hello, DevForge!"\n`,
  php: `<?php\necho "Hello, DevForge!\\n";\n`,
}
const LANGUAGES = Object.keys(STARTERS)
const MONACO_LANG: Record<string, string> = { cpp: 'cpp' }

interface Participant {
  userId: string
  name: string
  color: string
}

function Workspace() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const toast = useToast()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)!
  const accessToken = useAuthStore((s) => s.accessToken)

  const room = search.get('room')
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(STARTERS.javascript)
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState('')
  const [isError, setIsError] = useState(false)
  const [meta, setMeta] = useState('')
  const [running, setRunning] = useState(false)
  const [snippetTitle, setSnippetTitle] = useState('')
  const [activeSnippet, setActiveSnippet] = useState<Snippet | null>(null)
  const [dark, setDark] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [copied, setCopied] = useState(false)
  // Last text known to be in sync with the room. Comparing against it (instead of a flag)
  // means an echoed remote update can never swallow the user's next real edit.
  const syncedRef = useRef('')
  const codeRef = useRef(code)
  const languageRef = useRef(language)
  codeRef.current = code
  languageRef.current = language

  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])

  const runtimes = useQuery({ queryKey: ['runtimes'], queryFn: editorApi.runtimes })
  const snippets = useQuery({ queryKey: ['snippets'], queryFn: editorApi.snippets })

  const canRunOnServer = (lang: string) => Boolean(runtimes.data?.serverExecution && (runtimes.data.languages.includes(lang) || (lang === 'cpp' && runtimes.data.languages.includes('c++'))))
  const runnable = (lang: string) => lang === 'javascript' || canRunOnServer(lang)

  // ----- Live collaboration -----
  useEffect(() => {
    if (!room || !accessToken) return
    const socket = getSocket()
    if (!socket) return

    const onState = (s: { code: string; language: string }) => {
      if (!s.code) {
        // Empty room: the first person in seeds it with what is already in their editor
        syncedRef.current = codeRef.current
        socket.emit('code:change', { roomId: room, code: codeRef.current, language: languageRef.current })
        return
      }
      syncedRef.current = s.code
      setCode(s.code)
      setLanguage(s.language)
    }
    const onUpdate = (u: { code: string; language: string }) => {
      syncedRef.current = u.code
      setCode(u.code)
      setLanguage(u.language)
    }
    const onPresence = (p: Participant[]) => setParticipants(p)
    const onOutput = (o: { output: string; from: string }) => {
      setIsError(false)
      setOutput(o.output)
      setMeta(`Output shared by ${o.from}`)
    }

    socket.on('room:state', onState)
    socket.on('code:update', onUpdate)
    socket.on('room:presence', onPresence)
    socket.on('room:output', onOutput)
    socket.emit('room:join', room)

    return () => {
      socket.emit('room:leave', room)
      socket.off('room:state', onState)
      socket.off('code:update', onUpdate)
      socket.off('room:presence', onPresence)
      socket.off('room:output', onOutput)
      setParticipants([])
    }
  }, [room, accessToken])

  const broadcast = useCallback(
    (nextCode: string, nextLanguage: string) => {
      if (!room) return
      getSocket()?.emit('code:change', { roomId: room, code: nextCode, language: nextLanguage })
    },
    [room]
  )

  // Debounce outgoing edits so typing does not flood the socket
  const sendTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onEdit = (value: string | undefined) => {
    const next = value ?? ''
    setCode(next)
    if (next === syncedRef.current) return // echo of what the room already has
    clearTimeout(sendTimer.current)
    sendTimer.current = setTimeout(() => {
      syncedRef.current = next
      broadcast(next, language)
    }, 150)
  }

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    const untouched = Object.values(STARTERS).includes(code) || !code.trim()
    const nextCode = untouched ? STARTERS[lang] : code
    setCode(nextCode)
    syncedRef.current = nextCode
    broadcast(nextCode, lang)
  }

  const startSession = () => {
    const id = Math.random().toString(36).slice(2, 10)
    router.replace(`${pathname}?room=${id}`)
  }
  const leaveSession = () => router.replace(pathname)
  const copyInvite = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${pathname}?room=${room}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ----- Running code -----
  const run = async () => {
    setRunning(true)
    setIsError(false)
    setOutput('')
    setMeta('')
    try {
      let text: string
      if (language === 'javascript') {
        const r = await runJavaScript(code)
        text = [r.output, r.error].filter(Boolean).join('\n') || '(no output)'
        setIsError(Boolean(r.error))
        setMeta(`Ran in your browser · ${r.durationMs} ms`)
      } else {
        const r = await editorApi.execute(language, code, stdin)
        text = r.output || r.stderr || '(no output)'
        setIsError(!r.success)
        setMeta(`${r.runtime} · ${r.executionTimeMs} ms${r.timedOut ? ' · timed out' : ''}`)
      }
      setOutput(text)
      if (room) getSocket()?.emit('room:output', { roomId: room, output: text })
    } catch (e) {
      setIsError(true)
      setOutput(apiErrorMessage(e, 'Run failed'))
    } finally {
      setRunning(false)
    }
  }

  // ----- Snippets -----
  const refreshSnippets = () => qc.invalidateQueries({ queryKey: ['snippets'] })
  const save = useMutation({
    mutationFn: () => {
      const title = snippetTitle.trim()
      if (!title) throw new Error('Give the snippet a title')
      return activeSnippet
        ? editorApi.updateSnippet(activeSnippet.id, { title, code, language })
        : editorApi.saveSnippet({ title, code, language })
    },
    onSuccess: (s) => {
      setActiveSnippet(s)
      toast.success('Snippet saved')
      refreshSnippets()
    },
    onError: (e) => toast.error(e instanceof Error && !('response' in e) ? e.message : apiErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id: number) => editorApi.deleteSnippet(id),
    onSuccess: (_d, id) => {
      if (activeSnippet?.id === id) {
        setActiveSnippet(null)
        setSnippetTitle('')
      }
      refreshSnippets()
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })

  const load = (s: Snippet) => {
    setActiveSnippet(s)
    setSnippetTitle(s.title)
    setLanguage(s.language)
    setCode(s.code)
    syncedRef.current = s.code
    broadcast(s.code, s.language)
  }

  const languageOptions = useMemo(() => LANGUAGES.map((l) => ({ id: l, label: l === 'cpp' ? 'C++' : l[0].toUpperCase() + l.slice(1), ok: runnable(l) })), [runtimes.data]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={language} onChange={(e) => changeLanguage(e.target.value)} className="w-44" aria-label="Language">
            {languageOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}{l.ok ? '' : ' (edit only)'}
              </option>
            ))}
          </Select>
          <Button onClick={run} disabled={running || !runnable(language)}>
            {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}Run
          </Button>

          <div className="ml-auto flex items-center gap-2">
            {room ? (
              <>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-4 w-4" />{participants.length}</span>
                <div className="flex -space-x-2">
                  {participants.map((p) => (
                    <span key={p.userId + p.name} title={p.name} style={{ backgroundColor: p.color }} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white">
                      {p.name[0]?.toUpperCase()}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={copyInvite}>
                  {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}Copy invite
                </Button>
                <Button variant="ghost" size="sm" onClick={leaveSession}>Leave</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={startSession}><Users className="mr-1 h-4 w-4" />Start live session</Button>
            )}
          </div>
        </div>

        {!runnable(language) && !runtimes.isLoading && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Running {language} needs the server&apos;s code-execution service, which is not configured here. You can still write code and save snippets; JavaScript runs in your browser.
          </p>
        )}

        <div className="overflow-hidden rounded-lg border">
          <MonacoEditor
            height="46vh"
            language={MONACO_LANG[language] ?? language}
            value={code}
            theme={dark ? 'vs-dark' : 'light'}
            onChange={onEdit}
            options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2 }}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_16rem]">
          <div className="min-h-32 rounded-lg border bg-slate-950 p-3 font-mono text-sm text-slate-100">
            <p className="mb-1 text-xs text-slate-400">Output{meta && ` · ${meta}`}</p>
            <pre className={cn('whitespace-pre-wrap break-words', isError && 'text-red-400')}>{output || 'Press Run to see the output.'}</pre>
          </div>
          {language !== 'javascript' && (
            <div>
              <label htmlFor="stdin" className="mb-1 block text-xs text-muted-foreground">Standard input</label>
              <Textarea id="stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} className="h-32 font-mono text-xs" />
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-3">
        <div className="space-y-2 rounded-lg border p-3">
          <p className="text-sm font-semibold">{activeSnippet ? 'Editing snippet' : 'Save as snippet'}</p>
          <Input value={snippetTitle} onChange={(e) => setSnippetTitle(e.target.value)} placeholder="Snippet title" maxLength={120} aria-label="Snippet title" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}><Save className="mr-1 h-4 w-4" />{activeSnippet ? 'Update' : 'Save'}</Button>
            {activeSnippet && (
              <Button size="sm" variant="ghost" onClick={() => { setActiveSnippet(null); setSnippetTitle('') }}>New</Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border">
          <p className="border-b px-3 py-2 text-sm font-semibold">Your snippets</p>
          {snippets.isLoading ? (
            <p className="p-3 text-sm text-muted-foreground">Loading…</p>
          ) : !snippets.data?.length ? (
            <p className="p-3 text-sm text-muted-foreground">Nothing saved yet.</p>
          ) : (
            <ul className="max-h-96 divide-y overflow-y-auto">
              {snippets.data.map((s) => (
                <li key={s.id} className={cn('flex items-center gap-2 px-3 py-2', activeSnippet?.id === s.id && 'bg-accent')}>
                  <button className="flex-1 truncate text-left text-sm hover:underline" onClick={() => load(s)}>
                    {s.title}
                    <span className="ml-2 text-xs text-muted-foreground">{s.language}</span>
                  </button>
                  <button onClick={() => confirm(`Delete "${s.title}"?`) && remove.mutate(s.id)} aria-label={`Delete ${s.title}`} className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="px-1 text-xs text-muted-foreground">
          Signed in as {user.name}. In a live session everyone edits the same file; the last change wins.
        </p>
      </aside>
    </div>
  )
}

export default function EditorPage() {
  return (
    <RequireAuth>
      <Workspace />
    </RequireAuth>
  )
}
