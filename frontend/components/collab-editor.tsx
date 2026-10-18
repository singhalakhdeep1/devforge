'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { OnMount } from '@monaco-editor/react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { API_URL } from '../lib/api/client'
import { useAuthStore } from '../lib/store/authStore'
import { Loading } from './state'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <Loading label="Loading editor…" /> })

type MonacoEditorInstance = Parameters<OnMount>[0]
type Monaco = Parameters<OnMount>[1]

export interface Peer {
  clientId: number
  name: string
  color: string
}


const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
const colorFor = (id: string) => COLORS[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length]

/** ws(s)://<gateway>/ws, derived from the API URL (http://host/api → ws://host/ws). */
const wsBase = () => {
  const u = new URL(API_URL, typeof window !== 'undefined' ? window.location.href : 'http://localhost')
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
  u.pathname = '/ws'
  u.search = ''
  return u.toString().replace(/\/$/, '')
}

/**
 * Binds a Monaco model to the document's shared Y.Text ("content"): local edits become Yjs
 * updates, remote updates are applied to the model, and everyone's cursor travels as awareness.
 */
function bind(editor: MonacoEditorInstance, monaco: Monaco, ytext: Y.Text, provider: WebsocketProvider) {
  const model = editor.getModel()!
  const LOCAL = Symbol('monaco')
  let applyingRemote = false

  if (model.getValue() !== ytext.toString()) model.setValue(ytext.toString())

  const onModel = model.onDidChangeContent((e) => {
    if (applyingRemote) return
    ytext.doc!.transact(() => {
      // later offsets first, so earlier changes don't shift them
      for (const c of [...e.changes].sort((a, b) => b.rangeOffset - a.rangeOffset)) {
        if (c.rangeLength) ytext.delete(c.rangeOffset, c.rangeLength)
        if (c.text) ytext.insert(c.rangeOffset, c.text)
      }
    }, LOCAL)
  })

  const onY = (event: Y.YTextEvent, tr: Y.Transaction) => {
    if (tr.origin === LOCAL) return
    applyingRemote = true
    try {
      // offsets into the text as it was before this update: Monaco applies the batch against that text
      const edits: { range: InstanceType<Monaco['Range']>; text: string }[] = []
      let index = 0
      for (const op of event.delta) {
        if (op.retain) index += op.retain
        else if (op.insert) {
          const pos = model.getPositionAt(index)
          edits.push({ range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column), text: op.insert as string })
        } else if (op.delete) {
          const a = model.getPositionAt(index)
          const b = model.getPositionAt(index + op.delete)
          edits.push({ range: new monaco.Range(a.lineNumber, a.column, b.lineNumber, b.column), text: '' })
          index += op.delete
        }
      }
      model.pushEditOperations([], edits, () => null)
    } finally {
      applyingRemote = false
    }
  }
  ytext.observe(onY)

  // cursors: ours goes out as relative positions, theirs come back as decorations
  const awareness = provider.awareness
  const sendCursor = () => {
    const sel = editor.getSelection()
    if (!sel) return
    const anchor = Y.createRelativePositionFromTypeIndex(ytext, model.getOffsetAt(sel.getStartPosition()))
    const head = Y.createRelativePositionFromTypeIndex(ytext, model.getOffsetAt(sel.getEndPosition()))
    awareness.setLocalStateField('cursor', { anchor: Y.relativePositionToJSON(anchor), head: Y.relativePositionToJSON(head) })
  }
  const onCursor = editor.onDidChangeCursorSelection(sendCursor)

  let decorations: string[] = []
  const styled = new Set<string>()
  const renderCursors = () => {
    const next: Parameters<typeof model.deltaDecorations>[1] = []
    awareness.getStates().forEach((state, clientId) => {
      if (clientId === awareness.clientID || !state.cursor || !state.user) return
      const a = Y.createAbsolutePositionFromRelativePosition(Y.createRelativePositionFromJSON(state.cursor.anchor), ytext.doc!)
      const h = Y.createAbsolutePositionFromRelativePosition(Y.createRelativePositionFromJSON(state.cursor.head), ytext.doc!)
      if (!a || !h) return
      const cls = `yc-${clientId}`
      if (!styled.has(cls)) {
        const style = document.createElement('style')
        style.textContent = `.${cls}-sel{background:${state.user.color}33}.${cls}-caret{border-left:2px solid ${state.user.color}}.${cls}-caret::after{content:"${String(state.user.name).replace(/"/g, '')}";position:absolute;transform:translateY(-100%);background:${state.user.color};color:#fff;font-size:10px;padding:0 3px;border-radius:2px;white-space:nowrap;pointer-events:none}`
        document.head.appendChild(style)
        styled.add(cls)
      }
      const start = model.getPositionAt(Math.min(a.index, h.index))
      const end = model.getPositionAt(Math.max(a.index, h.index))
      const caret = model.getPositionAt(h.index)
      next.push({ range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column), options: { className: `${cls}-sel` } })
      next.push({ range: new monaco.Range(caret.lineNumber, caret.column, caret.lineNumber, caret.column), options: { beforeContentClassName: `${cls}-caret` } })
    })
    decorations = model.deltaDecorations(decorations, next)
  }
  awareness.on('change', renderCursors)
  ytext.observe(renderCursors)

  return () => {
    onModel.dispose()
    onCursor.dispose()
    ytext.unobserve(onY)
    ytext.unobserve(renderCursors)
    awareness.off('change', renderCursors)
    model.deltaDecorations(decorations, [])
  }
}

export function CollabEditor({ documentId, language, readOnly, onPeers, onStatus }: { documentId: string; language: string; readOnly: boolean; onPeers?: (p: Peer[]) => void; onStatus?: (s: 'connecting' | 'connected' | 'disconnected') => void }) {
  const { user, accessToken } = useAuthStore()
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [synced, setSynced] = useState(false)
  const editorRef = useRef<{ editor: MonacoEditorInstance; monaco: Monaco } | null>(null)
  const [mounted, setMounted] = useState(0)

  // one Y.Doc and connection per document
  useEffect(() => {
    const token = useAuthStore.getState().accessToken
    if (!token) return
    const doc = new Y.Doc()
    const p = new WebsocketProvider(wsBase(), 'editor', doc, { params: { documentId, token }, maxBackoffTime: 10_000 })
    p.on('status', ({ status }: { status: 'connecting' | 'connected' | 'disconnected' }) => onStatus?.(status))
    p.on('sync', (s: boolean) => s && setSynced(true))
    setProvider(p)
    return () => {
      p.destroy()
      doc.destroy()
      setProvider(null)
      setSynced(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  // a refreshed access token is used the next time the socket reconnects
  useEffect(() => {
    if (provider && accessToken) provider.params = { ...provider.params, token: accessToken }
  }, [provider, accessToken])

  useEffect(() => {
    if (!provider || !user) return
    provider.awareness.setLocalStateField('user', { id: user.id, name: user.name, color: colorFor(user.id) })
    const report = () => {
      const peers: Peer[] = []
      provider.awareness.getStates().forEach((s, clientId) => s.user && peers.push({ clientId, name: s.user.name, color: s.user.color }))
      onPeers?.(peers)
    }
    report()
    provider.awareness.on('change', report)
    return () => provider.awareness.off('change', report)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, user])

  useEffect(() => {
    if (!provider || !synced || !editorRef.current) return
    const { editor, monaco } = editorRef.current
    return bind(editor, monaco, provider.doc.getText('content'), provider)
  }, [provider, synced, mounted])

  if (!synced) return <Loading label="Connecting to the document…" />
  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme={typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'vs-dark' : 'light'}
      options={{ readOnly, minimap: { enabled: false }, fontSize: 14, automaticLayout: true, wordWrap: 'on' }}
      onMount={(editor, monaco) => {
        editorRef.current = { editor, monaco }
        setMounted((n) => n + 1)
      }}
    />
  )
}
