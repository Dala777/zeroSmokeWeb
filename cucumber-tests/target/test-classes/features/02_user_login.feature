@funcionalidades_principales
Feature: Inicio de Sesión de Usuario
  Como un usuario registrado en ZeroSmoke
  Quiero poder iniciar sesión en la plataforma
  Para acceder a mi cuenta personalizada

  Background:
    Given que la aplicación ZeroSmoke está funcionando
    And estoy en la página principal

  @smoke @login
  Scenario: Login exitoso con credenciales válidas
    Given navego a la página de login
    When ingreso las credenciales:
      | email      | usuario@test.com |
      | contraseña | password123      |
    And hago clic en iniciar sesión
    Then debería ser redirigido al dashboard
    And debería ver el menú de usuario

  @login @validacion
  Scenario: Login con credenciales inválidas
    Given navego a la página de login
    When ingreso credenciales inválidas:
      | email      | usuario@inexistente.com |
      | contraseña | passwordIncorrecto      |
    And hago clic en iniciar sesión
    Then en el login debería ver un mensaje de error "Credenciales inválidas"
    And debería permanecer en la página de login

  @login @validacion
  Scenario: Login sin completar campos
    Given navego a la página de login
    When intento hacer login sin credenciales
    Then en el login debería ver un mensaje de error "Por favor complete todos los campos"
    And debería permanecer en la página de login

  @smoke @logout
  Scenario: Cerrar sesión correctamente
    Given estoy autenticado como usuario
    When hago clic en cerrar sesión
    Then debería ser redirigido a la página principal
    And no debería ver el menú de usuario
