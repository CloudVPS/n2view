OP.mvc.commands.Login = OP.mvc.Command.extend({
    
    execute : function (transport) {
       console.log("OP.mvc.commands.Login execute", transport, this);
       var that = this;
       if(!transport.data || !transport.data.username || !transport.data.password){
           console.log(transport);
           throw new Error("Stuff missing: data.username and data.password");
       }
       var context = new OP.data.classes.Context({
            username : transport.data.username,
            password : transport.data.password, 
            success : function (myContext) {
                transport.data.context = myContext;
                delete transport.data.username;
                delete transport.data.password;
                delete transport.errors;
                
                that.finish(transport);
            },
            error : function (errorMessage, request, response) {
                transport.errors = {
                    errorMessage : errorMessage,
                    request : request,
                    response : response
                };
                that.fail();
                that.finish(transport);
            }
        });
    }
});