import admin from '../firebaseAdmin.js';
// Helper: Extracts the ID token from the Authorization header.
const getTokenFromHeader = (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader)
        return null;
    const parts = authHeader.split(' ');
    return parts.length === 2 ? parts[1] : null;
};
// Admin middleware
export const adminMiddleware = async (c, next) => {
    try {
        const idToken = getTokenFromHeader(c);
        if (!idToken) {
            return c.json({ error: 'Authorization token missing' }, 401);
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (!decodedToken.role || decodedToken.role.toLowerCase() !== 'admin') {
            return c.json({ error: 'Access denied: Admins only' }, 403);
        }
        c.set('user', decodedToken);
        await next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        return c.json({ error: 'Unauthorized' }, 401);
    }
};
// Employer middleware
export const employerMiddleware = async (c, next) => {
    try {
        const idToken = getTokenFromHeader(c);
        if (!idToken) {
            return c.json({ error: 'Authorization token missing' }, 401);
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (!decodedToken.role || decodedToken.role.toLowerCase() !== 'employer') {
            return c.json({ error: 'Access denied: Employers only' }, 403);
        }
        c.set('user', decodedToken);
        await next();
    }
    catch (error) {
        console.error('Employer middleware error:', error);
        return c.json({ error: 'Unauthorized' }, 401);
    }
};
// Worker middleware
export const workerMiddleware = async (c, next) => {
    try {
        const idToken = getTokenFromHeader(c);
        if (!idToken) {
            return c.json({ error: 'Authorization token missing' }, 401);
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (!decodedToken.role || decodedToken.role.toLowerCase() !== 'worker') {
            return c.json({ error: 'Access denied: Workers only' }, 403);
        }
        c.set('user', decodedToken);
        await next();
    }
    catch (error) {
        console.error('Worker middleware error:', error);
        return c.json({ error: 'Unauthorized' }, 401);
    }
};
// Authentication middleware: Checks if the user is logged in (valid token) regardless of role.
export const authMiddleware = async (c, next) => {
    try {
        const idToken = getTokenFromHeader(c);
        if (!idToken) {
            return c.json({ error: 'Authorization token missing' }, 401);
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        c.set('user', decodedToken);
        await next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return c.json({ error: 'Unauthorized' }, 401);
    }
};
