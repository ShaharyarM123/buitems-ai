import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // 1. Pehle Authorization Header check karein (jo apiHelper.js bhejta hai)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Agar header me na ho, toh Cookie check karein
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Agar token na mile
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded; // req.user = { id: '...', ... }
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token.' 
    });
  }
};

// 💡 Default export bhi add kar diya taake aiRoutes.js me error na aaye
export default protect;







// import jwt from 'jsonwebtoken';

// export const protect = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.redirect('/auth');
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.clearCookie('token');
//     return res.redirect('/auth');
//   }
// };