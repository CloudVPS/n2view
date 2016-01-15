/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.model.OPObject = Backbone.Model.extend({
    initialize : function () {
        this.store = OP.data.classes.model.OPObject.getStore();
        var that = this;
        this.bind("change", function () { that.differsFromOriginal = true; });
    },
    
    differsFromOriginal : false,
    isNew : function () {
        return !this.get("uuid");
    },
    
    childOPObjectCollections : null,
    
    store : null,
        
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
                that.childOPObjectCollections[targetChildClass.id] = childOPObjectCollection;
            });
        }
        return _.values(this.childOPObjectCollections);
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

 _.extend(OP.data.classes.model.OPObject, {
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    }
 });