import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { configDotenv } from 'dotenv';
import authRoutes from './routes/authentication-routes.js';
import communityRoutes from './routes/community-routes.js';
import jobRoutes from './routes/job-routes.js';
import adminRoutes from './routes/admin-routes.js';
import userRoutes from './routes/user-routes.js';
const app = new Hono();
configDotenv();
app.use('/api/*', cors({
    origin: ['http://localhost:3000',
        'https://3000-idx-blue-collar-connect-1741848905747.cluster-mwrgkbggpvbq6tvtviraw2knqg.cloudworkstations.dev',
        'http://localhost:3001',
    ],
    credentials: true,
}));
app.route('/api/auth', authRoutes);
app.route('/api/community', communityRoutes);
app.route('/api/job', jobRoutes);
app.route('/api/user', userRoutes);
app.route('/api/admin', adminRoutes);
app.get('/', async (c) => {
    return c.json({ message: 'Welcome to the API!' });
});
const port = process.env.PORT;
console.log(`Server is running on http://localhost:${port}`);
serve({
    fetch: app.fetch,
    port: Number(port),
});
