N2.data.model.HostReport = Backbone.Model.extend({
    host : null,
    url : function(){
        return "/n2/host/" + this.host.get("hostID") + "/analysis";
    }
});