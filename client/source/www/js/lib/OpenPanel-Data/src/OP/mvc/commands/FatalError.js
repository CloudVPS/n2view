OP.mvc.commands.FatalError = OP.mvc.Command.extend({
        initialize : function () {
            console.log("OP.mvc.commands.FatalError initialize");
        },
        execute : function (transport) {
            Ext.Msg.alert('FFFFFFFFFFFFFFFFF', "ffffffffffffffff", Ext.emptyFn);
            console.log("OP.mvc.commands.FatalError execute", transport, this);
            this.finish(transport);
        }
    });