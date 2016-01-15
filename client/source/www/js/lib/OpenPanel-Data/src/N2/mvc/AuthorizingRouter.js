N2.mvc.AuthorizingRouter = Backbone.Router.extend({
    before : function (options, proceed) {
        proceed();
    },
    
    route : function(route, name, callback, options) {
        Backbone.history || (Backbone.history = new Backbone.History);
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        var that = this;
        Backbone.history.route(route, _.bind(function(fragment) {
            var proceed = function () {
                var args = that._extractParameters(route, fragment);
                callback.apply(that, args);
                that.trigger.apply(that, ['route:' + name].concat(args));
            }
            that.before(options, proceed);
        }, this));
      },

      // Bind all defined routes to `Backbone.history`.
      _bindRoutes : function() {
        if (!this.routes) return;
        for (var route in this.routes) {
          var options = this.routes[route];
          if(_.isString(options)){
              options = { callback : options };
          }
          
          this.route(route, options.callback, this[options.callback], options);
        }
      }

});