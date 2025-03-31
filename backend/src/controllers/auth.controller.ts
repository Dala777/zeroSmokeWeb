import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { users } from '../config/mockData';

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Buscar usuario por email
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Verificar contraseña
  const passwordIsValid = bcrypt.compareSync(password, user.password);

  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Contraseña inválida' });
  }

  // Generar token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secreto', {
    expiresIn: 86400 // 24 horas
  });

  // Actualizar último login
  user.lastLogin = new Date();

  res.status(200).json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isAdmin: user.isAdmin,
    accessToken: token
  });
};

export const getProfile = (req: Request, res: Response) => {
  const userId = req.user.id;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  res.status(200).json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  });
};