if (typeof OP === "undefined") {
    /** 
     * Holds OpenPanel functionality
     * @namespace 
     * @version 0.1.0
     * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a> 
     */
    var OP = {};
}

if (typeof exports !== 'undefined') {
    exports.OP = OP;
} else {
    this.OP = OP;
}

/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds orm etc.
 */
OP.data = {
    
        initialize : function () {
        Backbone.sync = function (method, model, success, error){
           // console.log(method, model, success, error);
            switch (method) {
                case "create":         model.store.create(model, success, error); break;
                case "read":           model.id ? model.store.find(model, success, error) : model.store.findAll(model, success, error); break;
                case "update":         model.store.update(model, success, error); break;
                case "delete":         model.store.destroy(model); break;
            }
        };
        
        OP.data.classes.collection.OPClass.model = OP.data.classes.model.OPClass;
        OP.data.classes.collection.OPObject.model = OP.data.classes.model.OPObject;
    },
    
    contexts : []
};
/**
 * @namespace
 */
OP.data.classes = {
        
};
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
                        if (options.success) {
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
                        if (options.error) {
                            options.error(errorMessage, request, response);
                        }
                    }
                });
            },
            error  : function (errorMessage, request, response) {
                console.log(errorMessage, request, response);
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
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds collections related to OpenPanel backend classes and objects.
 */
OP.data.classes.collection = {
        
};
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.collection.OPClass = Backbone.Collection.extend({
    initialize : function () {
       
    },
    model: null,
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    },
    setContext : function (context) {
        this.context = context;
        this.setStore(this.context.getOpClassStore());
    },
    getContext : function () {
        return this.context;
    }
});
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.collection.OPObject = Backbone.Collection.extend({
    initialize : function (models, options) {
        if(typeof options.opClass !== "object") {
            throw new Error("class missing"); 
        }
            
        this.opClass = options.opClass;
        
        if (options.parentId != undefined && options.parentId != "" && options.parentId != null ) {
            this.parentId = options.parentId;
        }
    },
    model: null,
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    },
    setContext : function (context) {
        this.context = context;
        this.setStore(this.context.getOpObjectStore());
    },
    getContext : function () {
        return this.context;
    },
    opClass : null,
    parentId : null
});
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds models related to OpenPanel backend classes and objects.
 */
OP.data.classes.model = {
        
};
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.model.OPClass = Backbone.Model.extend({
    initialize : function () {
       
    },
    
    context : null,
    
    setContext : function (context) {
        this.context = context;
        this.setStore(context.getOpClassStore());
    },
    
    getContext : function () {
        return this.context;
    },
    
    /**
     * @returns {boolean}
     */
    isNew : function () {
        return !this.get("uuid");
    },
    
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    },
        
    defaults : {
         canCreate: false,
         canDelete: false,
         canGetInfo: false,
         canUpdate: false,
         childCount: 0,
         description: "",
         indexing: "",
         isRootObject: false,
         meta: false,
         metaValue: "",
         name: "",
         parent: null,
         singleton: false,
         singletonValue: "",
         title: "",
         uuid: null,
         parentId : null
     },
     
     /**
      * 
      * @param parentId
      * @returns {OP.data.classes.collection.OPObject}
      */
     getOPObjectCollection : function (parentId) {
         var opObjectCollection = new OP.data.classes.collection.OPObject([], { opClass : this, parentId : parentId != undefined ? parentId : null });
         opObjectCollection.setContext(this.context);
         return opObjectCollection;
     },
     
     /**
      * 
      * @param options
      * @returns {OP.data.classes.model.OPObject}
      */
     getOPObject : function (options){
         var opObject = new OP.data.classes.model.OPObject(options);
         opObject.setContext(this.context);
         opObject.opClass = this;
         return opObject;
     },
     
     /**
      * @function
      * @param uuid
      * @returns {OP.data.classes.model.OPObject}
      */
     getOPObjectByUUID : function (uuid) {
         return this.getOPObject({ id : uuid });
     },
     
     /**
      * @param metaId
      * @returns {OP.data.classes.model.OPObject}
      */
     getOPObjectByMetaId : function (metaId) {
         return this.getOPObject({ id : metaId });
     }
 });
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
OP.data.classes.model.OPObject = Backbone.Model.extend({
    initialize : function () {
        var that = this;
        this.bind("change", function () { that.differsFromOriginal = true; });
    },
    
    context : null,
    
    setContext : function (context) {
        this.context = context;
        this.setStore(context.getOpObjectStore());
    },
    
    getContext : function () {
        return this.context;
    },
    
    differsFromOriginal : false,
    isNew : function () {
        return !this.get("uuid");
    },
    
    childOPObjectCollections : null,
    
    store : null,
    setStore : function (store){
        this.store = store;
    },
    getStore : function () {
        return this.store;
    },
        
    defaults : {
        "class": "",
        id: "",
        metaid: "",
        uuid: null
    },
     
    opClass : null,
     
    validate : function (attributes){  
        _.each(attributes, function (value, key) {
            
        });
    },
    
    getChildObjectCollections : function () { 
        var that = this;
        if(this.childOPObjectCollections == null) {
            this.childOPObjectCollections = {};
            var that = this;
            this.opClass.children.each(function(childClass) {
                if(childClass.get("metaBase") != ""){
                    var c = childClass.collection.get(childClass.get("metaBase"));
                    if (c == undefined) {
                        throw new Error("Class missing: ", childClass.get("metaBase"));
                    }
                    targetChildClass = c;
                } else {
                    targetChildClass = childClass;
                }
                
                var childOPObjectCollection = new OP.data.classes.collection.OPObject([], { opClass : targetChildClass, parentId : that.get("uuid")!=="ROOT"?that.get("uuid"):null });
                childOPObjectCollection.setContext(that.context);
                that.childOPObjectCollections[targetChildClass.id] = childOPObjectCollection;
            });
        }
        return this.childOPObjectCollections;
    },
    
    
    getChildObjectCollection : function (className) {
        if(this.childOPObjectCollections == null) {
            this.getChildObjectCollections();
        }
        var childCollection = this.childOPObjectCollections[className];
        return childObjectCollection;
    },
    
    getChildClasses : function () {
        return this.opClass.children;
    }
 });
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds stores related to OpenPanel backend classes and objects.
 */
OP.data.classes.store = {
        
};
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @class
 */
(function(){
    
    OP.data.classes.store.OPClass = function () {
        this.data = {};
        this.hasFetched = false;
    
        _.extend(this, {
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
                    sessionId : collection.getContext().getSessionId(),
                    success : function (world, response){ 
                        that.hasFetched = true;
                        var root = new OP.data.classes.model.OPClass({
                            id: "ROOT",
                            name : "ROOT",
                            uuid : "ROOT"
                        });
                        root.children = new OP.data.classes.collection.OPClass();
                        root.setContext(collection.getContext());
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
                                metaBase : value["class"].metabase,
                                indexing : value["class"].indexing
                            });
                            o.setContext(collection.getContext());
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
    };
})();
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


/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds MVC related objects
 */
OP.mvc = {};
/**
 * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
 * @namespace
 * @description Holds command objects
 */
OP.mvc.commands = {};

OP.mvc.commands.Command;
(function(){
        var _registeredCommands = {};
        var _processDelegate = function (delegate) {
            var command = null;
            if(!_.isUndefined(delegate)) {
                if(_.isFunction(delegate.execute)){
                    command = delegate;
                } else if(_.isFunction(delegate)){
                    command = {
                        execute : function (inject) {
                            delegate(inject);
                        }
                    }
                } else if (_.isString(delegate)) {
                    command = {
                        execute : function (inject) {
                            var c = _registeredCommands[delegate];
                            if(!_.isUndefined(c)) {
                                c.execute(inject);
                            }
                        }
                    }
                }
            }
            return command;
        }
        /*
         * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
         * @class
         * @description foo foo
         */
        OP.mvc.commands.Command = function (options) {
            _.extend(this, {
                id : null,
                nextCommand: null,
                successCommand : null,
                errorCommand : null,
                isSuccessful : true,
                errorObject : null,
                setIsSuccessful : function (isSuccessful) {
                    if(_.isBoolean(isSuccessful)){
                        this.isSuccessful = isSuccessful;
                    }
                },
                fail : function (errorObject) {
                    if(!_.isUndefined(errorObject) && !_.isNull(errorObject)){
                        this.errorObject = errorObject;
                    }
                    this.setIsSuccessful(false);
                },
                data : {},
                execute : function () {
                    if(!_.isNull(this.nextCommand)){
                        this.nextCommand.execute();
                    }
                    if(this.isSuccessful === true){
                        if(!_.isNull(this.successCommand)){
                            this.successCommand.execute();
                        }
                    } else {
                        if(!_.isNull(this.errorCommand)){
                            this.errorCommand.execute(this.errorObject);
                        }
                    }
                },
                options : {},
                applyWrappers : function (target) {
                    var that = this;
                    if(this.execute !== target.execute) {
                        target.execute = _.wrap(target.execute, function (f) {
                            (_.bind(f, target))(); 
                            (_.bind(that.execute, target))();
                        });
                    }
                    _registeredCommands[target.id] = target;
                },
                extend : function (target, extensions) {
                    _.extend(target, this);
                    _.extend(target, extensions);
                    this.applyWrappers(target);
                }
            });
            this.id = _.keys(_registeredCommands).length + 1;
            
            if(!_.isUndefined(options) && !_.isNull(options)) {
                this.options = options;
                if(!_.isUndefined(options.id) && _.isString(options.id) && _registeredCommands[options.id] == undefined) this.id = options.id
                
                this.nextCommand = _processDelegate(options.next);   
                this.successCommand = _processDelegate(options.success);   
                this.errorCommand = _processDelegate(options.error);
                
                if(!_.isUndefined(options.data)) this.data = options.data;
            }
            
            _registeredCommands[this.id] = this;
        }
})();
(function(){
    /**
     * The function that handles the request
     * @function
     * @private
     */
    var _requestHandler = null;
    var _isRunningOnClient = true;
    var _jsvEnvironment = null;
    var _url = "/dynamic/fake-opencore-proxy/json";
    var _findObjectPath = function (subject, path, messages) {
        if (messages === undefined) {
            messages = {};
        }
        var i = 0, a = subject, r = path.split(".");
        
        while (a[r[i]]) {
            a = a[r[i++]];
        }

        if (i < r.length) {
            messages.error = "Can't find: " + r.splice(0, i + 1).join(".");
        } else {
            return a;
        }
    };
    
    /** 
     * Validates response 
     * @param {Object} jsonData A chunk of response data
     * @param {Object} jsonSchema A chunk of validation schema
     * @param {String} requestString A string containing the request in json format
     */
    var _validateResponse = function (jsonData, jsonSchema, requestString) {
        if (_jsvEnvironment === null) {
            _jsvEnvironment = JSV.createEnvironment();
        }
        var report = _jsvEnvironment.validate(jsonData, jsonSchema);
        var errorMessage;
        var errorMessages;
        
        if (report.errors.length !== 0) {
            errorMessages = [];
            for (var i = 0;i < report.errors.length;i++) {
                errorMessages.push("[" + i + "] " + report.errors[i].message + " (" + report.errors[i].schemaUri + ")");
            }
            if (requestString !== null) {
                errorMessage = "Response from request " + requestString + " has issues:\n\t%s" + errorMessages.join(",\n\t");
            } else {
                errorMessage = errorMessages.join(",\n");
            }
        }
        
        return errorMessage;
    };
    /**
     * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
     * @namespace
     * @description Holds functionality related to remote procedure calls to openpanel-core.
     */
    
    OP.rpc = {
        /** Wether this is running in a client environment such as a browser or in a server environment.
         * @param {Boolean} isRunningOnClient
         */
        setIsRunningOnClient : function (isRunningOnClient) {
            _isRunningOnClient = isRunningOnClient;
        },
        
        /**
         * @description Creates an client side 'Ajax' request and calls successCallback on success and
         * errorCallBack on error.
         * @param {String} url
         * @param {String} requestString
         * @param {String} httpMethod
         * @param {Function} successCallback
         * @param {Function} errorCallback
         */
        clientRequestHandler : function (url, requestString, httpMethod, successCallback, errorCallback) {
            var xmlHttp = false;
            try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e1) {
                try {
                    xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (anotherError) {
                    xmlHttp = false;
                }
            }
            
            if (!xmlHttp && typeof XMLHttpRequest !== "undefined") {
                try {
                    xmlHttp = new XMLHttpRequest();
                } catch (e2) {
                    xmlHttp = false;
                }
            }
            if (!xmlHttp && window.createRequest) {
                try {
                    xmlHttp = window.createRequest();
                } catch (e3) {
                    xmlHttp = false;
                }
            }
    
            xmlHttp.open(httpMethod, url, true);
            
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200 || xmlHttp.status === 0) {
                        successCallback(JSON.parse(xmlHttp.responseText));
                    } else {
                        errorCallback(xmlHttp);
                    }
                }
            };
            xmlHttp.send(requestString);
        },
        
        /**
         * @description Creates an client side 'Ajax' request and calls successCallback on success and
         * errorCallBack on error.
         * @param {String} url
         * @param {String} requestString
         * @param {String} httpMethod
         * @param {Function} successCallback
         * @param {Function} errorCallback
         */
        serverRequestHandler : function (url, requestString, httpMethod, successCallback, errorCallback) {
            if(!(url === '' || (url && url.charCodeAt && url.substr))){
                throw new Error("'url'");
            }
            if(!(requestString === '' || (requestString && requestString.charCodeAt && requestString.substr))){
                throw new Error("'requestString' is not a String.");
            }
            if(!(httpMethod === '' || (httpMethod && httpMethod.charCodeAt && httpMethod.substr))){
                throw new Error("'httpMethod' is not a String.");
            }
            
            if (successCallback !== undefined && !(successCallback && successCallback.constructor && successCallback.call && successCallback.apply)) {
                throw new Error("'successCallback' is not a Function.");
            }
            
            if (errorCallback !== undefined && !(errorCallback && errorCallback.constructor && errorCallback.call && errorCallback.apply)) {
                throw new Error("'errorCallback' is not a Function.");
            }
            
            var http = require('http');
            var crypto = require('crypto');
            var parsedUrl = require('url').parse(url);
            console.log(url, requestString);
            var remote_client = http.createClient(parsedUrl.port ? parsedUrl.port : 80, parsedUrl.hostname, parsedUrl.protocol === "https:"?true:false, crypto.createCredentials({}));
            var request = remote_client.request("POST", parsedUrl.pathname, {"host": parsedUrl.hostname, "user-agent": "node.js"});
            var body = "";
            request.addListener('response', function (response) {
                response.setEncoding('binary'); 
    
                response.addListener('data', function (chunk) {
                    console.log(chunk);
                    body += chunk;
                });
    
                response.addListener('end', function () {
                    if (response.statusCode === 200) {
                        successCallback(JSON.parse(body));
                    } else {
                        errorCallback(body);
                    }
                });
            });
            request.write(requestString);
            request.end();
            console.log("requestString", requestString);
        },
        
        /**
         * Sets URL to OpenPanel web server json address.
         * This url may be relative or absolute.
         * @param {String} url 
         */
        setUrl : function (url) {
            if(!(url === '' || (url && url.charCodeAt && url.substr))){
                throw new Error("Url " + url + " is not a valid url.");
            }
            
            _url = url;
        },
        /**
         * Returns the current URL to OpenPanel webserver json connector
         * @returns {String}
         */
        getUrl : function () {
            return _url;
        },
        
        /**
         * Sets a request handling function
         * @param {Function} handler
         */
        setRequestHandler : function (requestHandler) {
            if (!(requestHandler && requestHandler.constructor && requestHandler.call && requestHandler.apply)) {
                throw new Error("Expected 'requestHandler' argument is not a function.");
            }
            _requestHandler = requestHandler;
        },
        
        /** 
         * Gets the current request handling function
         * @returns {Function}
         */
        getRequestHandler : function () {
            return _requestHandler;
        },
        
        /**
         * 
         * @param {Object} options.request The request payload
         * @param {String} options.returnObjectPath The object path that needs to be returned
         * @param {Function} options.success The function that is called after a successful request
         * @param {Function} options.error The function that is called when an error occurs
         * @param {Object} options.schema Validation schema for validation the json result of the request
         */
        asynchronousRequest : function (options) {
            if (options === null || typeof(options) != "object") {
               throw new Error("Expected 'options' argument is not an object"); 
            }
            
            if (options.request === null || typeof(options.request) != "object") {
                throw new Error("'options.request' is not an object"); 
            }
            
            if (_requestHandler === null) {
                this.setRequestHandler(_isRunningOnClient === true 
                        ? this.clientRequestHandler : this.serverRequestHandler);
            }
            
            if (options !== null && options.request !== undefined) {
                var request = options.request;
                var returnObjectPath = options.returnObjectPath;
                var success = options.success;
                var error = options.error;
                var schema = options.schema;
                var requestString = JSON.stringify(request);
                var successCallback = function (data) {
                    if (!!(success && success.constructor && success.call && success.apply) || !!(error && error.constructor && error.call && error.apply)) {
                        var errorMessage;
                        var successData;
                        var serverErrorId = _findObjectPath(data, "header.errorid");
                        if (serverErrorId !== undefined) {
                            errorMessage = _findObjectPath(data, "header.error");
                            if (errorMessage === undefined) {
                                errorMessage = "(?) Undefined error";
                            }    
                        } else {
                            if (options.schema !== undefined) {
                                errorMessage = _validateResponse(data, schema, requestString);
                            }
                            if (errorMessage === undefined) {
                                if (!!(returnObjectPath === '' || (returnObjectPath && returnObjectPath.charCodeAt && returnObjectPath.substr))) {
                                    var messages = {};
                                    var resultValue = _findObjectPath(data, returnObjectPath, messages);
                                    if (resultValue !== null && resultValue !== undefined) {
                                        successData = resultValue;
                                    } else {
                                        errorMessage = messages.error;
                                    }
                                } else {
                                    successData = data;
                                }
                            }
                        }
                        if (errorMessage === undefined) {
                            if (!!(success && success.constructor && success.call && success.apply)) {
                                if (!!(returnObjectPath === '' || (returnObjectPath && returnObjectPath.charCodeAt && returnObjectPath.substr))) {
                                    success(resultValue, data);
                                } else {
                                    success(data);
                                }
                            }
                        } else {
                            if (!!(error && error.constructor && error.call && error.apply)) {
                                error(errorMessage, request, data); 
                            }
                        }
                    }
                };
                var errorCallback = function (data) {
                    if (data.status !== 200) {
                        error("HTTP error: " + data.status + " " + data.statusText);
                    }
                };
                _requestHandler(_url, requestString, "POST", successCallback, errorCallback);
            }
        }
    };
})();

(function(){
    var headerValidationSchema = {
        properties : {
            error : {
                type : "string",
                required : true
            },
            errorid : {
                type : "integer",
                required : true
            },
            session_id : {
                type : "string",
                required : true
            }
        }    
    };
    /** @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
     * @namespace Holds RPC utilities
     */
    OP.rpc.requests = {
        /**
         * @description Requests a session id for given username and password. 
         * Calls success if all went well, calls error on http errors, invalid
         * input, invalid output schema and all OpenPanel-Core errors.
         * Throws Errors at missing username and/or missing
         * password.
         * @param {Object} options Information about the request
         * @param {String} options.username The name of the user
         * @param {String} options.password The password of the user
         * @example
         * this.bind({
         *    username      : "openpanel-admin",
         *    password      : "foobar",
         *    success       : function (response, response) { },
         *    error         : function (errorMessage, request, response) { }
         * });
         * // username and password are required
         * // 
         */
        bind : function (options) {
            var username = /**String*/ options.username;
            var password = options.password;
            var success = options.success;
            var error = options.error;
    
            if (username === undefined) {
                throw new Error("username missing");
            }
            if (password === undefined) {
                throw new Error("password missing");
            }
            
            var request = {
                header : {
                    command : "bind"
                },
                body : {
                    data : {
                        id : password
                    },
                    classid : "User",
                    id : username
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "header.session_id"
                }
            );
        },
        /**
         * @param options
         */
        getWorld : function (options) {
            var sessionId = options.sessionId;
            var success = options.success;
            var error = options.error;
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            
            var request = {
                header : {
                    command : "getworld",
                    session_id : sessionId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        properties : {
                            data : {
                                properties : {
                                    body : {
                                        properties : {
                                            modules : { },
                                            classes : { }
                                        }    
                                    }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data.body"
                }
            );
        },
        /**
         * 
         * @param options
         */
        getRecords : function (options) {
            var sessionId = options.sessionId;
            var classId = options.classId;
            var parentId = options.parentId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (classId === undefined) {
                throw new Error("classId missing");
            }
            
            var request = {
                header : {
                    command : "getrecords",
                    session_id : sessionId
                },
                body : {
                    classid : classId,
                    parentid : parentId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        required : true,
                        properties : {
                            data : {
                                required : true,
                                type : "object",
                                properties : {
                                    info : { }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : function(what){
                        if(what[classId] != undefined && what[classId]!=""){
                            success(what[classId]);
                        } else {
                            success({});
                        }
                    },
                    error : error,
                    returnObjectPath : "body.data"
                }
            );
        },
        /**
         * 
         * @param options
         */
        getRecord : function (options) {
            var sessionId = options.sessionId;
            var classId = options.classId;
            var objectId = options.objectId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (objectId === undefined) {
                throw new Error("objectId missing");
            }
            
            var request = {
                header : {
                    command : "getrecord",
                    session_id : sessionId
                },
                body : {
                    classId : classId !== null?classId:"",
                    objectid : objectId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        required : true,
                        properties : {
                            data : {
                                required : true,
                                type : "object",
                                properties : {
                                    info : { }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data.object" + (classId !== undefined?"." + classId:"")
                }
            );
        },
        /**
         * 
         * @param options
         */
        create : function (options) {
            var sessionId = options.sessionId;
            var classId = options.classId;
            var parentId = options.parentId;
            var objectId = options.objectId;
            var data = options.data;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            
            var request = {
                header : {
                    command : "create",
                    session_id : sessionId
                },
                body : {
                    classid : classId,
                    parentid : parentId !== null?parentId:"",
                    objectid : objectId !== null?objectId:"",
                    data : data
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        required : true,
                        properties : {
                            data : {
                                required : true,
                                type : "object",
                                properties : {
                                    info : { }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data.objid"
                }
            );
        },
        /**
         * 
         * @param options
         */
        update : function (options) {
            var sessionId = options.sessionId;
            var objectId = options.objectId;
            var classId = options.classId;
            var data = options.data;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (classId === undefined) {
                throw new Error("classId missing");
            }
            
            var request = {
                header : {
                    command : "update",
                    session_id : sessionId
                },
                body : {
                    classid : classId,
                    objectid : objectId !== null?objectId:"",
                    data : data
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error
                }
            );
        },
        /**
         * 
         * @param options
         */
        deleteRecord : function (options) {
            var sessionId = options.sessionId;
            var parentId = options.parentId;
            var objectId = options.objectId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (objectId === undefined) {
                throw new Error("objectId missing");
            }
            
            var request = {
                header : {
                    command : "delete",
                    session_id : sessionId
                },
                body : {
                    objectid : objectId,
                    parentid : parentId !== null ? parentId : ""
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error
                }
            );
        },
        /**
         * 
         * @param options
         */
        ping : function (options) {
            var sessionId = options.sessionId;
            var success = options.success;
            var error = options.error;
            
            if (sessionId === null) {
                throw new Error("sessionId missing");
            }
            
            var request = {
                header : {
                    command : "ping",
                    session_id : sessionId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error
                }
            );
        },
        /**
         * 
         * @param options
         */
        getClassInfo : function (options) {
            var sessionId = options.sessionId;
            var success = options.success;
            var error = options.error;
            var classId = options.classId;
            
            if (sessionId === undefined) {
                throw new Error("sessionId missing");
            }
            if (classId === undefined) {
                throw new Error("classId missing");
            }
            
            var request = {
                header : {
                    command : "classinfo",
                    session_id : sessionId
                },
                body : {
                    classid : classId
                }
            };
            
            var responseValidationSchema = {
                properties : {
                    header : headerValidationSchema,
                    body : {
                        properties : {
                            data : {
                                properties : {
                                    capabilities : { 
                                        required : true,
                                        type : "object"
                                    },
                                    "class" : {
                                        required : true,
                                        type : "object"
                                    },
                                    info : {
                                        required : true,
                                        type : "object"
                                    },
                                    structure : {
                                        required : true,
                                        type : "object"
                                    }
                                }
                            }
                        }
                    }
                } 
            };
            
            OP.rpc.asynchronousRequest(
                {
                    request : request,
                    schema : responseValidationSchema,
                    success : success,
                    error : error,
                    returnObjectPath : "body.data"
                }
            );
        }
    };

})();
