OP.mvc.commands.ShowLoginCommand = function (options) {
    var super = new OP.mvc.commands.Command(options);
    super.extend(this, {
        execute : function () {
            console.log("executing ShowLoginCommand", this.snafu);
        },
        snafu : 5666
    });
};
    