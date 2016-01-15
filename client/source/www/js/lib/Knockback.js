var Knockback = {};    
Knockback.Model = function (attributes, options) {
	this.childCollections = {};
    this.childModels = {};
    this.childViewModels = {};
    this.parent = {};
    Backbone.Model.call(this, attributes, options);
    this.viewModel = ko.mapping.fromJS(this.attributes);
    var that = this;
    _.each(this.defaultChildModels, function (ChildModel, childModelName) {
       var childModel = _.isString(ChildModel) ? new this[ChildModel]() : new ChildModel();
       childModel.parent = that;
       that.childModels[childModelName] = childModel;
       that.viewModel[childModelName] = childModel.viewModel;
    });
    _.each(this.defaultChildCollections, function (ChildCollection, childCollectionName) {
    	var childCollection = _.isString(ChildCollection) ? new this[ChildCollection]() : new ChildCollection();
        childCollection.parent = that;
        that.childCollections[childCollectionName] = childCollection;
        that.viewModel[childCollectionName] = childCollection.viewModelArray;
     });
};

_.extend(Knockback.Model.prototype, Backbone.Model.prototype, {
    childCollections : {},
    childModels : {},
    childViewModels : {},
    parent : null,
    viewModel : {},
    
    set : function(attrs, options) {
        var that = this;
        _.each(attrs, function (v, k) {
            if(that.viewModel[k]){
                that.viewModel[k](v);
            }
        });
        return Backbone.Model.prototype.set.apply(this, arguments);
    },
    
    get: function (attr) {
        var childModel = this.childModels[attr];
        if(childModel){
            return childModel;
        }
        
        var childCollection = this.childCollections[attr];
        if(childCollection){
            return childCollection;
        }
        return this.attributes[attr];
    },
    toBackbone : function () {
        var attributes = ko.mapping.toJS(this.viewModel);
        this.set(attributes);
        return this.attributes;
    }
});
  
Knockback.Collection = function (models, options) {
    this.parent = {};
    this.viewModelArray = ko.observableArray([]);
    Backbone.Collection.call(this, models, options);
};
    
_.extend(Knockback.Collection.prototype, Backbone.Collection.prototype, {
    parent : null,
    viewModelArray : null,
    _add : function(model, options) {
        model = Backbone.Collection.prototype._add.call(this, model, options);
        model.parent = this;
        this.viewModelArray.push(model.viewModel);
        return model;
    },
    _remove : function(model, options) {
        model = Backbone.Collection.prototype._remove.call(this, model, options);
        this.viewModelArray.splice(this.indexOf(model), 1);
        return model;
    }
});

(function(){
	var _onNextRoute = null;
	Knockback.Router = Backbone.Router.extend({
	    actions : {},
	    before : function (options, proceed) {
	        proceed();
	    },
	    
	    route : function(route, name, callback, options) {
	        Backbone.history || (Backbone.history = new Backbone.History);
	        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
	        var that = this;
	        Backbone.history.route(route, _.bind(function(fragment) {
	        	if(_.isFunction(_onNextRoute)){
	        		_onNextRoute();
                	_onNextRoute = null;
	           	}
	            var proceed = function () {
	                var args = that._extractParameters(route, fragment);
	                var onNextRoute = callback.apply(that, args);
	                that.trigger.apply(that, ['route:' + name].concat(args));
	                if(_.isFunction(onNextRoute)){
	                	_onNextRoute = onNextRoute;
	                }
	            }
	            if(_.isFunction(that.before)){
	                that.before(options, proceed, fragment);
	            } else {
	                proceed();
	            }
	        }, this));
	      },
	
	      _bindRoutes : function() {
	        if (!this.routes) return;
	        for (var route in this.routes) {
	          var options = this.routes[route];
	          if(options && options.as && this.routes[options.as]){
	              options = this.routes[options.as];
	          }
	          if(_.isString(options)){
	              options = { callback : options };
	          }
	          this.route(route, options.callback, this.actions[options.callback], options);
	        }
	      }
	});
})();


Knockback.Model.extend = Knockback.Collection.extend = Knockback.Router.extend = Backbone.Model.extend;