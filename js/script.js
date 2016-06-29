function inscription() {
    // récupération des valeurs des input d'inscription
    var userName = $('#user-name').val();
    var userPassword = $('#user-password').val();

    // Test pour savoir si le ou les champs ne sont pas vides
    if (userName === '' || userPassword === '') {
        alert("Nom d'utilisateur ou Mot de passe non renseigné!");
        return false;
    }

    $.ajax({
        url: 'http://greenvelvet.alwaysdata.net/kwick/api/signup/' + userName + '/' + userPassword,
        type: 'GET',
        dataType: "jsonp",
        data: {
            userName: userName,
            userPassword: userPassword
        },
        success: function(data) {
            // si tout est bon alors on récupère les variables token et id de l'utilisateur
            var token = data.result.token;
            var user_id = data.result.id
            // et on redirige vers la page de chat avec les paramètres dans l'url
            
            var user_name_temp = data.result.message.split(" ");
            var user_name = user_name_temp[0];
            document.location.href="chat.html?token="+token+"&user_id="+user_id+"&user_name="+user_name;
            
        },
        error: function() {
            console.log('erreur ajax inscription');
        }
    });

    return false;
}

function connexion(){
    // récupération des valeurs des input de connexion
	var userName = $('#user-name').val();
    var userPassword = $('#user-password').val();

    // Test pour savoir si le ou les champs ne sont pas vides
    if (userName === '' || userPassword === '') {
        alert("Nom d'utilisateur ou Mot de passe non renseigné!");
        return false;
    }

    $.ajax({
        url: 'http://greenvelvet.alwaysdata.net/kwick/api/login/' + userName + '/' + userPassword,
        type: 'GET',
        dataType: "jsonp",
        data: {
            userName: userName,
            userPassword: userPassword
        },
        success: function(data) {

            var token = data.result.token;
            var user_id = data.result.id;
            
            // si l'utilisateur n'est pas enregistré il n'a pas de token, et ne doit pas pouvoir accéder au chat
            if( token == null ){
                // on retire la fenêtre de connexion
                $('.container-log').css('display', 'none');
                // et on affiche celle qui permet de choisir entre l'inscription et revenir à la connexion
                $('.inexistant-user-container').css('display', 'block');

            }else{
                var user_name_temp = data.result.message.split(" ");
                var user_name = user_name_temp[2];
                document.location.href="chat.html?token="+token+"&user_id="+user_id+"&user_name="+user_name;
            }

        },
        error: function() {
            console.log('erreur ajax connexion');
        }
    });

    return false;
}

// PAGE DE CHAT //
// Récupération du token dans l'url
//https://www.creativejuiz.fr/blog/javascript/recuperer-parametres-get-url-javascript
function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}

// UTILISATEURS CONNECTÉS
function connectedUsers(){
	// Récupération du token dans l'url
	var token = $_GET(token);
	// conversion en chaîne de caractères pour le traitement en Ajax
	var tokenString = token.token;

	$.ajax({
        url: 'http://greenvelvet.alwaysdata.net/kwick/api/user/logged/'+tokenString,
        type: 'GET',
        dataType: "jsonp",
        
        success: function(data) {
            var html ='';
            for( var i = 0; i<data.result.user.length; i++ ){
            	html +='<li>'+data.result.user[i]+'</li>';
            }
            $('#list-users').html(html);
        },
        error: function() {
            console.log('erreur ajax Connected users');
        }
    });
}

// MESSAGES REÇUS
function getMessages(){
    // création du timestamp
	var time = new Date();
    var timeStamp = time.getTime();
   
    // gestion de l'heure à affichée
    var hours = time.getHours();
    var min = "0"+ time.getMinutes();
    var seconds = "0"+ time.getSeconds();
    var formattedTime = hours + ':' + min.substr(-2) + ':' + seconds.substr(-2);
	
    // récupération du token
	var token = $_GET(token);
	var tokenString = token.token;

    // récupération du nom de l'utilisateur
    var user_name = $_GET(user_name);
    var user_nameString = user_name.user_name;

    timeStamp = Math.floor((timeStamp/1000)-2);

	$.ajax({
		url: 'http://greenvelvet.alwaysdata.net/kwick/api/talk/list/'+tokenString+'/'+timeStamp,
		type: 'GET',
        dataType: "jsonp",

		success: function(data){
            if (data.result.last_timestamp !== null) {
                for( var i = 0; i<data.result.talk.length; i++ ){
                    if (data.result.talk[i].user_name != user_nameString) {
                        // écriture du message avec l'heure, le pseudo et le contenu du messsage
                        $('#messages-send').append('<p class="message"><span class="date">['+ formattedTime +']</span> <span class="pseudo-user">'+data.result.talk[i].user_name+'</span> : '+data.result.talk[i].content+'</p>');
                    }
                }
                // Descente automatique du scroll dans la div#messages-send pour voir le dernier message
                $("#messages-send").scrollTop( $("#messages-send")[0].scrollHeight );
            }
		},
		error: function(){
			console.log('erreur ajax Messages récupérés');
		}
	});

}

// MESSAGES ENVOYÉS
function sendMessages(){

    // création du timestamp
    var time = new Date();
    var timeStamp = time.getTime();

    // gestion de l'heure à affichée
    var hours = time.getHours();
    var min = "0"+ time.getMinutes();
    var seconds = "0"+ time.getSeconds();
    var formattedTime = hours + ':' + min.substr(-2) + ':' + seconds.substr(-2);

	var token = $_GET(token);
	var tokenString = token.token;

	// Récupération de l'id dans l'url
	var user_id = $_GET(user_id);
	var user_id = user_id.user_id;

    // récupération du nom de l'utilisateur
    var user_name = $_GET(user_name);
    var user_nameString = user_name.user_name;

	var message = encodeURI( $('#blabla-txt').val() );

	$.ajax({
		url: 'http://greenvelvet.alwaysdata.net/kwick/api/say/'+tokenString+'/'+user_id+'/'+message,
		type: 'GET',
        dataType: "jsonp",

		success: function(data){
            var msg = $('#blabla-txt').val();
            $('#messages-send').append('<p class="message"><span class="date">['+ formattedTime +']</span> <span class="pseudo-user">'+user_nameString+'</span> : '+msg+'</p>');
            $('#blabla-txt').val('');
		},
		error: function(){
			console.log('erreur ajax sendMessages!');
		}
	});
	return false;	
}

// DECONNEXION
function logout(){
    var token = $_GET(token);
    var tokenString = token.token;

    var user_id = $_GET(user_id);
    var user_id = user_id.user_id;

    $.ajax({
        url: 'http://greenvelvet.alwaysdata.net/kwick/api/logout/'+tokenString+'/'+user_id,
        type: 'GET',
        dataType: "jsonp",

        success: function(data){
            console.log('deconnexion success');
            document.location.href="index.html";
        },
        error: function(){
            console.log('erreur ajax not deconnected!');
        }
    });
    return false;   

}
