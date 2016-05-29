angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaFile, $cordovaCamera, $cordovaFileTransfer, $cordovaSocialSharing, $ionicLoading, $cordovaNetwork, $ionicPlatform, $ionicPopup) {


  function saveImageToPhone(url, success, error) {
    var canvas, context, imageDataUrl, imageData;
    var img = new Image();
    img.onload = function() {
      canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);
      try {
        imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
        imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
        cordova.exec(
          success,
          error,
          'Canvas2ImagePlugin',
          'saveImageDataToLibrary',
          [imageData]
        );
      }
      catch(e) {
        error(e.message);
      }
    };
    try {
      img.src = url;
    }
    catch(e) {
      error(e.message);
    }
  }





  $scope.takePicture = function() {

    if($cordovaNetwork.isOffline()) {
      $ionicPopup.alert({
          title: 'Network connection required',
          template: 'Please enable your internet connection and try again'
      });
    }
    else
    {

    var options = {
      quality : 75,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : Camera.PictureSourceType.CAMERA,
      allowEdit : true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 2048,
      targetHeight: 2048,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation : true
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {

      var imgURI = "data:image/jpeg;base64," + imageData;
      var options = {};
      var params = {} ;
      params.clientKey = "XXX";
      options.params = params ;
      options.fileKey = "photo";


      $cordovaFileTransfer.upload("http://www.tedxpantheonsorbonne.fr/capture/", imgURI, options)
      .then(function(result) {

        serverResponse = JSON.parse(result.response);

          if(serverResponse.status == "success")
          {

              $scope.imgURI = serverResponse.message;

              var success = function(msg){
                $ionicLoading.hide();
              };

              var error = function(err){
                $ionicPopup.alert({
                  title: 'Sorry',
                  template: 'An error occured, please try again'
                });
              };

              saveImageToPhone(serverResponse.message, success, error);

            $cordovaSocialSharing.canShareVia("facebook", "test").then(function(result) {
              $scope.facebookSharing = true;
            });
            $cordovaSocialSharing.canShareVia("twitter", "test").then(function(result) {
              $scope.twitterSharing = true;
            });

            $ionicLoading.hide();
          }
          else
          {
            $ionicPopup.alert({
              title: 'Sorry',
              template: serverResponse.message
            });
          }

        }, function(err) {

        if($cordovaNetwork.isOffline()) {
          $ionicPopup.alert({
            title: 'Network connection required',
            template: 'Please enable your internet connection and try again'
          });
        }
        else
        {
          $ionicPopup.alert({
            title: 'Sorry',
            template: 'An error occured, please try again'
          });
        }

      }, function (progress) {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner>'
        });
      });

    }, function(err) {
      $ionicPopup.alert({
        title: 'Sorry',
        template: 'An error occured, please try again'
      });
    });

    }
  }



  $scope.sharePictureOnFacebook = function(message, image, link) {

    $cordovaSocialSharing.canShareVia("facebook", message, image, link).then(function(result) {
      $cordovaSocialSharing.shareViaFacebook(message, serverResponse.message, link);
    }, function(error) {
      alert("Cannot share on Facebook");
    });

  }

  $scope.sharePictureOnTwitter = function(message, image, link) {

    $cordovaSocialSharing.canShareVia("twitter", message, image, link).then(function(result) {
      $cordovaSocialSharing.shareViaTwitter(message, serverResponse.message, link);
    }, function(error) {
      alert("Cannot share on Twitter");
    });

  }

  $scope.sharePicture = function() {
    $cordovaSocialSharing.share("Les nouveaux explorateurs de TEDxPanthéonSorbonne en image", "TEDxPantheonSorbonne Capture", serverResponse.message, "http://www.tedxpantheonsorbonne.fr");
  }


});


/*
TODO
Régler #tags et mettre en prod
Rendre compatible iOS
Tester le préchargement de l'image ou la faire apparaitre directement
http://fragged.org/preloading-images-using-javascript-the-right-way-and-without-frameworks_744.html
*/
