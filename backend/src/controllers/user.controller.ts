import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../config/mockData';

export const getAllUsers = (req: Request, res: Response) => {
  // Filtrar datos sensibles como contraseñas
  const safeUsers = users.map(user => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  }));

  res.status(200).json(safeUsers);
};

export const getUserById = (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Filtrar datos sensibles
  const safeUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };

  res.status(200).json(safeUser);
};

export const createUser = (req: Request, res: Response) => {
  const { email, password, fullName, isAdmin = false } = req.body;

  // Verificar si el email ya existe
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'El email ya está en uso' });
  }

  // Generar ID (en una base de datos real, esto sería automático)
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  // Crear nuevo usuario
  const newUser = {
    id: newId,
    email,
    password: bcrypt.hashSync(password, 10),
    fullName,
    isActive: true,
    isAdmin,
    createdAt: new Date()
  };

  users.push(newUser);

  // Filtrar datos sensibles para la respuesta
  const safeUser = {
    id: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    isActive: newUser.isActive,
    isAdmin: newUser.isAdmin,
    createdAt: newUser.createdAt
  };

  res.status(201).json(safeUser);
};

export const updateUser = (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { email, password, fullName, isActive, isAdmin } = req.body;

  // Buscar usuario
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Actualizar usuario
  const user = users[userIndex];
  
  if (email) user.email = email;
  if (password) user.password = bcrypt.hashSync(password, 10);
  if (fullName) user.fullName = fullName;
  if (isActive !== undefined) user.isActive = isActive;
  if (isAdmin !== undefined) user.isAdmin = isAdmin;
  
  user.updatedAt = new Date();

  // Filtrar datos sensibles para la respuesta
  const safeUser = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };

  res.status(200).json(safeUser);
};

export const deleteUser = (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  
  // Buscar usuario
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Eliminar usuario
  const deletedUser = users.splice(userIndex, 1)[0];

  // Filtrar datos sensibles para la respuesta
  const safeUser = {
    id: deletedUser.id,
    email: deletedUser.email,
    fullName: deletedUser.fullName,
    isActive: deletedUser.isActive,
    isAdmin: deletedUser.isAdmin,
    createdAt: deletedUser.createdAt,
    lastLogin: deletedUser.lastLogin
  };

  res.status(200).json(safeUser);
};