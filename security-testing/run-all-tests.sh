#!/bin/bash
echo "=== EJECUTANDO TODOS LOS TESTS DE SEGURIDAD ==="
echo "Proyecto: ZeroSmoke"
echo "Fecha: $(date)"
echo ""

# Detectar comando curl apropiado
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

# Verificar que ZeroSmoke esté corriendo
echo "Verificando que ZeroSmoke esté disponible..."
if ! $CURL_CMD -f http://localhost:3000 >/dev/null 2>&1; then
    echo "❌ Frontend no disponible. Asegúrate de que esté corriendo en puerto 3000"
    exit 1
fi

if ! $CURL_CMD -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "❌ Backend no disponible. Asegúrate de que esté corriendo en puerto 5000"
    exit 1
fi

echo "✓ ZeroSmoke está disponible"
echo ""

# Ejecutar tests
echo "1. Ejecutando Testing de Caja Negra..."
./scripts/black-box-testing.sh > reports/black-box-results.txt 2>&1
echo "✓ Resultados guardados en reports/black-box-results.txt"

echo ""
echo "2. Ejecutando Testing de Caja Blanca..."
./scripts/white-box-testing.sh > reports/white-box-results.txt 2>&1
echo "✓ Resultados guardados en reports/white-box-results.txt"

echo ""
echo "3. Ejecutando Testing de Caja Gris..."
./scripts/gray-box-testing.sh > reports/gray-box-results.txt 2>&1
echo "✓ Resultados guardados en reports/gray-box-results.txt"

echo ""
echo "=== TODOS LOS TESTS COMPLETADOS ==="
echo "Revisa los archivos en la carpeta 'reports' para ver los resultados"
echo ""
echo "Próximos pasos:"
echo "1. Revisar los resultados en reports/"
echo "2. Tomar capturas de pantalla según la guía"
echo "3. Documentar vulnerabilidades encontradas"
echo "4. Crear reporte final"
