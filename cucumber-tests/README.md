# ZeroSmoke - Framework de Testing Cucumber

Framework de pruebas end-to-end para las funcionalidades principales de ZeroSmoke usando Cucumber y Serenity BDD.

## 🎯 Funcionalidades Probadas

### ✅ Funcionalidades Implementadas y Probadas
- **Registro de Usuario**: Validaciones y casos exitosos
- **Inicio de Sesión**: Login/logout con validaciones
- **Formulario de Contacto**: Envío de mensajes y validaciones
- **Panel Admin**: Respuesta a mensajes de contacto vía email

## 📁 Estructura del Proyecto

\`\`\`
cucumber-tests/
├── src/test/
│   ├── java/com/zerosmoke/
│   │   ├── runners/TestRunner.java
│   │   ├── pages/                    # Page Object Model
│   │   │   ├── HomePage.java
│   │   │   ├── LoginPage.java
│   │   │   ├── RegistrationPage.java
│   │   │   ├── ContactPage.java
│   │   │   └── AdminPage.java
│   │   └── stepdefinitions/          # Definiciones de pasos
│   │       ├── CommonSteps.java
│   │       ├── LoginSteps.java
│   │       ├── RegistrationSteps.java
│   │       ├── ContactSteps.java
│   │       └── AdminSteps.java
│   └── resources/
│       ├── features/                 # Archivos .feature
│       │   ├── 01_user_registration.feature
│       │   ├── 02_user_login.feature
│       │   ├── 03_contact_form.feature
│       │   └── 04_admin_message_response.feature
│       └── serenity.properties
├── pom.xml
└── README.md
\`\`\`

## 🚀 Instalación y Configuración

### Prerrequisitos
- Java 17 o superior
- Maven 3.9+
- Chrome Browser
- ZeroSmoke aplicación corriendo en localhost:3000

### Pasos de Instalación

1. **Navegar a la carpeta de tests**
   \`\`\`bash
   cd cucumber-tests
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   mvn clean install
   \`\`\`

3. **Verificar que ZeroSmoke esté corriendo**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🧪 Ejecutar Pruebas

### Ejecutar todas las pruebas
\`\`\`bash
mvn clean verify
\`\`\`

### Ejecutar pruebas por tags
\`\`\`bash
# Solo pruebas críticas (smoke)
mvn clean verify -Dcucumber.filter.tags="@smoke"

# Solo registro de usuario
mvn clean verify -Dcucumber.filter.tags="@registro"

# Solo login
mvn clean verify -Dcucumber.filter.tags="@login"

# Solo formulario de contacto
mvn clean verify -Dcucumber.filter.tags="@contacto"

# Solo funcionalidades de admin
mvn clean verify -Dcucumber.filter.tags="@admin"
\`\`\`

### Ejecutar con diferentes navegadores
\`\`\`bash
mvn clean verify -Dwebdriver.driver=firefox
mvn clean verify -Dwebdriver.driver=chrome
\`\`\`

### Ejecutar en modo headless
\`\`\`bash
mvn clean verify -Dheadless.mode=true
\`\`\`

## 📊 Reportes

Los reportes de Serenity se generan automáticamente en:
\`\`\`
target/site/serenity/index.html
\`\`\`

### Contenido de los Reportes
- ✅ Dashboard con métricas de éxito/fallo
- 📸 Screenshots paso a paso
- 📝 Narrativa detallada de cada escenario
- ⏱️ Tiempos de ejecución
- 📋 Cobertura de requerimientos

## 🔧 Configuración

### Modificar URLs
Edita \`src/test/resources/serenity.properties\`:
\`\`\`properties
test.base.url=http://localhost:3000
api.base.url=http://localhost:5000/api
\`\`\`

### Configurar WebDriver
\`\`\`properties
webdriver.driver=chrome
headless.mode=false
chrome.switches=--disable-extensions,--no-sandbox
\`\`\`

## 🐛 Solución de Problemas

### Error: "Application not accessible"
- Verificar que ZeroSmoke esté corriendo en localhost:3000
- Verificar que el backend esté corriendo en localhost:5000

### Error: "WebDriver not found"
- El WebDriverManager descarga automáticamente los drivers
- Verificar conexión a internet

### Error: "Element not found"
- Los selectores CSS están configurados para ser flexibles
- Verificar que los elementos tengan los atributos data-testid

## 📝 Agregar Nuevas Pruebas

### 1. Crear nuevo archivo .feature
\`\`\`gherkin
# src/test/resources/features/nueva_funcionalidad.feature
@nueva_funcionalidad
Feature: Nueva Funcionalidad
  Como usuario
  Quiero hacer algo
  Para obtener un beneficio

  @smoke
  Scenario: Caso exitoso
    Given estoy en la página
    When hago una acción
    Then debería ver el resultado
\`\`\`

### 2. Crear Page Object
\`\`\`java
// src/test/java/com/zerosmoke/pages/NuevaPage.java
public class NuevaPage extends PageObject {
    // Definir elementos y métodos
}
\`\`\`

### 3. Crear Step Definitions
\`\`\`java
// src/test/java/com/zerosmoke/stepdefinitions/NuevaSteps.java
public class NuevaSteps {
    @Given("estoy en la página")
    public void estoyEnLaPagina() {
        // Implementación
    }
}
\`\`\`

## 🏷️ Tags Disponibles

- \`@smoke\`: Pruebas críticas principales
- \`@registro\`: Funcionalidades de registro
- \`@login\`: Funcionalidades de login/logout
- \`@contacto\`: Formulario de contacto
- \`@admin\`: Panel de administración
- \`@validacion\`: Pruebas de validación de campos

## 📞 Soporte

Si encuentras problemas:
1. Verificar que todas las dependencias estén instaladas
2. Revisar los logs en \`target/\`
3. Verificar que la aplicación ZeroSmoke esté funcionando correctamente
\`\`\`
