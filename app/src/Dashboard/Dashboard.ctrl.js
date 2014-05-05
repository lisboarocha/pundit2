angular.module('Pundit2.Dashboard')
.controller('DashboardCtrl', function($document, $window, $scope, Dashboard) {

    var jqElement = {

        // dashboard container
        container : angular.element('.pnd-dashboard-container'),

        // dashboard footer
        footer : angular.element('.pnd-dashboard-footer')
    };

    // set footer height
    jqElement.footer.css({
        'height' : Dashboard.options.footerHeight
    });

    $scope.isDashboardVisible = Dashboard.isDashboardVisible();

    var windowLastWidth = 0, windowCurrentWidth;
    angular.element($window).resize(function(){
        windowCurrentWidth = angular.element($window).innerWidth();
        if ( windowCurrentWidth !== windowLastWidth ) {
            windowLastWidth = windowCurrentWidth;
            Dashboard.setContainerWidth(windowCurrentWidth);
        }
    });

    $scope.useFluid = false;
    $scope.$watch('useFluid', function(value) {
        Dashboard.options.fluidResize = value;
    });

    /**** CONTAINER WATCHER ****/

    $scope.$watch(function() {
        return Dashboard.getContainerHeight();
    }, function(newHeight, oldHeight) {
        jqElement.container.css({
            'height' : newHeight
        });
    });

    $scope.$watch(function() {
        return Dashboard.getContainerWidth();
    }, function(newWidth, oldWidth) {
        jqElement.container.css({
            'width' : newWidth
        });
    });

    /**** TOGGLE WATCHER ****/

    $scope.$watch(function() {
        return Dashboard.isDashboardVisible();
    }, function(newVis, oldVis) {
        $scope.isDashboardVisible = newVis;
    });

    /**** FOOTER ****/

    var footerMouseUpHandler = function() {
        // remove handlers
        $document.off('mousemove', footerMouseMoveHandler);
        $document.off('mouseup', footerMouseUpHandler);

        Dashboard.log('Footer mouseup: removing handlers');
    }

    var lastPageY;
    var footerMouseMoveHandler = function(event) {
        var dy = event.pageY - lastPageY;
        if ( Dashboard.tryToSetContainerHeight(dy) ) {
            lastPageY = event.pageY;
        }
    }

    $scope.footerMouseDownHandler = function(event) {
        if ( event.which === 1 ) {
            event.preventDefault();        
            $document.on('mouseup', footerMouseUpHandler);
            $document.on('mousemove', footerMouseMoveHandler);

            lastPageY = event.pageY;
        }
    };

    Dashboard.log('Dashboard Controller Run');

});