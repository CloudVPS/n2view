OP.mvc.Command = (function () {
    
    var _isSuccessful = true;
    var _registeredCommands = {};
    
    var Command = function (options){
        _.extend(this, {
            delegates : {
                success : {
                    command : null,
                    data : {}
                },
                error : {
                    command : null,
                    data : {}
                },
                next : {
                    command : null,
                    data : {}
                }
            }
        });
        this.id = _.keys(_registeredCommands).length + 1;
        this.data = {};
        if(!_.isUndefined(options) && !_.isNull(options)) {
            this.options = options;
            if(!_.isUndefined(options.id) && _.isString(options.id) && _registeredCommands[options.id] == undefined) this.id = options.id;
            this.delegates.next = options.next;
            this.delegates.success = options.success;   
            this.delegates.error = options.error;
            if(!_.isUndefined(options.data)) this.data = options.data;
        }
        this.registerCommand(this);
        this.commandTree = null;
    };
    
    Command.extend = function (obj) {
        var C = function (options) {
            var _super = new OP.mvc.Command(options);
            _super.registerCommand(this);
            _.extend(this, _super);
            _.extend(this, obj);
            if (_.isFunction(this.initialize)) {
                this.initialize();
            }
        };
        _.extend(C.prototype, OP.mvc.Command.prototype);
        return C;
    };
    
    Command.prototype = {
        fail : function (reason) {
            this.setIsSuccessful(false);
            
        },
        setCommandTree : function (commandTree) {
            this.commandTree = commandTree;
        },
        getCommandTree : function () {
            return this.commandTree;
        },
        registerCommand : function (command) {
            _registeredCommands[command.id] = command;
        },
        setIsSuccessful : function (isSuccessful) {
            if (_.isBoolean(isSuccessful)) {
                _isSuccessful = isSuccessful;
            }
        },
        execute : function () {
            console.log("Command execute");
            this.finish();
        },
        finish : function (inject) {
            console.log("Command finish");
            if (!_.isUndefined(this.options)) {
                if(_isSuccessful === true) {
                    _.bind(_processDelegate, this)(this.options.success, inject);
                } else {
                    _.bind(_processDelegate, this)(this.options.error, inject);
                }
            }
            _isSuccessful = true;
        },
        log : function (what) {
            console.log(what);
        }
    };
    var _processDelegate = function (delegate, inject) {
        var commandClass;
        var commandObject;
        
        var data;
        if (!_.isUndefined(delegate)) {
           this.log("-- delegate is not undefined");
           if (typeof(delegate) == "object") {
               this.log("-- delegate is an object");
               if (_.isFunction(delegate.execute)) {
                   this.log("-- delegate.execute is a function");
                   // command instance
                   commandObject = delegate;
               } else if (!_.isUndefined(delegate.command)) {
                   this.log("-- delegate.command is not undefined");
                   if (_.isFunction(delegate.command)) {
                       this.log("-- delegate.command is a function");
                       // plain function or 'Class'?
                       if (!_.isUndefined(delegate.command.prototype) && _.isFunction(delegate.command.prototype.execute)) {
                           this.log("-- delegate.command is a 'class'");
                           commandClass = delegate.command;
                       } else {
                           this.log("-- delegate.command is a plain function");
                           commandClass = function (data) {
                               this.data = data;
                               this.execute = function (inject) {
                                   delegate.command(inject);
                               };
                           };
                       }
                       if (!_.isUndefined(commandClass)) {
                           if(!_.isUndefined(delegate.data) && typeof(delegate.data) == "object") {
                               data = delegate.data;
                           }
                           commandObject = new commandClass(data);
                           commandObject.setCommandTree(this.commandTree);
                       }
                   } else if (_.isString(delegate.command)) {
                       this.log("-- delegate.command is a string", delegate.command);
                       commandClass = OP.mvc.commands[delegate.command];
                       if (!_.isUndefined(commandClass)) {
                           this.log("-- OP.mvc.command." + delegate.command + " is defined", this);
                           commandObject = new commandClass(delegate);
                           commandObject.setCommandTree(this.commandTree);
                       } else {
                           this.log("-- OP.mvc.command." + delegate.command + " is not defined");
                       }
                   }
               }
           } else if (_.isString(delegate)) {
               this.log("-- delegate is a string");
               var commandObject = this.commandTree.get(delegate);
               if (!_.isUndefined(commandObject)) {
                   this.log("-- this.commandTree.get(\"" + delegate + "\") is not undefined");
               }
           } else if (_.isFunction(delegate)) {
               
           }
           if (typeof(commandObject) == "object" && !_.isUndefined(commandObject.execute) && _.isFunction(commandObject.execute)) {
               this.log("-- about to execute", commandObject);
               commandObject.execute(inject);
           }
        }
    };
    return Command;
})();