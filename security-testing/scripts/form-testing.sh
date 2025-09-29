#!/bin/bash
TARGET_URL="http://localhost:3000"
API_URL="http://localhost:5000"
REPORT_DIR="../reports"

echo "=== Testing de Formularios ==="
echo "Fecha: $(date)" > $REPORT_DIR/form-testing.txt

# Detectar comando curl apropiado
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

# Testing básico de login
echo "=== Testing de Login ===" | tee -a $REPORT_DIR/form-testing.txt

# Intento de login con credenciales inválidas
echo "Probando credenciales inválidas..." | tee -a $REPORT_DIR/form-testing.txt
$CURL_CMD -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpassword"}' \
  -s | tee -a $REPORT_DIR/form-testing.txt

# Testing básico de registro
echo -e "\n=== Testing de Registro ===" | tee -a $REPORT_DIR/form-testing.txt

# Intento de registro con datos de prueba
echo "Probando registro con datos de prueba..." | tee -a $REPORT_DIR/form-testing.txt
$CURL_CMD -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"testuser@example.com","password":"testpass123"}' \
  -s | tee -a $REPORT_DIR/form-testing.txt

echo "Testing de formularios completado. Ver: $REPORT_DIR/form-testing.txt"
