OP.mvc.commands.LoginCommand = function (options) {
        var super = new OP.mvc.commands.Command(options);
        super.extend(this, {
            execute : function () {
                this.fail();
                console.log("executing LoginCommand");
            }
        });
    }
    