angular.module('Pundit2.TripleComposer')
.controller('StatementCtrl', function($scope, $element, TypesHelper, ResourcePanel, NameSpace, TripleComposer) {

    // default values
    $scope.subjectLabel = '';
    $scope.subjectTypeLabel = '';
    $scope.subjectFound = false;
    $scope.subjectSearch = "";
    $scope.subjectIcon = TripleComposer.options.inputIconSearch;

    $scope.predicateLabel = '';
    $scope.predicateFound = false;
    $scope.predicateSearch = "";
    $scope.predicateIcon = TripleComposer.options.inputIconSearch;

    $scope.objectLabel = '';
    $scope.objectTypeLabel = '';
    $scope.objectFound = false;
    $scope.objectSearch = "";
    $scope.objectIcon = TripleComposer.options.inputIconSearch;
    $scope.objectLiteral = false;

    $scope.canBeObjectDate = true;
    $scope.canBeObjectLiteral = true;

    // reference to the items used inside this statement
    var triple = {
        subject: null,
        predicate: null,
        object: null
    };

    // build an array that represent the triple
    // this array is passed to resource panel
    var buildUrisArray = function(){
        var res = [];

        if (triple.subject!==null) {
            res.push(triple.subject.uri);
        } else {
            res.push('');
        }
        if (triple.predicate!==null) {
            res.push(triple.predicate.uri);
        } else {
            res.push('');
        }
        if (triple.object!==null) {
            res.push(triple.object.uri);
        } else {
            res.push('');
        }

        return res;
    };

    $scope.isStatementComplete = function(){
        if (triple.subject!==null && triple.predicate!==null && triple.object!==null) {
            return true;
        } else {
            return false;
        }
    };

    // remove statement directive
    $scope.remove = function() {
        ResourcePanel.hide();
        $scope.tripleComposerCtrl.removeStatement($scope.id);
    };

    // make a copy of this statement (TODO if it's empty ???)
    // and add it to the statements array inside triple composer
    $scope.duplicate = function(){
        ResourcePanel.hide();
        $scope.tripleComposerCtrl.duplicateStatement($scope.id);
    };

    // copy the actual triple (invoked inside link function)
    $scope.copy = function(){
        var res = angular.copy(triple);
        if ($scope.objectDate) {
            res.isDate = true;
        }
        if ($scope.objectLiteral) {
            res.isLiteral = true;
        }
        return res;
    };

    $scope.get = function(){
        return triple;
    };

    // read the duplicated property inside scope (this property is owned by the statement tha born by duplication)
    // then add the label value to the relative scope properties
    // this function should be invoked only one time (in the link function)
    // when you duplicate a statement, elsewhere probably is an error
    $scope.init = function(){
        
        triple = $scope.duplicated;
        delete $scope.duplicated;

        if (triple.subject !== null) {
            $scope.subjectLabel = triple.subject.label;
            $scope.subjectTypeLabel = TypesHelper.getLabel(triple.subject.type[0]);
            $scope.subjectFound = true;
        }
        if (triple.predicate !== null) {
            $scope.predicateLabel = triple.predicate.label;
            $scope.predicateFound = true;
        }
        if (triple.object !== null) {
            if (typeof(triple.object) === 'string'){
                // date or literal item
                $scope.objectLabel = triple.object;
                if (triple.isDate) {
                    $scope.objectTypeLabel = TypesHelper.getLabel(NameSpace.dateTime);
                }
                if (triple.isLiteral){
                    $scope.objectTypeLabel = TypesHelper.getLabel(NameSpace.rdfs.literal);
                }
                                
            } else {
                // standard item
                $scope.objectLabel = triple.object.label;
                $scope.objectTypeLabel = TypesHelper.getLabel(triple.object.type[0]);
            }
            $scope.objectFound = true;
            
        }
        
    };

    // reset scope to default
    $scope.wipe = function(){ 
        $scope.wipeSubject();
        $scope.wipePredicate(); 
        $scope.wipeObject();
    };

    $scope.wipeSubject = function(){
        $scope.subjectLabel = '';
        $scope.subjectTypeLabel = '';
        $scope.subjectFound = false;
        $scope.subjectSearch = "";
        $scope.subjectIcon = TripleComposer.options.inputIconSearch;
        triple.subject = null;
        ResourcePanel.hide();
        angular.element('.pnd-triplecomposer-save').addClass('disabled');
    };
    $scope.clearSubjectSearch = function(){
        if ($scope.subjectSearch === "" || typeof($scope.subjectSearch) === 'undefined'){
            return;
        }
        $scope.subjectSearch = "";
        ResourcePanel.showItemsForSubject(buildUrisArray(), undefined, $scope.subjectSearch).then(setSubject);
    };

    $scope.wipePredicate = function(){
        $scope.predicateLabel = '';
        $scope.predicateFound = false;
        $scope.predicateSearch = "";
        $scope.predicateIcon = TripleComposer.options.inputIconSearch;
        $scope.canBeObjectDate = true;
        $scope.canBeObjectLiteral = true;
        triple.predicate = null;
        ResourcePanel.hide();
        angular.element('.pnd-triplecomposer-save').addClass('disabled');
    };
    $scope.clearPredicateSearch = function(){
        if ($scope.predicateSearch === "" || typeof($scope.predicateSearch) === 'undefined'){
            return;
        }
        $scope.predicateSearch = "";
        ResourcePanel.showProperties(buildUrisArray(), undefined, $scope.predicateSearch).then($scope.setPredicate);
    };

    $scope.wipeObject = function(){
        $scope.objectLabel = '';
        $scope.objectTypeLabel = '';
        $scope.objectFound = false;
        $scope.objectSearch = "";
        $scope.objectIcon = TripleComposer.options.inputIconSearch;
        $scope.objectLiteral = false;
        $scope.objectDate = false;
        triple.object = null; 
        ResourcePanel.hide();
        angular.element('.pnd-triplecomposer-save').addClass('disabled');
    };
    $scope.clearObjectSearch = function(){
        if ($scope.objectSearch === "" || typeof($scope.objectSearch) === 'undefined'){
            return;
        }
        $scope.objectSearch = "";
        ResourcePanel.showItemsForObject(buildUrisArray(), undefined, $scope.objectSearch).then($scope.setObject);
    };

    // update input icons when text is present
    $scope.$watch(function() {
        return $scope.subjectSearch;
    }, function(str) {
        if (typeof(str) === 'undefined' || str === '') {
            $scope.subjectIcon = TripleComposer.options.inputIconSearch;
        } else {
            $scope.subjectIcon = TripleComposer.options.inputIconClear;
        }
    });
    $scope.$watch(function() {
        return $scope.predicateSearch;
    }, function(str) {
        if (typeof(str) === 'undefined' || str === '') {
            $scope.predicateIcon = TripleComposer.options.inputIconSearch;
        } else {
            $scope.predicateIcon = TripleComposer.options.inputIconClear;
        }
    });
    $scope.$watch(function() {
        return $scope.objectSearch;
    }, function(str) {
        if (typeof(str) === 'undefined' || str === '') {
            $scope.objectIcon = TripleComposer.options.inputIconSearch;
        } else {
            $scope.objectIcon = TripleComposer.options.inputIconClear;
        }
    });

    $scope.setSubject = function(item){
        $scope.subjectLabel = item.label;
        $scope.subjectTypeLabel = TypesHelper.getLabel(item.type[0]);
        $scope.subjectFound = true;
        triple.subject = item;
        $scope.tripleComposerCtrl.isAnnotationComplete();
    };
    $scope.onClickSubject = function($event){
        ResourcePanel.showItemsForSubject(buildUrisArray(), $event.target, $scope.subjectSearch).then($scope.setSubject);
    };
    $scope.onKeyUpSubject = function($event){
        ResourcePanel.showItemsForSubject(buildUrisArray(), $event.target, $scope.subjectSearch).then($scope.setSubject);
    };

    $scope.setPredicate = function(item){
        $scope.predicateLabel = item.label;
        $scope.predicateFound = true;
        triple.predicate = item;
        // check predicate range
        if (item.range.indexOf(NameSpace.rdfs.literal) === -1) {
            $scope.canBeObjectLiteral = false;
        }
        if (item.range.indexOf(NameSpace.dateTime) === -1) {
            $scope.canBeObjectDate = false;
        }
        $scope.tripleComposerCtrl.isAnnotationComplete();
    };
    $scope.onClickPredicate = function($event){
        ResourcePanel.showProperties(buildUrisArray(), $event.target, $scope.predicateSearch).then($scope.setPredicate);
    };
    $scope.onKeyUpPredicate = function($event){
        ResourcePanel.showProperties(buildUrisArray(), $event.target, $scope.predicateSearch).then($scope.setPredicate);
    };

    $scope.setObject = function(item){
        $scope.objectFound = true;
        triple.object = item;
        
        if (typeof(item) === 'string') {
            // literal item
            $scope.objectLabel = item;
            $scope.objectTypeLabel = TypesHelper.getLabel(NameSpace.rdfs.literal);
            $scope.objectLiteral = true;
        } else if( item instanceof Date) {
            // date item
            triple.object = item.toString();
            $scope.objectLabel = triple.object;
            $scope.objectTypeLabel = TypesHelper.getLabel(NameSpace.dateTime);
            $scope.objectDate = true;
        } else {
            // standard item
            $scope.objectLabel = item.label;
            $scope.objectTypeLabel = TypesHelper.getLabel(item.type[0]);
        }

        $scope.tripleComposerCtrl.isAnnotationComplete();
        
    };
    $scope.onClickObject = function($event){        
        ResourcePanel.showItemsForObject(buildUrisArray(), $event.target, $scope.objectSearch).then($scope.setObject);
    };
    $scope.onKeyUpObject = function($event){
        ResourcePanel.showItemsForObject(buildUrisArray(), $event.target, $scope.objectSearch).then($scope.setObject);
    };

    $scope.onClickObjectCalendar = function($event){
        ResourcePanel.showPopoverCalendar(undefined, $event.target).then(function(date){
            triple.object = date.toString();
            $scope.objectLabel = triple.object;
            $scope.objectTypeLabel = TypesHelper.getLabel(NameSpace.dateTime);
            $scope.objectDate = true;
            $scope.objectFound = true;
            $scope.tripleComposerCtrl.isAnnotationComplete();
        });
    };

    $scope.onClickObjectLiteral = function($event){
        ResourcePanel.showPopoverLiteral('', $event.target).then(function(text){
            $scope.objectFound = true;
            $scope.objectLabel = text;
            $scope.objectTypeLabel = TypesHelper.getLabel(NameSpace.rdfs.literal);
            $scope.objectLiteral = true;
            triple.object = text;
            $scope.tripleComposerCtrl.isAnnotationComplete();
        });
    };

});