N2.data.collection.HostEvents = Backbone.Collection.extend({
    initialize : function () {
        this.model = N2.data.model.HostEvent;
    },
    host : null,
    url : function(){
        return "/n2/host/" + this.host.get("hostID") + "/eventlog";
    },
    parse : function (o) {
        if(o && o.eventLog){
            return o.eventLog;
        }
    }
});