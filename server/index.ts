import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error';
import { authRouter } from './routes/auth';
import { catchesRouter } from './routes/catches';
import { groupsRouter } from './routes/groups';
import { eventsRouter } from './routes/events';
import { adminRouter } from './routes/admin';  // Add this line
import { authenticateToken } from './middleware/auth';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/catches', authenticateToken, catchesRouter);
app.use('/api/groups', authenticateToken, groupsRouter);
app.use('/api/events', authenticateToken, eventsRouter);
app.use('/api/admin', adminRouter);  // Add this line

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});