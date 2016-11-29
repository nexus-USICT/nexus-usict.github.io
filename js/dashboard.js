var dashboard = angular.module('dashboard', [])

dashboard.controller('FooterController',  function(){
	this.setFooter = function(){

		$(document).ready(function(){
			$('.footer-title').html('Teacher Module')
		})

	}
	
})

dashboard.directive('dashboardTabs', function(){
	return{
		restrict: 'E',
		templateUrl: 'dashboard-tabs.html',
		controller: function($scope){
			this.tab = 1

			$scope.userImg = ""

			$scope.getUserImg = function () {
				// body...
				firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					console.log("Reutnr");
					$scope.userImg = user.photoURL;
					$scope.$apply();
				}
			});

			}

			this.isSet = function (num) {
				return this.tab == num
			}

			this.setTab = function (num) {
				//console.log("set Tab");
				this.tab = num

				$(document).ready(function() {
					$(".side-nav-btn").sideNav('hide');
				})
			}

		},
		controllerAs: "panel"


	}
})

dashboard.directive('classTab', function(){
	return{
		restrict: 'E',
		templateUrl: 'classes-tab.html',
		controller: function ($scope) {
			

			$scope.classData = {}
			$scope.classDetails = {}
			$scope.assignments = {}
			$scope.curClass = "";
			$scope.assignment_arr = []
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					var userId = firebase.auth().currentUser.uid;
					var teacher_data =  firebase.database().ref('/users/teachers/' + userId)
					teacher_data.on('value', function(snapshot){
					//	console.log(snapshot.val());

					$scope.classData = Object.keys(snapshot.val().classes);
					$scope.classDetails = snapshot.val().classes;
					$scope.assignments = snapshot.val().assignments
					$scope.$apply()
					//
					//	console.log($scope.assignments);
				})
				}
			})

			$scope.isSet = function(){
				return $scope.curClass != "";
			}

			$scope.isAssignments = function(){
				return $scope.assignment_arr.length != 0 
			}
			$scope.setClass = function (c) {
				//console.log("Set Class " + c);
				$scope.curClass = c;
			}

			$scope.getAssignments = function(c){
				$scope.assignment_arr = []
				//console.log("get" + c)
				//console.log($scope.assignments)

				//console.log("Above loop");
				//console.log(Object.keys($scope.assignments).length);

				

				for (var i = Object.keys($scope.assignments).length - 1; i >= 0; i--) {
				//	console.log("Inside");
				//	console.log("comparing")
				//	console.log($scope.assignments[Object.keys($scope.assignments)[i]]["class"])
				//	console.log(c);


				if($scope.assignments[Object.keys($scope.assignments)[i]]["class"] == c){
						//console.log("comparing")
					//	console.log($scope.assignments[i]["class"])
					//console.log(c);
					$scope.assignment_arr.push($scope.assignments[Object.keys($scope.assignments)[i]])

				}
			}
		//	console.log($scope.assignment_arr.length);

		return $scope.assignment_arr
	}


},
controllerAs: "classes"
}
})





dashboard.directive('assignmentTab', function(){
	return{
		restrict: 'E',
		templateUrl: 'assignments-tab.html',
		controller: function ($scope) {
			
			$scope.adata = []
			this.finalData = ""
			$scope.asgmt = {}
			$scope.assignments_tab_data = []

			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					var userId = firebase.auth().currentUser.uid;
					var teacher_data =  firebase.database().ref('/users/teachers/' + userId)
					teacher_data.on('value', function(snapshot){
						

						$scope.assignments_tab_data = snapshot.val().assignments
						$scope.adata = Object.keys(snapshot.val().classes);
						$scope.$apply()
						//console.log($scope.assignments_tab_data);
					})
				}
			})

			

			$scope.getAssignmentsData = function(){
				return $scope.assignments_tab_data
			}

			$scope.getadata = function () {
			//	console.log("adsda")
			$(document).ready(function () {
				$('select').material_select();
			})
			return $scope.adata
		}

		$scope.postAssignment = function () {
			//	console.log($scope.asgmt)
			var timestamp = Number(new Date());
			var storageRef = firebase.storage().ref(timestamp.toString());

			var $ = jQuery;
			var file_data = $('.myFile').prop('files')[0];

			var uploadTask = storageRef.put(file_data);
			uploadTask.on('state_changed', function(snapshot){
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				//	console.log('Upload is ' + progress + '% done');
				switch (snapshot.state) {
					case firebase.storage.TaskState.PAUSED: 
					//	console.log('Upload is paused');
					break;
					case firebase.storage.TaskState.RUNNING: 
					//	console.log('Upload is running');
					break;
				}
			}, function(error) {

			}, function() {

				var userId = firebase.auth().currentUser.uid;
				var downloadURL = uploadTask.snapshot.downloadURL;
				//	console.log(downloadURL);

				var jsonToSend = {
					"title": $scope.asgmt.title,
					"due" : $scope.asgmt.due,
					"notes": $scope.asgmt.note,
					"link" : downloadURL,
					"submitted_on": timestamp,
					"class" : $scope.asgmt.class
				}

				var jsonToSendInRoot = {
					"title": $scope.asgmt.title,
					"due" : $scope.asgmt.due,
					"notes": $scope.asgmt.note,
					"link" : downloadURL,
					"submitted_on": timestamp,
					"teacher" : userId
				}



				var newPostKey = firebase.database().ref('/users/teachers/' + userId).child('assignments').push().key;
				//	console.log(jsonToSend);
				//	console.log(firebase.auth().currentUser.uid);

				//	console.log(newPostKey)

				var updates = {};
				updates['/users/teachers/' + userId + '/assignments/' + newPostKey] = jsonToSend;
				updates['/assignments/' + $scope.asgmt.class  + '/' + newPostKey ] = jsonToSendInRoot	
				console.log(firebase.database().ref().update(updates));
			});


		}

	},
	controllerAs: "assignment"
}
})

dashboard.directive('calendarTab', function () {
	return{
		restrict: 'E',
		templateUrl: 'calendar-tab.html',
		controller: function ($scope) {
			$scope.dates = {}

			$scope.date_array = []
			$scope.date_cur_sub = ""

			$scope.model = {}

			var d = new Date("Mon Aug 22 2016 01:45:08 GMT+0530 (IST)");

			var arr = {}
			var p_arr = []

			i=0
			while(i<50){
				d.setDate(d.getDate() + 1)
				var value = d

				arr[value.toString()] = ""
				p_arr.push(value.toString())
				i++;
			}


			p_arr.sort(function(a,b){

				return new Date(a) - new Date(b);
			});


			$scope.dates = arr

			$scope.date_array = p_arr

		//	console.log("SCOPE DATES");
		//	console.log($scope.dates)
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
				var userId = firebase.auth().currentUser.uid;
				var teacher_data =  firebase.database().ref('/users/teachers/' + userId + '/calendar/')
				teacher_data.on('value', function(snapshot){
					//	console.log("Calendar")	

					//	console.log(snapshot.val());

					len = Object.keys(snapshot.val());

					for(var j=0; j<len.length;j++){
						$scope.dates[len[j]] = snapshot.val()[len[j]]
					}

					$scope.$apply()
						//console.log("YOOOO");
						//console.log($scope.dates);

					})
			}
		})



		$scope.date_set_cur_sub = function () {
			$scope.date_cur_sub = ""
		}
		$scope.date_post_json = function () {
			var userId = firebase.auth().currentUser.uid;

			var newPostKey = firebase.database().ref('/users/teachers/' + userId).child('calendar').update($scope.dates)
				//console.log(newPostKey)	
				
			}


		},
		controllerAs : 'calendar'
	}
})

dashboard.directive('editTab', function(){
	return {
		restrict: 'E',
		templateUrl: 'edit-tab.html',
		controller: function ($scope) {
			$scope.editProfileData = {}

			//var userId = firebase.auth().currentUser.uid;
			$scope.userLocal = {}

			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					console.log(user)
					var userId = firebase.auth().currentUser.uid;
					$scope.editProfileData.displayName = user.displayName;
					$scope.editProfileData.email = user.email;
					$scope.userLocal = user;
					$scope.$apply();
				}
			})


			console.log("DATA")
			console.log($scope.editProfileData);


			$scope.updateProfile = function () {
				firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
						var timestamp = Number(new Date());
			var storageRef = firebase.storage().ref(timestamp.toString());

			var $ = jQuery;
			var file_data = $('.myImg').prop('files')[0];

			var uploadTask = storageRef.put(file_data);
			uploadTask.on('state_changed', function(snapshot){
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				//	console.log('Upload is ' + progress + '% done');
				switch (snapshot.state) {
					case firebase.storage.TaskState.PAUSED: 
					//	console.log('Upload is paused');
					break;
					case firebase.storage.TaskState.RUNNING: 
					//	console.log('Upload is running');
					break;
				}
			}, function(error) {

			}, function() {

				var userId = firebase.auth().currentUser.uid;
				var downloadURL = uploadTask.snapshot.downloadURL;
				//	console.log(downloadURL);

				user.updateProfile({
					displayName: $scope.editProfileData.displayName,
					photoURL: downloadURL
				}).then(function() {

					console.log($scope.editProfileData);
					console.log("Update Successfull");

					console.log(user);
				}, function(error) {

				});	

			});	
				}
			})

				
				
			}




		

			
		}
	}
})
