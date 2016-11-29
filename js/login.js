var login = angular.module('login', [])

login.controller('LoginController', function(){
	this.credentials = {
		
	}
	this.getCredentials = function(){
		console.log(this.credentials)
		var email = this.credentials.username;
		var password = this.credentials.password;

		firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
 		 // Handle Errors here.
 		 console.log(error);
 		 var errorCode = error.code;
 		 var errorMessage = error.message;
  		 // ...

  		 $(document).ready(function(){
  		 	$('#modal1').modal();
  		 	$('.msg-head').html("Login Error!");
  		 	$('.msg-text').html(error.message)
  		 	$('#modal1').modal('open');
  		 })
  		 

		});
	}
})