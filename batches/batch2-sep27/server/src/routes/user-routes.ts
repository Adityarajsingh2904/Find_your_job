import { Hono } from 'hono'
import { getUserProfileById,updateUserProfileById,createUserProfileById, getUserRole} from '../controllers/userController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
const userRoutes = new Hono()
userRoutes.use('*', authMiddleware)
userRoutes.get('/profile/:id', getUserProfileById)
userRoutes.put('/profile/:id', updateUserProfileById)
userRoutes.post('/profile/:id', createUserProfileById)
userRoutes.post('/get-role',getUserRole)

export default userRoutes
