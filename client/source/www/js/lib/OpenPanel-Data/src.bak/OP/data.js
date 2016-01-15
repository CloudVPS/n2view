/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds orm etc.
 */
OP.data = {
    
    setup : function () {
        
    },
    
    initializeBackboneSync : function () {
        Backbone.sync = function (method, model, success, error){
           // console.log(method, model, success, error);
            switch (method) {
                case "create":         model.store.create(model, success, error); break;
                case "read":           model.id ? model.store.find(model, success, error) : model.store.findAll(model, success, error); break;
                case "update":         model.store.update(model, success, error); break;
                case "delete":         model.store.destroy(model); break;
            }
        };
        
        OP.data.classes.collection.OPClass.model = OP.data.classes.model.OPClass;
        OP.data.classes.collection.OPObject.model = OP.data.classes.model.OPObject;
        
    },
    
    applications : []
};