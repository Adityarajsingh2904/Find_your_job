import { Hono } from 'hono'
import {signin, signup, signout} from '../controllers/authController.js'
const authRoutes = new Hono()

authRoutes.get('/sign-in', signin)
authRoutes.post('/sign-up', signup)
authRoutes.post('/sign-out', signout)

export default authRoutes