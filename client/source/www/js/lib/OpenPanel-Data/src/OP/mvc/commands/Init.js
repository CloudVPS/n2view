OP.mvc.commands.Init = OP.mvc.Command.extend({
    initialize : function () {
        console.log("OP.mvc.commands.Init initialize");
    },
    execute : function (transport) {
        var loginCard = new Ext.Panel({
            padding : 10,
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
       });
        
        var backButton = new Ext.Button({
            text : 'back',
            ui : 'back',
            hidden : true,
            listeners : {
                click : {
                    element : "el",
                    fn : function () {
                        cardManager.goToPreviousCard();
                    }
                }
            }
        });
        var modulesCard = new Ext.Panel({
            width: 400,
            height: 300,
            layout: {
                type: 'card'
            }
        });
        var panel = new Ext.Panel({
            fullscreen : true,
            dockedItems: [
                new Ext.Toolbar({
                    dock : 'top',
                    title: 'OpenPanel',
                    items : [backButton]
                })
            ],
            layout : {
                type : "card"
            },
            items : [
                 loginCard,
                 modulesCard
            ]
        });
        
        var cardManager = {
            panels : null,
            goToNextCard : function (hi) {
                if(this.panels == null){
                    this.panels = new Ext.util.MixedCollection();
                }
                var panel = new Ext.Panel({
                    title : "some panel",
                    scroll : "vertical",
                    layout : {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items : [
                    ]
                });
                modulesCard.add(panel);
                modulesCard.setActiveItem(panel, {
                    type : "slide",
                    direction : "left"
                });
                this.b();
                return panel;
            },
            goToPreviousCard : function () {
                console.log("goToPreviousCard");
                var panel = modulesCard.items.last();
                if(panel){
                    var previousPanel = modulesCard.items.getAt(modulesCard.items.getCount()-2);
                    if(previousPanel){
                        var that = this;
                        modulesCard.setActiveItem(previousPanel, {
                            type : 'slide',
                            direction : 'right',
                            after : function(){
                                if (modulesCard.items.indexOf(panel) !== -1){
                                    modulesCard.items.remove(panel);
                                    that.b();
                                }
                            }
                        });
                    }
                }
            },
            b : function () {
                if(modulesCard.items.getCount() > 1) {
                    backButton.show({
                        type : 'fade'
                    });
                } else {
                    backButton.hide({
                        type : 'fade'
                    });
                }
            }
        };
        
        var transport = {
                data : {
                    username : transport.data.username,
                    password : transport.data.password
                },
                
                gui : {
                    cardManager : cardManager,
                    loginCard : loginCard,
                    modulesCard : modulesCard,
                    panel : panel
                }
            };
        console.log("OP.mvc.commands.Init execute", transport);
        
        
       
        
        this.finish(transport);
    }
});