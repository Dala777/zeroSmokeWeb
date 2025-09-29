#!/bin/bash
PROJECT_DIR="../"  # Directorio raíz del proyecto
REPORT_DIR="../reports"

echo "=== Análisis de Código (Caja Blanca) ==="
echo "Fecha: $(date)" > $REPORT_DIR/code-analysis.txt

# Buscar patrones inseguros en el código
echo "=== Buscando patrones inseguros ===" | tee -a $REPORT_DIR/code-analysis.txt

# Buscar console.log (información sensible en logs)
echo -e "\n--- Console.log encontrados ---" | tee -a $REPORT_DIR/code-analysis.txt
find $PROJECT_DIR -name "*.js" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -n "console.log" 2>/dev/null | tee -a $REPORT_DIR/code-analysis.txt

# Buscar TODO/FIXME (posibles problemas pendientes)
echo -e "\n--- TODOs y FIXMEs ---" | tee -a $REPORT_DIR/code-analysis.txt
find $PROJECT_DIR -name "*.js" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -n -i "todo\|fixme" 2>/dev/null | tee -a $REPORT_DIR/code-analysis.txt

# Buscar hardcoded secrets
echo -e "\n--- Posibles secrets hardcodeados ---" | tee -a $REPORT_DIR/code-analysis.txt
find $PROJECT_DIR -name "*.js" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -n -i "password\|secret\|key\|token" 2>/dev/null | grep -v "process.env" | tee -a $REPORT_DIR/code-analysis.txt

# Analizar dependencias
echo -e "\n--- Análisis de dependencias ---" | tee -a $REPORT_DIR/code-analysis.txt
if [ -f "$PROJECT_DIR/backend/package.json" ]; then
    echo "Ejecutando npm audit en backend..." | tee -a $REPORT_DIR/code-analysis.txt
    cd $PROJECT_DIR/backend && npm audit 2>/dev/null | tee -a ../security-testing/reports/code-analysis.txt
fi

if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
    echo "Ejecutando npm audit en frontend..." | tee -a $REPORT_DIR/code-analysis.txt
    cd $PROJECT_DIR/frontend && npm audit 2>/dev/null | tee -a ../security-testing/reports/code-analysis.txt
fi

echo "Análisis de código completado. Ver: $REPORT_DIR/code-analysis.txt"
