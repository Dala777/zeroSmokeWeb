# Checklist de Testing de Seguridad - ZeroSmoke

## Testing de Caja Negra ✓

### Reconocimiento
- [ ] Mapeo de aplicación completado
- [ ] Identificación de tecnologías
- [ ] Análisis de robots.txt/sitemap.xml
- [ ] Enumeración de directorios/archivos

### Autenticación y Sesiones
- [ ] Testing de bypass de autenticación
- [ ] Fuerza bruta en login
- [ ] Análisis de cookies de sesión
- [ ] Testing de logout
- [ ] Verificación de timeout de sesión

### Autorización
- [ ] Testing de escalación de privilegios
- [ ] Acceso directo a URLs protegidas
- [ ] Manipulación de parámetros de usuario
- [ ] Testing de control de acceso horizontal

### Validación de Entrada
- [ ] Inyección SQL en todos los formularios
- [ ] XSS reflejado y almacenado
- [ ] Inyección de comandos
- [ ] Path traversal
- [ ] File upload vulnerabilities

### Lógica de Negocio
- [ ] Bypass de validaciones de negocio
- [ ] Race conditions
- [ ] Manipulación de flujos de trabajo
- [ ] Testing de límites y restricciones

## Testing de Caja Blanca ✓

### Análisis de Código
- [ ] Revisión de controladores
- [ ] Análisis de middleware
- [ ] Revisión de modelos de datos
- [ ] Verificación de validaciones

### Configuración
- [ ] Análisis de variables de entorno
- [ ] Configuración de base de datos
- [ ] Configuración de servidor web
- [ ] Certificados y claves

### Dependencias
- [ ] Análisis de vulnerabilidades en dependencias
- [ ] Verificación de versiones actualizadas
- [ ] Análisis de configuración de frameworks

## Testing de Caja Gris ✓

### Acceso Parcial
- [ ] Testing como usuario autenticado
- [ ] Exploración de APIs con documentación parcial
- [ ] Intentos de escalación con conocimiento limitado
- [ ] Análisis híbrido de funcionalidades

### Documentación
- [ ] Todos los hallazgos documentados
- [ ] Evidencia recopilada
- [ ] Recomendaciones proporcionadas
- [ ] Reporte final consolidado

---
*Checklist para el proyecto ZeroSmoke*
*Actualizar estado conforme se completen las pruebas*
