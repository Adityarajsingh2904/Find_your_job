import { Hono } from 'hono'
import { authMiddleware, employerMiddleware, workerMiddleware } from '../middlewares/authMiddleware.js'
import { createJobPost, fetchJobPostById, fetchJobPosts } from '../controllers/jobController.js'

const jobRoutes = new Hono()

jobRoutes.use('*', authMiddleware)
jobRoutes.post('/create', employerMiddleware, createJobPost)
jobRoutes.get('/all',workerMiddleware,fetchJobPosts)
jobRoutes.get('/job-post/:jobId',fetchJobPostById);

export default jobRoutes
