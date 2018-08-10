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

Alternativamente se puede integrar con pantallas personalizadas, para más información: [https://console.bluemix.net/docs/services/appid/branded.html#branding](https://console.bluemix.net/docs/services/appid/branded.html#branding)

## SDKs
AppID incluye varios SDKs para la fácil integración con distintos lenguajes: [https://console.bluemix.net/docs/services/appid/install.html#configuring](https://console.bluemix.net/docs/services/appid/install.html#configuring)

## ¿Como asegurar una API con el SDK para NodeJS?
La manera recomendada es siguiendo el flujo del implicit grant de OAuth aunque todo depende del caso de uso.  
Para esto se utiliza una estrategia de [Passport.js](http://www.passportjs.org/) proporcionada por AppID llamada *APIStrategy*    

### Acceso a un recurso protegido
Para poder acceder al recurso es necesario haber iniciado sesión y obtenido un *access token* que debe ser enviado en cada petición.
```javascript
  var express = require('express');
  var passport = require('passport');
  var APIStrategy = require('ibmcloud-appid').APIStrategy;

  passport.use(new APIStrategy());
  var app = express();
  app.use(passport.initialize());

  app.get('/protected', passport.authenticate('APIStrategy.STRATEGY_NAME', {session: false }),
      function(request, response){
          console.log("Securty context", request.securityContext)    
          response.send(200, "Success!");
      }
  );

  app.listen(process.env.PORT);
```
  

## ¿Como asegurar una aplicación web con el SDK para NodeJS?
Para una aplicación web se sugiere utilizar el grant de OAuth llamado *authorization code grant*. Para eso se utiliza una estrategia de Passport.js llamada *WebAppStrategy* que va a mostrar la pantalla de login necesaria en caso de que el usuario no este autenticado.

### Acceso a un recurso protegido
En el siguiente código se puede ver como dependiendo si el usuario inició sesión o no se van llamando diferentes funciones y middlewares de Express.js. El token de acceso se guarda como parte de la sesión.
```javascript
// Protected area. If current user is not authenticated - redirect to the login widget will be returned.
// In case user is authenticated - a page with current user information will be returned.
app.get("/protected", function tryToRefreshTokensIfNotLoggedIn(req, res, next) {
	if (isLoggedIn(req)) {
		return next();
}

webAppStrategy.refreshTokens(req, req.cookies.refreshToken).finally(function() {
		next();
	});
}, passport.authenticate(WebAppStrategy.STRATEGY_NAME), storeRefreshTokenInCookie, function (req, res, next) {
	var accessToken = req.session[WebAppStrategy.AUTH_CONTEXT].accessToken;
	var isGuest = req.user.amr[0] === "appid_anon";
	var isCD = req.user.amr[0] === "cloud_directory";
	var foodSelection;
	var firstLogin;
	// get the attributes for the current user:
	userProfileManager.getAllAttributes(accessToken).then(function (attributes) {
		var toggledItem = req.query.foodItem;
		foodSelection = attributes.foodSelection ? JSON.parse(attributes.foodSelection) : [];
		firstLogin = !isGuest && !attributes.points;
		if (!toggledItem) {
			return;
		}
		var selectedItemIndex = foodSelection.indexOf(toggledItem);
		if (selectedItemIndex >= 0) {
			foodSelection.splice(selectedItemIndex, 1);
		} else {
			foodSelection.push(toggledItem);
		}
		// update the user's selection
		return userProfileManager.setAttribute(accessToken, "foodSelection", JSON.stringify(foodSelection));
	}).then(function () {
		givePointsAndRenderPage(req, res, foodSelection, isGuest, isCD, firstLogin);
	}).catch(function (e) {
		next(e);
	});
});
```

## Adaptando AppID a tu caso de uso
Para ver más en profundidad como adaptar App ID a tu caso de uso es recomendable seguir el tutorial de iniciación. Una vez creada la instancia de AppID en IBM Cloud puedes ir a la opción en el panel de control: *Overview > Getting started* y descargar la aplicación de ejemplo. Tiene todo lo necesario para entender el flujo de asegurar una aplicación web. Para una API es recomendable entender bien el *implicit grant flow* de OAuth.

Para más información: https://console.bluemix.net/docs/services/appid/index.html#sample-app
