
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
                    };
                } else if (_.isString(delegate)) {
                    command = {
                        execute : function (inject) {
                            var c = _registeredCommands[delegate];
                            if(!_.isUndefined(c)) {
                                c.execute(inject);
                            }
                        }
                    };
                }
            }
            return command;
        };
        /*
         * @author <a href="mailto:jp@openpanel.com">JP Wesselink</a>
         * @class
         * @description foo foo
         */
        OP.mvc.commands.Command = function (options) {
            _.extend(this, this);
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