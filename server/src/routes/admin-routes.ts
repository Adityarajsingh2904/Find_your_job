import { Hono } from 'hono'
import {adminMiddleware} from '../middlewares/authMiddleware.js'
const adminRoutes = new Hono()

adminRoutes.use('*', adminMiddleware);


export default adminRoutes
