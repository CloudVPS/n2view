/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.store.OPObject = function (sessionId) {
    this.sessionId = sessionId;
    this.data = {};
    this.hasFetched = false;
    this.openPanelClassCollection = null;
    this.objectsByUuid = {};
    _.extend(this, {
        find : function (model, success, error) {
            var that = this;
            OP.rpc.requests.getRecord({
                sessionId : model.getContext().getSessionId(),
                classId : model.opClass.id,
                objectId : model.id,
                success : function (attributes) {
                    success(attributes);
                },
                error : function () {
                    error(arguments);
                }
            });
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
                o.setContext(collection.getContext());
                o.opClass = collection.opClass;
                that.data[target][collection.opClass.id]["ROOT"] = o;
                success(_.values(that.data[target][collection.opClass.id]));
            } else {
                OP.rpc.requests.getRecords(
                    {
                        sessionId : collection.getContext().getSessionId(), 
                        classId : collection.opClass.id, 
                        parentId : collection.parentId != null ? collection.parentId : undefined,
                        success : function (records, response){
                            _.each(records, function (record, id) {
                                if(that.data[target][collection.opClass.id] == undefined) {
                                    that.data[target][collection.opClass.id] = {};
                                }
                                var o = new OP.data.classes.model.OPObject(record);
                                o.opClass = collection.getContext().classCollection.get(record["class"]);
                                o.setContext(collection.getContext());
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
};

