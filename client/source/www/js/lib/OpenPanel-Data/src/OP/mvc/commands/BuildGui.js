OP.mvc.commands.BuildGui = OP.mvc.Command.extend({
    initialize : function () {
        console.log("OP.mvc.commands.BuildGui initialize");
    },
    execute : function (transport) {
        var gui = transport.gui;
        gui.panel.setActiveItem(transport.gui.modulesCard, {
            type : 'slide'
        });
        
       
        /*
        card.add({
            html : "<a href=\"#\">asdasd</a>OMG ITS SO COOL!"
        });
        card.doLayout();
        */
        // homescreen
        var rootObject = transport.data.context.rootObject;
        this.buildPage(rootObject, gui);

        this.finish(transport);
    },
    buildPage : function (currentOpObject, gui){
        var that = this;
        var card = gui.cardManager.goToNextCard();
        var objectForm = {
                xtype: 'fieldset',
                padding: 15,
                title: currentOpObject.opClass.get("shortName"),
                items: []      
        };
        
        _.each(currentOpObject.attributes, function (attribute, key){
            objectForm.items.push({
               xtype : "textfield",
               label : key,
               name : key,
               value : attribute
            });
        });
        
        Ext.regModel('OPClass', {
            fields: ['className']
        });
        
        Ext.regModel('OPObject', {
            fields: ['metaid']
        });

        var data = [];
        _.each(currentOpObject.getChildObjectCollections(), function(childObjectCollection, childClassName){
            data.push({ 
                className : childObjectCollection.opClass.get("description"), 
                discloseFn : function(){
                    var c = gui.cardManager.goToNextCard();
                    childObjectCollection.fetch({
                        success : function () {
                            var opData = [];
                            childObjectCollection.each(function (childOpObject) {
                                opData.push({ 
                                    metaid : childOpObject.get("metaid"),
                                    itemTap : function () { 
                                        that.buildPage(childOpObject, gui);
                                    }
                                });
                            });
                            var opObjectStore = new Ext.data.JsonStore({
                                model  : 'OPObject',
                                sorters: 'metaid',

                                getGroupString : function(record) {
                                    return record.get('metaid')[0];
                                },

                                data: opData
                            });
                            var opObjectList = new Ext.List({
                                grouped: true,
                                itemTpl : '{metaid}',
                                scroll : true,
                                fullscreen : true,
                                indexBar: true,
                                store: opObjectStore,
                                listeners : {
                                    itemtap : {
                                        fn : function(o, index){ o.store.getAt(index).data.itemTap();}
                                    }
                                }
                            });
                            c.add(opObjectList);
                            c.doLayout();
                        }
                    });
                } 
            });
        });
        
        var store = new Ext.data.JsonStore({
            model  : 'OPClass',
            sorters: 'className',

            getGroupString : function(record) {
                return record.get('className')[0];
            },

            data: data
        });

        var list = new Ext.List({
            itemTpl : '{className}',
            scroll : false,
            store: store,
            onItemDisclosure : true,
            listeners : {
                itemtap : {
                    fn : function(o, index){ o.store.getAt(index).data.discloseFn();}
                }
            }
        });
        
        card.add(objectForm);
        card.add({
            xtype : "fieldset",
            title : "Child classes",
            items : [list],
            margin : 15
        });
        
        /*
        _.each(rootObject.getChildObjectCollections(), function(childObjectCollection, childClassName){
            console.log(childObjectCollection.opClass.get("description"));
            transport.gui.modulesDock.add({ text: childObjectCollection.opClass.get("shortName"), style : {
                height : "50px",
                paddingTop: "40px",
                backgroundImage: "url('/dynamic/icons/" + childObjectCollection.opClass.get("uuid") + ".png')",
                backgroundRepeat : "no-repeat",
                backgroundPosition: "13px 9px"
            }});
            transport.gui.modulesDock.add({ xtype: "spacer", width : 10});
        });
        console.log("OP.mvc.commands.BuildGui execute", transport, rootObject);
        */
        card.doLayout();
    }
});