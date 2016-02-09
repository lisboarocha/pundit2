angular.module('Pundit2.Annotators')

.directive('resourceMenu', function($rootScope, NameSpace, ContextualMenu,
    Toolbar, ImageHandler, ImageAnnotator, ItemsExchange, TemplatesExchange,
    TripleComposer, EventDispatcher, Item, XpointersHelper, AnnotationsExchange,
    ResourceAnnotator) {

    return {
        restrict: 'C',
        scope: {},
        templateUrl: 'src/Annotators/ResourceMenu.dir.tmpl.html',
        replace: true,
        link: function(scope, element) {

            scope.element = element;
            scope.item = null;
            scope.selected = false;

            var createItemFromResource = function(resourceElem) {
                var values = {};

                values.uri = resourceElem.attr('about');
                values.cMenuType = "resourceHandlerItem";
                values.label = resourceElem.parent().text().trim();
                values.type = values.type = [NameSpace.types.resource]; // TODO to be defined
                values.pageContext = XpointersHelper.getSafePageContext();
                values.icon = true;
                values.elem = resourceElem;

                return new Item(values.uri, values);
            };

            scope.isSelected = function() {
                return scope.selected;
            };
            
            scope.myElement = function() {
                return scope.element;
            };
            
            scope.clickHandler = function(evt) {
                if (scope.item === null) {
                    // create item only once
                    scope.item = createItemFromResource(scope.element);
                    ItemsExchange.addItemToContainer(scope.item, "createdResource");
                }
                if (Toolbar.isActiveTemplateMode()) {
                    var triples = TemplatesExchange.getCurrent().triples;
                    // verify that all predicates admit images as subject
                    // all template triples must be have a predicate
                    for (var i in triples) {
                        if (triples[i].predicate.suggestedSubcjetTypes.indexOf(NameSpace.types.resource) === -1) {
                            return;
                        }
                    }

                    TripleComposer.addToAllSubject(ItemsExchange.getItemByUri(scope.item.uri));
                    TripleComposer.closeAfterOp();
                    EventDispatcher.sendEvent('Annotators.saveAnnotation');
                    return;
                }

                ContextualMenu.show(evt.pageX, evt.pageY, scope.item, scope.item.cMenuType);
                //TODO: destroy listener
                var listenerDelete = EventDispatcher.addListeners(
                    [
                        'AnnotationsCommunication.deleteItems'
                    ],
                    function(e) {
                        if (e.args.length === 0) {
                            return;
                        }
                        if (scope.item.uri === e.args[0].uri) {
                            scope.selected = false;
                        }
                        EventDispatcher.removeListener(listenerDelete);

                    });
                var listenerSave = EventDispatcher.addListeners(
                    [
                        'AnnotationsCommunication.saveAnnotation'
                    ],
                    function(e) {
                        if (typeof AnnotationsExchange.getAnnotationById(e.args).items[scope.item.uri] !== "undefined") {
                            scope.selected = true;
                        }
                        EventDispatcher.removeListener(listenerSave);
                    });
            };

            //scope.url = attributes.pndResource;

            ResourceAnnotator.addReference(element.attr('about'), scope);
        }
    };
});