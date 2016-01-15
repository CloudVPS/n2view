/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.collection.OPClass = Backbone.Collection.extend({
    initialize : function () {
           this.store = OP.data.classes.collection.OPClass.getStore();
           OP.data.classes.model.OPClass.setStore(this.store);
    },
    model: null,
    store : null
});

_.extend(OP.data.classes.collection.OPClass, {
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    }
});