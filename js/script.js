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

// DECONNEXION
function logout(){

    // récupération des éléments token et id
    var tokenString = tokenTake();
    var user_id = idTake();

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

// FONCTIONS DE RÉCUPÉRATION D'ÉLEMENTS D'URL
// récupération du token
function tokenTake () {
     var token = $_GET(token);
     var tokenString = token.token;

     return tokenString; 
}
// récupération du nom d'user
function userTake () {
     var user_name = $_GET(user_name);
     var user_nameString = user_name.user_name;

     return user_nameString; 
}
// récupération de l'id user
function idTake() {
    var user_id = $_GET(user_id);
    var user_id = user_id.user_id;

    return user_id;
}
// format date
function DateFormat(){
    var time = new Date();
    var hours = time.getHours();
    var min = "0"+ time.getMinutes();
    var seconds = "0"+ time.getSeconds();
    var formattedTime = hours + ':' + min.substr(-2) + ':' + seconds.substr(-2);

    return formattedTime;
}

// UTILISATEURS CONNECTÉS
function connectedUsers(){

    // récupération des éléments token et name
    var tokenString = tokenTake();
    var user_nameString = userTake();

	$.ajax({
        url: 'http://greenvelvet.alwaysdata.net/kwick/api/user/logged/'+tokenString,
        type: 'GET',
        dataType: "jsonp",
        
        success: function(data) {

            // création d'une variable qui va emmagasiner la liste des utilisateurs qui ne sera affichée qu'une fois
            var html ='';

            for( var i = 0; i<data.result.user.length; i++ ){
            	
                if( user_nameString == data.result.user[i]){
                    html +='<li id="current_user">'+data.result.user[i]+'</li>';
                }else{
                    html +='<li>'+data.result.user[i]+'</li>';
                }
            }

            // affichage du nombre d'utilisateurs
            $('#connect-users h3 span').html(data.result.user.length+' ');
            // affiche la liste des utilisateurs
            $('#list-users').html(html);
        },
        error: function() {
            console.log('erreur ajax Connected users');
        }
    });
}

// MESSAGES REÇUS
function getMessages(){
    // heure
    var time = new Date();
    var timeStamp = time.getTime();
    var formattedTime = DateFormat();
	
    // récupération des éléments token et name
    var tokenString = tokenTake();
    var user_nameString = userTake();

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
                        
                        timeStamp = data.result.last_timestamp;
                        
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
    // heure
    var time = new Date();
    var timeStamp = time.getTime();
    var formattedTime = DateFormat();

    // récupération des éléments token, id et name
    var tokenString = tokenTake();
    var user_id = idTake();
    var user_nameString = userTake();

    var message = $('#blabla-txt').val();
	message = encodeURIComponent( message );

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


