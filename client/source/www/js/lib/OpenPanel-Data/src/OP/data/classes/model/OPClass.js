/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.model.OPClass = Backbone.Model.extend({
    initialize : function () {
       
    },
    
    context : null,
    
    setContext : function (context) {
        this.context = context;
        this.setStore(context.getOpClassStore());
    },
    
    getContext : function () {
        return this.context;
    },
    
    /**
     * @returns {boolean}
     */
    isNew : function () {
        return !this.get("uuid");
    },
    
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    },
        
    defaults : {
         canCreate: false,
         canDelete: false,
         canGetInfo: false,
         canUpdate: false,
         childCount: 0,
         description: "",
         indexing: "",
         isRootObject: false,
         meta: false,
         metaValue: "",
         name: "",
         parent: null,
         singleton: false,
         singletonValue: "",
         title: "",
         uuid: null,
         parentId : null,
         shortName : ""
     },
     
     /**
      * 
      * @param parentId
      * @returns {OP.data.classes.collection.OPObject}
      */
     getOPObjectCollection : function (parentId) {
         var opObjectCollection = new OP.data.classes.collection.OPObject([], { opClass : this, parentId : parentId != undefined ? parentId : null });
         opObjectCollection.setContext(this.context);
         return opObjectCollection;
     },
     
     /**
      * 
      * @param options
      * @returns {OP.data.classes.model.OPObject}
      */
     getOPObject : function (options){
         var opObject = new OP.data.classes.model.OPObject(options);
         opObject.setContext(this.context);
         opObject.opClass = this;
         return opObject;
     },
     
     /**
      * @function
      * @param uuid
      * @returns {OP.data.classes.model.OPObject}
      */
     getOPObjectByUUID : function (uuid) {
         return this.getOPObject({ id : uuid });
     },
     
     /**
      * @param metaId
      * @returns {OP.data.classes.model.OPObject}
      */
     getOPObjectByMetaId : function (metaId) {
         return this.getOPObject({ id : metaId });
     }
 });