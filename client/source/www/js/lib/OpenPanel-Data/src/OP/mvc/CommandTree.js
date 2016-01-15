OP.mvc.CommandTree = function (mappings) {
    var s = {};
    var f = function (m) {
        _.each(m, function (value, key) {
            if (key == "id" && m["command"]) {
                s[value] = m;
            } 
            if(typeof(value) == "object"){
                f(value);
            }
        });
    };
    
    f(mappings);
    var that = this;
    _.extend(this, {
        get : function (id) {
            if (s[id]) {
                var k = OP.mvc.commands[s[id].command];
                var d = new k(s[id]);
                d.setCommandTree(that);
                return d;
            }
        }
    });
};