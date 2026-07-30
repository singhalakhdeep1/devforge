import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  executeCode,
  saveSnippet,
  getSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet
} from '../controllers/editor.controller'

const router = Router()

// Protected routes
router.post('/execute', protect, executeCode)
router.post('/snippets', protect, saveSnippet)
router.get('/snippets', protect, getSnippets)
router.get('/snippets/:id', protect, getSnippetById)
router.put('/snippets/:id', protect, updateSnippet)
router.delete('/snippets/:id', protect, deleteSnippet)

export default router
