@funcionalidades_principales
Feature: Registro de Usuario
  Como una persona que quiere dejar de fumar
  Quiero registrarme en la plataforma ZeroSmoke
  Para poder acceder a los recursos personalizados

  Background:
    Given que la aplicación ZeroSmoke está funcionando
    And estoy en la página principal

  @smoke @registro
  Scenario: Registro exitoso de usuario
    Given navego a la página de registro
    When completo el formulario de registro con datos válidos:
      | campo              | valor                    |
      | nombre             | Juan Pérez               |
      | email              | juan.perez@test.com      |
      | contraseña         | MiPassword123!           |
      | confirmar_password | MiPassword123!           |
    And acepto los términos y condiciones
    And hago clic en el botón registrar
    Then debería ver un mensaje de registro exitoso
    And debería ser redirigido a la página de login

  @registro @validacion
  Scenario: Registro con email inválido
    Given navego a la página de registro
    When completo el formulario de registro con:
      | campo              | valor          |
      | nombre             | Juan Pérez     |
      | email              | email-invalido |
      | contraseña         | MiPassword123! |
      | confirmar_password | MiPassword123! |
    And hago clic en el botón registrar
    Then en el registro debería ver un mensaje de error "Por favor, introduce un email válido"
    And debería permanecer en la página de registro

  @registro @validacion
  Scenario: Registro con contraseñas que no coinciden
    Given navego a la página de registro
    When completo el formulario de registro con:
      | campo              | valor                  |
      | nombre             | Juan Pérez             |
      | email              | juan.perez@test.com    |
      | contraseña         | MiPassword123!         |
      | confirmar_password | OtraPassword456!       |
    And hago clic en el botón registrar
    Then en el registro debería ver un mensaje de error "Las contraseñas no coinciden"
    And debería permanecer en la página de registro
