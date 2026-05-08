@funcionalidades_principales
Feature: Respuesta de Administrador a Mensajes de Contacto
  Como administrador del sistema ZeroSmoke
  Quiero poder responder a los mensajes de contacto
  Para brindar soporte a los usuarios

  Background:
    Given que la aplicación ZeroSmoke está funcionando
    And existe un mensaje de contacto pendiente de respuesta:
      | nombre | email                    | asunto           | mensaje                    |
      | María  | maria.garcia@test.com    | Consulta general | Necesito más información   |

  @smoke @admin
  Scenario: Responder mensaje de contacto exitosamente
    Given estoy en el panel de administración
    When navego a la gestión de mensajes
    And selecciono el mensaje de "María"
    And escribo una respuesta:
      """
      Hola María,
      
      Gracias por tu consulta. Te envío la información solicitada.
      
      Saludos,
      Equipo ZeroSmoke
      """
    And hago clic en enviar respuesta
    Then en el panel de admin debería ver un mensaje de confirmación "Respuesta enviada correctamente"
    And el mensaje debería marcarse como respondido
    And debería enviarse un email a "maria.garcia@test.com"
    And el email debería contener la respuesta del administrador

  @admin @validacion
  Scenario: Intentar enviar respuesta vacía
    Given estoy en el panel de administración
    When navego a la gestión de mensajes
    And selecciono el mensaje de "María"
    And dejo el campo de respuesta vacío
    And hago clic en enviar respuesta
    Then en el admin debería ver un mensaje de error "La respuesta no puede estar vacía"
    And el mensaje no debería marcarse como respondido
    And no debería enviarse ningún email

  @admin
  Scenario: Visualizar lista de mensajes de contacto
    Given estoy en el panel de administración
    When navego a la gestión de mensajes
    Then debería ver una lista de mensajes de contacto
    And cada mensaje debería mostrar nombre, email, fecha y estado
    And debería poder filtrar mensajes por estado (leído/no leído)
    And debería poder buscar mensajes por nombre o email

  @admin
  Scenario: Marcar mensaje como leído sin responder
    Given estoy en el panel de administración
    When navego a la gestión de mensajes
    And selecciono el mensaje de "María"
    And hago clic en "Marcar como leído"
    Then el mensaje debería marcarse como leído
    And debería aparecer en la lista de mensajes leídos
    And no debería enviarse ningún email automáticamente
