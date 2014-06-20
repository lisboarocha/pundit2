angular.module('Pundit2.Notebook')
.controller('NotebookCtrl', function($scope, NotebookExchange, Preview, ContextualMenu) {

    // get item by id (passed as directive nid param)
    $scope.notebook = NotebookExchange.getNotebookById($scope.nid);    

    $scope.onItemMouseOver = function(){
        Preview.showDashboardPreview($scope.notebook);
    };

    $scope.onItemMouseLeave = function(){
        Preview.hideDashboardPreview();
    };

    $scope.isSticky = function() {
        return Preview.isStickyItem($scope.notebook);
    };

    $scope.onClickSticky = function(evt){
        if (Preview.isStickyItem($scope.notebook)) {
            Preview.clearItemDashboardSticky();
        } else {
            Preview.setItemDashboardSticky($scope.notebook);
        }
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    };
    
    $scope.onClickMenu = function(evt){
        // show menu on notebook, the action is added by MyItemsContainer or PageItemsContainer service
        // the type of menu to show is relative to pageItems or myItems
        ContextualMenu.show(evt.pageX, evt.pageY, $scope.notebook, $scope.menuType);
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    };

});