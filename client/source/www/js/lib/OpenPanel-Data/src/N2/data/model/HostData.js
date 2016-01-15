N2.data.model.HostData = Backbone.Model.extend({
    initialize : function (options) {
        this.set(options);
    },
    url : function(){
        var interval;
        if(this.get("interval") === undefined){
            interval = 320;
        } else {
            interval = this.get("interval");
        }
        var url = "/n2/host/" + this.get("hostID") + "/graph/" + this.get("graphType");
        if(this.get("startDate")!==undefined){
            url+="/date/" + this.get("startDate");
        } 
        url+= "/interval/" + interval;
        return url;
    }
});