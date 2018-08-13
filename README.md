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


## ¿Como asegurar una API con el SDK para NodeJS?
La manera recomendada es siguiendo el flujo del implicit grant de OAuth aunque todo depende del caso de uso.  
Para esto se utiliza una estrategia de [Passport.js](http://www.passportjs.org/) proporcionada por AppID llamada *APIStrategy*    

## ¿Como asegurar una aplicación web con el SDK para NodeJS?
Para una aplicación web se sugiere utilizar el grant de OAuth llamado *authorization code grant*. Para eso se utiliza una estrategia de Passport.js llamada *WebAppStrategy* que va a mostrar la pantalla de login necesaria en caso de que el usuario no este autenticado.


## Personalización
Cuanto se utiliza para proteger una aplicación web con `WebAppStrategy`, por defecto se incluyen pantallas a las cuales se le puede modificar el color y el logo de la empresa, de esta manera es posible rápidamente asegurar aplicaciones y usar el servicio. Las siguientes pantallas están incluidas:  
1. Login
2. Registro
3. Cambio de contraseña
4. Re envio de email de verificación  

Alternativamente se puede integrar con pantallas personalizadas, para más información: [https://console.bluemix.net/docs/services/appid/branded.html#branding](https://console.bluemix.net/docs/services/appid/branded.html#branding)

## SDKs
AppID incluye SDKs para la fácil integración con distintos lenguajes: [https://console.bluemix.net/docs/services/appid/install.html#configuring](https://console.bluemix.net/docs/services/appid/install.html#configuring)

### Ejemplo de acceso a una aplicación web protegida
En el siguiente código se puede ver como dependiendo si el usuario inició sesión o no se van llamando diferentes funciones y middlewares de Express.js. El siguiente código fue tomado del ejemplo `Getting started` y no está completo. El token de acceso se guarda como parte de la sesión.
```javascript
...

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

...

```

## Tutorial 1: Creando una API y protegiendo su acceso paso a paso
En el siguiente tutorial se va a crear una API que expone información que no debe ser revelada a personas sin autorización. Por esta razón la queremos proteger utilizando AppID. Se va a crear un servididor (backend) que expone la API rest y un cliente que la consuma.

### Proyecto e instalacion de las dependencias
#### 1. Crear un proyecto utilizando npm init 
```
npm init
```
#### 2. Instalar las dependencias  
```
npm install --save express
npm install --save passport
npm install --save ibmcloud-appid
```
#### 3. Importar los modulos necesarios y configurar express
```javascript
//Dependencias necesarias
const express = require('express');
const passport = require('passport');
const APIStrategy = require("ibmcloud-appid").APIStrategy;

const app = express();
//Hacemos que express use el middleware de Passport.js
app.use(passport.initialize());

/* Si la aplicación esta asociada a AppID a travéz de IBM Cloud (como en Cloud Foundry) estos datos
 * se obtienen de la variable de entorno VCAP_SERVICES de manera automatica */

//Estos son los datos de la instancia de AppID que obtenemos desde el dashboard de AppID en la sección: View credentials
passport.use(new APIStrategy({
	oauthServerUrl: "{oauth-server-url}",
	tenantId: "{tenant-id}",
	clientId: "{client-id}"
}));

...

```
#### 4. Creamos la API
Para poder acceder al recurso es necesario haber iniciado sesión previamente y obtenido un *access token* que debe ser enviado en el Header cada petición a la API de la siguiente forma `Authorization=Bearer {access_token} [{id_token}]`. En caso de no haber proporcionado el token o que esté expirado no se procede en la petición y devuelve `Www-Authenticate=Bearer scope="{scope}" error="{error}"` siendo `error` opcional.
```javascript
...

//API
app.get("/api/protected",

	passport.authenticate(APIStrategy.STRATEGY_NAME, {
		session: false
    }),
    
	function(req, res) {
		//Contiene propiedades para acceder al access token y el identity token
		var appIdAuthContext = req.appIdAuthorizationContext;

	        console.log(appIdAuthContext.identityTokenPayload); // identity_token JSON decodifcado

		//Tambien se puede usar el objeto provisto por Passport.js
		var username = req.user.name || "Anónimo";
		res.send("Hello desde un recurso protegido " + username);
	}
);

var port = 8080;

//Escuchar en un puerto por peticiones
app.listen(port, function(){
	logger.info("Send GET request to http://localhost:" + port + "/api/protected");
});

```

## Tutorial 2: Autenticación y accediendo a API protegida


## Adaptando AppID a tu caso de uso
Para ver más en profundidad como adaptar App ID a tu caso de uso es recomendable seguir el tutorial de iniciación. Una vez creada la instancia de AppID en IBM Cloud puedes ir a la opción en el panel de control: *Overview > Getting started* y descargar la aplicación de ejemplo. Tiene todo lo necesario para entender el flujo de asegurar una aplicación web. Para una API es recomendable entender bien el *implicit grant flow* de OAuth.

Para más información: https://console.bluemix.net/docs/services/appid/index.html#sample-app

## Documentación y Referencias
Para profundizar más en AppID puedes dirigirte a las siguientes fuentes: 
https://console.bluemix.net/docs/services/appid/index.html
https://github.com/ibm-cloud-security/appid-serversdk-nodejs/blob/master/README.md
