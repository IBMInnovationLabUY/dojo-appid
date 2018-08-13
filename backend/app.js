//Dependencias necesarias
const express = require('express');
const passport = require('passport');
const APIStrategy = require("ibmcloud-appid").APIStrategy;

const app = express();
//Hacemos que express use el middleware de Passport.js
app.use(passport.initialize());

/* Si la aplicación esta asociada a AppID a travéz de IBM Cloud (como en Cloud Foundry) estos datos
 * se obtienen de la variable de entorno VCAP_SERVICES de manera automatica */

passport.use(new APIStrategy({
	oauthServerUrl: "{oauth-server-url}",
	tenantId: "{tenant-id}",
	clientId: "{client-id}"
}));

//API
app.get("/api/protected",

	passport.authenticate(APIStrategy.STRATEGY_NAME, {
		session: false
    }),
    
	function(req, res) {
		// Get full appIdAuthorizationContext from request object
		var appIdAuthContext = req.appIdAuthorizationContext;

		appIdAuthContext.accessToken; // Raw access_token
		appIdAuthContext.accessTokenPayload; // Decoded access_token JSON
		appIdAuthContext.identityToken; // Raw identity_token
		appIdAuthContext.identityTokenPayload; // Decoded identity_token JSON
		appIdAuthContext.refreshToken // Raw refresh_token

		// Or use user object provided by passport.js
		var username = req.user.name || "Anonymous";
		res.send("Hello from protected resource " + username);
	}
);

var port = 8080;

//Escuchar en un puerto por peticiones
app.listen(port, function(){
	console.log("Send GET request to http://localhost:" + port + "/api/protected");
});