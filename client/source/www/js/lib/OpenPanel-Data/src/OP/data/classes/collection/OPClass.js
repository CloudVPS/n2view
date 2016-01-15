/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.collection.OPClass = Backbone.Collection.extend({
    initialize : function () {
       
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
        this.setStore(this.context.getOpClassStore());
    },
    getContext : function () {
        return this.context;
    }
});