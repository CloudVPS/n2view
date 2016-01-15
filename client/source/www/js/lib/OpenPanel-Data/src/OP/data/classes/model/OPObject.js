/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.model.OPObject = Backbone.Model.extend({
    initialize : function () {
        var that = this;
        this.bind("change", function () { that.differsFromOriginal = true; });
    },
    
    context : null,
    
    setContext : function (context) {
        this.context = context;
        this.setStore(context.getOpObjectStore());
    },
    
    getContext : function () {
        return this.context;
    },
    
    differsFromOriginal : false,
    isNew : function () {
        return !this.get("uuid");
    },
    
    childOPObjectCollections : null,
    
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    },
        
    defaults : {
        "class": "",
        id: "",
        metaid: "",
        uuid: null
    },
     
    opClass : null,
     
    validate : function (attributes){  
        _.each(attributes, function (value, key) {
            
        });
    },
    
    getChildObjectCollections : function () { 
        var that = this;
        if(this.childOPObjectCollections == null) {
            this.childOPObjectCollections = {};
            var that = this;
            this.opClass.children.each(function(childClass) {
                if(childClass.get("metaBase") != ""){
                    var c = childClass.collection.get(childClass.get("metaBase"));
                    if (c == undefined) {
                        throw new Error("Class missing: ", childClass.get("metaBase"));
                    }
                    targetChildClass = c;
                } else {
                    targetChildClass = childClass;
                }
                
                var childOPObjectCollection = new OP.data.classes.collection.OPObject([], { opClass : targetChildClass, parentId : that.get("uuid")!=="ROOT"?that.get("uuid"):null });
                childOPObjectCollection.setContext(that.context);
                that.childOPObjectCollections[targetChildClass.id] = childOPObjectCollection;
            });
        }
        return this.childOPObjectCollections;
    },
    
    
    getChildObjectCollection : function (className) {
        if(this.childOPObjectCollections == null) {
            this.getChildObjectCollections();
        }
        var childCollection = this.childOPObjectCollections[className];
        return childObjectCollection;
    },
    
    getChildClasses : function () {
        return this.opClass.children;
    }
 });