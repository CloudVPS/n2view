N2.data.model.Host = Backbone.Model.extend({
    initialize : function (options) {
       this.events = new N2.data.collection.HostEvents();
       this.events.host = this;
       this.report = new N2.data.model.HostReport();
       this.report.host = this;
    },
    url : function () {
        var url = "/n2/host/" + this.get("hostID");
        if(this.get("startDate")){
            url+="/date/" + this.get("startDate");
        }
        return url;
    }
});