import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/db.js';
import authRoutes from './src/routes/authRoutes.js';
import noteRoutes from './src/routes/noteRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

// Enable CORS for Next.js frontend (Local & Vercel live domain)
const allowedOrigins = [
  'http://localhost:3000',
  'https://buitems-ai-tc5c.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Disable caching for auth responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// View engine setup (optional)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));










// import express from 'express';
// import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './src/db.js';
// import authRoutes from './src/routes/authRoutes.js';
// import noteRoutes from './src/routes/noteRoutes.js';
// import aiRoutes from './src/routes/aiRoutes.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// // Enable CORS for Next.js frontend (Local & Vercel live domain)
// const allowedOrigins = [
//   'http://localhost:3000',
// // Agar aapka koi aur Vercel URL ho toh woh bhi yahan add kar sakte hain
// 'https://buitems-ai-tc5c.vercel.app/signup'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps, Postman, or curl requests)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
// }));

// // Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Disable caching for auth responses
// app.use((req, res, next) => {
//   res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
//   res.set('Pragma', 'no-cache');
//   res.set('Expires', '0');
//   next();
// });

// // View engine setup (optional)
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'src', 'views'));

// // REST API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/notes', noteRoutes);
// app.use('/api/ai', aiRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));







// import express from 'express';
// import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import connectDB from './src/db.js';
// import authRoutes from './src/routes/authRoutes.js';
// import noteRoutes from './src/routes/noteRoutes.js';
// import aiRoutes from './src/routes/aiRoutes.js';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// connectDB();

// const app = express();

// // Enable CORS for Next.js frontend
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
// }));

// // Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Disable caching for auth responses
// app.use((req, res, next) => {
//   res.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
//   res.set('Pragma', 'no-cache');
//   res.set('Expires', '0');
//   next();
// });

// // View engine setup (optional)
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'src', 'views'));

// // REST API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/notes', noteRoutes);
// app.use('/api/ai', aiRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));