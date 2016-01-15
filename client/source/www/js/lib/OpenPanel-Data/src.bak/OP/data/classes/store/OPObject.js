/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.store.OPObject = function () {
    this.sessionId = null;
    this.data = {};
    this.hasFetched = false;
    this.openPanelClassCollection = null;
};

_.extend(OP.data.classes.store.OPObject.prototype, {
    setSessionId : function (sessionId) {
        this.sessionId = sessionId;
    },
    
    find : function (model, success, error) {
        var that = this;
        if(this.hasFetched == true) {
            if(this.data[model.get("id")]){
                success(that.data[model.get("id")]);
            } else {
                error("Couldn't find model");
            }
        } else {
            OP.rpc.requests.getRecord({
                sessionId : that.sessionId,
                classId : model.opClass.id,
                objectId : model.id,
                success : function (attributes) {
                    success(attributes);
                },
                error : function () {
                    error(arguments);
                }
            });
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
        var target = collection.parentId != null ? collection.parentId : "ROOT";
        if(collection.opClass.id == "ROOT") target = "_";
        this.data[target] = {};
        if(target == "_") {
            that.data[target][collection.opClass.id] = {};
            var o = new OP.data.classes.model.OPObject({ id : "ROOT", uuid : "ROOT"});
            o.opClass = collection.opClass;
            that.data[target][collection.opClass.id]["ROOT"] = o;
            success(_.values(that.data[target][collection.opClass.id]));
        } else {
            OP.rpc.requests.getRecords(
                {
                    sessionId : that.sessionId, 
                    classId : collection.opClass.id, 
                    parentId : collection.parentId != null ? collection.parentId : undefined,
                    success : function (records, response){
                        _.each(records, function (record, id) {
                            if(that.data[target][collection.opClass.id] == undefined) {
                                that.data[target][collection.opClass.id] = {};
                            }
                            var o = new OP.data.classes.model.OPObject(record);
                            o.opClass = that.openPanelClassCollection.get(record["class"]);
                            that.data[target][collection.opClass.id][record.uuid] = o;
                        });
                        success(_.values(that.data[target][collection.opClass.id]));
                    },
                    error : function (errorMessage, request, response){ 
                        error(errorMessage);
                    }
                }
            );
        }
    }
});