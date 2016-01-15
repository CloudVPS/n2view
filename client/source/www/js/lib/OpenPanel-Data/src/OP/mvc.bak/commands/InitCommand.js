OP.mvc.commands.InitCommand = function (options) {
    var super = new OP.mvc.commands.Command(options);
    super.extend(this, {
        execute : function () {
            console.log("executing InitCommand", this.foo);
        },
        foo : 100
    });
};