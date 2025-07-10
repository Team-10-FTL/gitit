const jwt = require('jsonwebtoken');

const requireLocalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('No token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).send('Invalid local token');
  }
};

const clerkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue to local auth
    }
    
    const session = await clerkClient.sessions.verifySession(token);
    req.auth = { userId: session.userId };
    next();
    
  } catch (error) {
    next(); // If Clerk fails, try local auth
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    console.log('Role check failed. Expected: ADMIN, Got:', req.user?.role);
    return res.status(403).json({ error: 'Admin privileges required' });
  }
};
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};


exports.hybridAuth = (req, res, next) =>{
  clerkAuth(req, res, (err) => {
    if (req.auth?.userId) {
      return next();
    }

    requireLocalAuth(req, res, (err) => {
      if (req.user) {
        return next();
      }
      res.status(401).send('Unauthorized');
    });
  });
}



