/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.store.OPClass = function () {
    this.sessionId = null;
    this.data = {};
    this.hasFetched = false;
};

_.extend(OP.data.classes.store.OPClass.prototype, {
    setSessionId : function (sessionId) {
        this.sessionId = sessionId;
    },
    find : function (model, success, error) {
        var that = this;
        if(this.hasFetched == false) {
            this.findAll(
                {},
                function(){
                    if(that.data[model.get("id")]){
                        success(that.data[model.get("id")]);
                    } else {
                        error("Couldn't find model");
                    }
                },
                function(errorMessage){
                    error(errorMessage);
                }
            );
        } else {
            if(this.data[model.get("id")]){
                success(that.data[model.get("id")]);
            } else {
                error("Couldn't find model");
            }
        }
    },
    create : function (model, success, error) {
        error("OPClassCollection can not be created this way." 
                +" See http://wiki.openpanel.com/index.php/Developers");
    },
    update : function (model, success, error) {
        error("OPClassCollection can not be updated this way.");
    },
    destroy : function (model, success, error) {
        error("OPClassCollection can not be deleted this way.");
    },
    findAll : function (collection, success, error) {
        var that = this;
        OP.rpc.requests.getWorld({
            sessionId : that.sessionId,
            success : function (world, response){ 
                that.hasFetched = true;
                var root = new OP.data.classes.model.OPClass({
                    id: "ROOT",
                    name : "ROOT",
                    uuid : "ROOT"
                });
                root.children = new OP.data.classes.collection.OPClass();
                
                var response = []; 
                response.push(root);    
                _.each(world.classes, function (value, key) {
                    var o = new OP.data.classes.model.OPClass({ 
                        id: key,
                        name : key, 
                        canCreate : value.capabilities.create,
                        description : value["class"].description,
                        uuid : value["class"].uuid,
                        parentId : value.info.parent?value.info.parent.id:null,
                        metaType : value["class"].metatype,
                        metaBase : value["class"].metabase
                    });
                    o.children = new OP.data.classes.collection.OPClass();
                    that.data[key] = o;
                    response.push(o);    
                });
                var parse = function (models, model) {
                    _.each(models, function (m) {
                       if ((m.get("parentId") === null && model.get("id") === "ROOT") || (m.get("parentId") == model.get("id"))) {
                            model.children.add(m);
                            m.set({ parent : model });
                            delete models[m.get("id")];
                            parse(models, m);
                       }
                    });
                };
                parse(_.clone(that.data), root);
                that.data["ROOT"] = root;
                success(response);
            },
            error : function (errorMessage, request, response) { 
                console.log("OP.rpc.requests.getWorld error", errorMessage, request, response);
                error(errorMessage);
            }
        });
    }
});