N2.data.collection.GridConfigurations = Backbone.Collection.extend({
    
    url : function(){
        return "/data/gridConfiguration/" + this.username;
    }
});