N2.data.model.User = Backbone.Model.extend({
    url : function () {
        return "/data/user/" + this.get("username");
    }
});