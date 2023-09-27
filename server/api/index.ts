import { Hono } from 'hono'
import { handle } from '@hono/node-server/vercel'
import { cors } from 'hono/cors'
import { configDotenv } from 'dotenv'

import authRoutes from '../src/routes/authentication-routes.js'
import communityRoutes from '../src/routes/community-routes.js'
import jobRoutes from '../src/routes/job-routes.js'
import adminRoutes from '../src/routes/admin-routes.js'
import userRoutes from '../src/routes/user-routes.js'

configDotenv()

const app = new Hono().basePath('/api')

// Enable CORS
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://3000-idx-blue-collar-connect-1741848905747.cluster-mwrgkbggpvbq6tvtviraw2knqg.cloudworkstations.dev',
    'http://localhost:3001',
    'https://blue-collar-connect-frontend.vercel.app'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Register Routes
app.route('/auth', authRoutes)
app.route('/community', communityRoutes)
app.route('/job', jobRoutes)
app.route('/user', userRoutes)
app.route('/admin', adminRoutes)

// Default Route
app.get('/', (c) => {
  return c.json({ message: 'Welcome to the API!' })
})

// Vercel-specific config
export default handle(app);
