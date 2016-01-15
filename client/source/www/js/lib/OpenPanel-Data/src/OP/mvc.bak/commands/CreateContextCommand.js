OP.mvc.commands.CreateContextCommand = function (options) {
    var super = new OP.mvc.commands.Command(options);
    super.extend(this, {
        execute : function () {
            console.log("executing CreateContextCommand");
        }
    });
};
    