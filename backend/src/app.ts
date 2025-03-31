import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';

// Rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import articleRoutes from './routes/article.routes';
import messageRoutes from './routes/message.routes';
import faqRoutes from './routes/faq.routes';

// Inicializar configuración
config();

// Crear aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/faqs', faqRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de ZeroSmoke' });
});

export default app;