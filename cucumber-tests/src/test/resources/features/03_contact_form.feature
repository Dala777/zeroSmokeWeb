@funcionalidades_principales
Feature: Formulario de Contacto
  Como un visitante de la página ZeroSmoke
  Quiero poder enviar un mensaje de contacto
  Para obtener información o soporte

  Background:
    Given que la aplicación ZeroSmoke está funcionando
    And estoy en la página principal

  @smoke @contacto
  Scenario: Envío exitoso de mensaje de contacto
    Given navego a la página de contacto
    When completo el formulario de contacto con:
      | nombre  | María García                    |
      | email   | maria.garcia@test.com           |
      | asunto  | Consulta sobre el programa      |
      | mensaje | Me interesa saber más detalles  |
    And hago clic en enviar mensaje
    Then debería ver un mensaje de confirmación "Mensaje enviado correctamente"
    And el formulario debería limpiarse

  @contacto @validacion
  Scenario: Envío de formulario incompleto
    Given navego a la página de contacto
    When intento enviar el formulario sin completar los campos requeridos
    Then en el contacto debería ver un mensaje de error "Por favor complete todos los campos requeridos"
    And debería permanecer en la página de contacto

  @contacto @validacion
  Scenario: Envío con email inválido
    Given navego a la página de contacto
    When completo el formulario con un email inválido:
      | nombre  | María García           |
      | email   | email-invalido         |
      | asunto  | Consulta               |
      | mensaje | Mensaje de prueba      |
    And hago clic en enviar mensaje
    Then en el contacto debería ver un mensaje de error "Por favor ingrese un email válido"
    And debería permanecer en la página de contacto
