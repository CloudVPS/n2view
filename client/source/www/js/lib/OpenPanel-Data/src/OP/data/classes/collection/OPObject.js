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
    },
    model: null,
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    },
    setContext : function (context) {
        this.context = context;
        this.setStore(this.context.getOpObjectStore());
    },
    getContext : function () {
        return this.context;
    },
    opClass : null,
    parentId : null
});