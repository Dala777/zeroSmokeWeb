#!/bin/bash
TARGET_URL="http://localhost:3000"
REPORT_DIR="../reports"

echo "=== Reconocimiento de $TARGET_URL ==="
echo "Fecha: $(date)" > $REPORT_DIR/reconnaissance.txt

# Verificar si la aplicación está corriendo
echo "Verificando disponibilidad..." | tee -a $REPORT_DIR/reconnaissance.txt

# Usar curl apropiado para el sistema
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

$CURL_CMD -s -o /dev/null -w "HTTP Status: %{http_code}\n" $TARGET_URL | tee -a $REPORT_DIR/reconnaissance.txt

# Obtener headers
echo -e "\n=== Headers del servidor ===" | tee -a $REPORT_DIR/reconnaissance.txt
$CURL_CMD -I $TARGET_URL 2>/dev/null | tee -a $REPORT_DIR/reconnaissance.txt

# Verificar robots.txt
echo -e "\n=== Verificando robots.txt ===" | tee -a $REPORT_DIR/reconnaissance.txt
$CURL_CMD -s $TARGET_URL/robots.txt | tee -a $REPORT_DIR/reconnaissance.txt

# Verificar sitemap.xml
echo -e "\n=== Verificando sitemap.xml ===" | tee -a $REPORT_DIR/reconnaissance.txt
$CURL_CMD -s $TARGET_URL/sitemap.xml | tee -a $REPORT_DIR/reconnaissance.txt

echo "Reconocimiento completado. Ver: $REPORT_DIR/reconnaissance.txt"
