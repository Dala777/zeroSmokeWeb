// src/index.ts
import app from './app';
// Comentamos la importación de la base de datos para evitar errores
// import { connect } from './config/database';

// Puerto
const PORT = process.env.PORT || 8000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  
  // Conectar a la base de datos
  // connect();
  
  // Para la presentación, podemos omitir la conexión a la base de datos
  // y usar datos en memoria
});