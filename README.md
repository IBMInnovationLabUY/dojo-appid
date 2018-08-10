IBM Cloud AppID
======

## ¿Qué es App ID?
Es un servicio de IBM Cloud que ofrece un mecanismo de seguridad que se encarga del control de acceso. 
A diferencia de soluciones como IAM o SAML está creada para para asegurar aplicaciones de una manera rápida y efectiva, no se requiere extensiva experiencia previa.

## ¿Como funciona?
AppID esta construido utilizando OpenID Connect, una capa de autenticación sobre el protocolo de autorización OAuth 2.0. Para la autorización AppID soporta los siguientes grant de Oauth 2.0:  
1. Authorization code grant  
2. Implicit grant flow
3. Resource Owner Password Credentials Grant  

## Proveedores del servicio de identidad
AppID se puede conectar con los siguientes proveedores  
1. Facebook
2. Google
3. SAML 2.0 (Para conectarse a un proveedor de identidad corporativo)
4. Cloud Directory: Permite alojar los usuarios en la instancia de AppID

## Personalización
Por defecto se incluyen pantallas a las cuales se le puede modificar el color y el logo de la empresa, de esta manera es posible rápidamente asegurar aplicaciones y usar el servicio. Las siguientes pantallas están incluidas:  
1. Login
2. Registro
3. Cambio de contraseña
4. Re envio de email de verificación  

Alternativamente se puede integrar con pantallas personalizadas, para más información: https://console.bluemix.net/docs/services/appid/branded.html#branding

## SDKs
AppID incluye varios SDKs para la fácil integración con distintos lenguajes:  
https://console.bluemix.net/docs/services/appid/install.html#configuring

## ¿Como asegurar una API con el SDK para NodeJS?

## ¿Como asegurar una aplicación web con el SDK para NodeJS?
