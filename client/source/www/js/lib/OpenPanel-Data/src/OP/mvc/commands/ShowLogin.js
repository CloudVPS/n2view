OP.mvc.commands.ShowLogin = OP.mvc.Command.extend({
    initialize : function () {
        console.log("OP.mvc.commands.ShowLogin initialize", this.data.delegates.login, arguments);
    },
    execute : function (transport) {
        var that = this;
        var username = "";
        var password = "";
        var errorMessage = "";
        if(transport.data){
            if(transport.data.username) username = transport.data.username;
            if(transport.data.password) password = transport.data.password;
            if(transport.errors && transport.errors.errorMessage) {
                errorMessage = transport.errors.errorMessage;
            }
        }
        
        Ext.regModel('LoginUser', {
            fields: [
                {
                    name: 'username',     
                    type: 'string'
                },
                {
                    name: 'password',
                    type: 'password'
                }
            ]
        });
        
        if(!transport.gui.form) {
            transport.gui.form = new Ext.form.FormPanel({
                items: [
                    {
                        xtype: 'textfield',
                        name : 'username',
                        label: 'User name'
                    },
                    {
                        xtype: 'textfield',
                        inputType : 'password',
                        name : 'password',
                        label: 'Password'
                    }
                ]
            });
            
            var loginButton = new Ext.Button({
                name : 'loginButton',
                text : 'log in',
                listeners : {
                    click : {
                        element : 'el',
                        fn : function () {
                            var v = transport.gui.form.getValues();
                            transport.data.username = v.username;
                            transport.data.password = v.password;
                            transport.gui.loginCard.disable();
                            that.commandTree.get(that.data.delegates.loginCommandId).execute(transport);
                        }
                    }
                }
            });
            transport.gui.loginCard.add([
                {
                    xtype: 'fieldset',
                    title: 'Login',
                    instructions: 'Please enter your user name and password.',
                    defaults: {
                        required: true
                    },
                    items : [
                         transport.gui.form
                    ]
                },
                loginButton
                ]
            );
        } else {
            transport.gui.loginCard.enable();
        }
        var user = Ext.ModelMgr.create({
            'username'      : username,
            'password'      : password
        }, 'LoginUser');
        transport.gui.form.load(user);
        transport.gui.loginCard.doLayout();
        
        if (errorMessage !== "") {
            Ext.Msg.alert('Login failed', "Are your user name and password typed correctly?", Ext.emptyFn);
        }
       
        console.log("OP.mvc.commands.ShowLogin execute", transport);
        this.finish(transport);
    }
});