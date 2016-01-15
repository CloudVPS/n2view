OP.data.classes.Context;
(function(){
    var _sessionId;
    var _opClassStore;
    var _opObjectStore;
    
    OP.data.classes.Context = function (options) {
        _opClassStore = new OP.data.classes.store.OPClass();
        _opObjectStore = new OP.data.classes.store.OPObject();
        
        var that = this;
        OP.rpc.requests.bind({
            username : options.username,
            password : options.password,
            success : function (sessionId) {
                _sessionId = sessionId;
                that.classCollection = new OP.data.classes.collection.OPClass();
                that.classCollection.setContext(that);
                that.classCollection.fetch({
                    success : function () { 
                        if (_.isFunction(options.success)) {
                            var rootClass = that.classCollection.get("ROOT");
                            var rootCollection = rootClass.getOPObjectCollection();
                            rootCollection.fetch({
                                success : function(){
                                    that.rootObject = rootCollection.at(0);
                                    options.success(that);
                                }
                            });
                            
                        }
                    },
                    error : function (errorMessage, request, response) {
                        if (_.isFunction(options.error)) {
                            options.error(errorMessage, request, response);
                        }
                    }
                });
            },
            error  : function (errorMessage, request, response) {
                if (_.isFunction(options.error)) {
                    options.error(errorMessage, request, response);
                }
            }
        });
        _.extend(this, {
            rootObject : null,
            getOpClassStore : function () {
                return _opClassStore;
            },
            getOpObjectStore : function () {
                return _opObjectStore;
            },
            getSessionId : function () {
                return _sessionId;
            }
        });
    };
})();