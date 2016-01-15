/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.collection.OPObject = Backbone.Collection.extend({
    initialize : function (models, options) {
        if(typeof options.opClass !== "object") {
            throw new Error("class missing"); 
        }
            
        this.opClass = options.opClass;
        
        if (options.parentId != undefined && options.parentId != "" && options.parentId != null ) {
            this.parentId = options.parentId;
        }
        this.store = OP.data.classes.collection.OPObject.getStore();
        OP.data.classes.model.OPObject.setStore(this.store);
    },
    model: null,
    store : null,
    opClass : null,
    parentId : null
});

_.extend(OP.data.classes.collection.OPObject, {
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    }
});