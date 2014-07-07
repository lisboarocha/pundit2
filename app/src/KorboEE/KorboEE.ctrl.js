angular.module('KorboEE')
    .controller('EEDirectiveCtrl', function($scope, APIService, korboConf, $http, KorboCommunicationFactory, $timeout, ItemsExchange, KorboCommunicationAutocomplete, Item) {

        $scope.autocompleteListTemplate = 'src/KorboEE/autocompleteList.tmpl.html';
        var api;
        $scope.readyToRender = false;
        $scope.noFound = "no entities found";
        $scope.elemToSearch = '';
        $scope.isSearching = false;
        $scope.serverNotRunning = false;
        //$scope.results = [];
        var containerPrefix = "kee-";

        $scope.renderElement = function(){
            return $scope.readyToRender;
        };

        // when configuration is set, initialize API callbacks
        $scope.$watch('conf', function(){

            if (!$scope.errorGlobalObjName){
                $scope.init = function(){
                    $scope.readyToRender = $scope.conf.updateTime;
                    $scope.limit = $scope.conf.limitSearchResult;
                    $scope.minLabelLength = $scope.conf.labelMinLength;

                    // set default language
                    $scope.defaultLan = $scope.conf.languages[0];
                    for (var j in $scope.conf.languages){
                        if($scope.conf.languages[j].state === true) {
                            $scope.defaultLan = $scope.conf.languages[j];
                            break;
                        } // end if
                    } // end for

                    initExposeAPI();
                    // TODO: the template is NOT rendered yet, let's try an evalAsync
                    // to see if it's ready (or reayd!)... for real!
                    $scope.$evalAsync(function(){
                        callOnReayd();
                    });
                }();

            } // if errorGlobalObjName

        }); // watch conf


        $scope.$watch(function() {
            return angular.element('.kee-autocomplete-list').outerWidth();
        }, function() {
            angular.element('.kee-autocomplete-list').css({
                width:$scope.inputWidth
            });
        });

        var callOnReayd = function(){
            //console.log(angular.element('.kee-input-elem-to-search').outerWidth());
            $scope.inputWidth = angular.element('.kee-input-elem-to-search').outerWidth();

            if ($scope.conf.onReady !== null && typeof($scope.conf.onReady) === 'function'){
                $scope.conf.onReady();
            }
        };

        var initExposeAPI = function(){
            api = APIService.get($scope.conf.globalObjectName);
            //TODO vedere vecchio korboee
            // add events and features to APIService
            if (typeof(api) !== "undefined"){

                api.exposeOpenSearch(function(val){
                    //TODO
                });

                api.exposeOpenNew(function(entity){
                    //TODO
                });

                api.exposeEdit(function(id){
                    //TODO
                });


            }

        };

        // handle ENTER key press
        // if no autocomplete search is set
        // stop event propagation
        // and open the modal
        $scope.keyPressHandle = function($event){
            if($event.keyCode === 13 && ($scope.conf.useAutocompleteWithSearch || $scope.conf.useAutocompleteWithNew) === false){
                $event.stopPropagation();
                $event.preventDefault();
                $scope.open();
            } else if($event.keyCode === 13 && ($scope.conf.useAutocompleteWithSearch || $scope.conf.useAutocompleteWithNew)){
                $event.stopPropagation();
                $event.preventDefault();

            }
        };


        $scope.autoCompleteSearch = function(viewValue) {
            var container = "kee-korbo";
            if(viewValue.length >= $scope.conf.labelMinLength){
                $scope.isSearching = true;

                $scope.results = KorboCommunicationAutocomplete.autocompleteSearch(viewValue, $scope.conf.endpoint, 'korbo', $scope.conf.limitSearchResult, 0, $scope.defaultLan.value);
                $scope.results.then(function(res){
                    if(typeof(res[0]) !== 'undefined' && res[0].errorServer){
                        $scope.serverNotRunning = true;
                        $scope.isSearching = false;
                    } else {
                        console.log(res);
                        $scope.isSearching = false;
                        $scope.serverNotRunning = false;
                        return $scope.results;
                    }

                    });

            }

            /*
            var korboCommunication = new KorboCommunicationFactory();
            var param = {};
            param.endpoint = $scope.conf.endpoint;
            param.provider = 'korbo';
            param.limit = $scope.conf.limitSearchResult;
            param.offset = 0;
            param.lang = $scope.defaultLan.value;

            if(viewValue.length >= $scope.conf.labelMinLength){
                $scope.results = [];
                param.label = viewValue;
                $scope.results = korboCommunication.search(param, containerPrefix+param.provider).then(function(){
                    $scope.results = ItemsExchange.getItemsByContainer(containerPrefix+param.provider);
                    console.log(ItemsExchange.getItemsByContainer(containerPrefix+param.provider));
                });
            }*/


        };


        $scope.selectEntity = function(entity){
            console.log("hai selezionato: ",entity);
            $scope.location = entity.value.uri;
            $scope.label = entity.value.label;

            var obj = {};
            obj.value = $scope.location;
            obj.label = entity.value.label;
            obj.type = entity.value.type;
            obj.image = entity.value.depiction;
            obj.description = entity.value.abstract;
            obj.language = $scope.defaultLan.value;
            // fire callback onSave()
            api.fireOnSave(obj);
        };

        var updateTimer;
        // timer when input change
        $scope.$watch('elemToSearch', function() {
            //$timeout.cancel(updateTimer);
            //httpHandler();
            $scope.autoCompleteSearch($scope.elemToSearch);
        });

        var httpHandler = function() {
            updateTimer = $timeout(function(){
                $scope.autoCompleteSearch($scope.elemToSearch);
            }, 1000);
        };

        $scope.showSearchButton = function(){
            if($scope.conf.autoCompleteOptions === 'search' || $scope.conf.autoCompleteOptions === 'all' ){
                return true;
            } else {
                return false;
            }
        };

        $scope.showNewButton = function(){
            if($scope.conf.autoCompleteOptions === 'new' || $scope.conf.autoCompleteOptions === 'all' ){
                return true;
            } else {
                return false;
            }
        };

        $scope.isLoading = function(){
            return $scope.isSearching;
        };


    });