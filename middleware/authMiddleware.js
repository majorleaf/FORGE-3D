import supabase from '../config/supabaseClient.js';

export const protectRoute = async (req, res, next) => {
  // 1. Grab the Authorization header sent by the client frontend
  const authHeader = req.headers.authorization;

  // 2. Bounce them out if the header is completely empty or improperly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access Denied: You must be signed up or logged in to generate 3D assets.' 
    });
  }

  // 3. Extract the clean token string (removing the "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // 4. Ask Supabase Auth to decode and validate the active token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // 5. If Supabase rejects the token or the session expired, deny entry
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Authentication failed: Your session has expired. Please log in again.' 
      });
    }

    // 6. Security check passed! 
    // Attach the user's secure account metadata object directly to the request container 
    req.user = user;
    
    next(); // Tell Express to move out of the way and continue down into your 3D route logic
  } catch (error) {
    console.error('Middleware Security Error:', error.message);
    return res.status(500).json({ error: 'Internal security authentication check failed.' });
  }
};