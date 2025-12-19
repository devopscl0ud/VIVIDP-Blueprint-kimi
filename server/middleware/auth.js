/**
 * Authentication Middleware for VividP Backend
 * Verifies Supabase JWT tokens from Authorization header
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

// Initialize Supabase client for server-side verification
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Middleware to verify JWT token and attach user to request
 * Usage: app.use('/api/protected', authMiddleware, protectedRoutes);
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing or invalid Authorization header'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!supabase) {
            // If Supabase is not configured, allow request but log warning
            console.warn('⚠️ Supabase not configured - auth middleware bypassed');
            req.user = { email: 'dev@vividp.local', id: 'dev-user' };
            return next();
        }

        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication failed'
        });
    }
};

/**
 * Optional auth - attaches user if token present, continues otherwise
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ') && supabase) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (err) {
        // Continue without user on error
        next();
    }
};

module.exports = { authMiddleware, optionalAuth };
