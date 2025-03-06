import jwt from 'jsonwebtoken';
// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(403).json({ error: 'No token provided' });
    }
  
    // Remove 'Bearer ' from the token (because it's usually in the format 'Bearer <token>')
    const tokenWithoutBearer = token.split(' ')[1];
    console.log("verifying jwt token");
    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      console.log("jwt Token verified");
      next();  // Proceed to the next middleware or route handler
    });
  };