N2.data.model.GridConfiguration = Backbone.Model.extend({
    initialize : function(attributes, options){
        if(_.isUndefined(this.get("data"))){
            this.set({data: JSON.stringify({filters: [1,2,3]})});
        }
        var data = JSON.parse(this.get("data"));
        this.set({
            filters : data.filters
        });
    },
    url : function () {
        return "/data/gridConfiguration/" + this.get('username') + (this.id?"/" + this.id:"");
    }
});


/*

{ 
    filters : [
        
    ],
    columns : [
    
    ]
}

*/