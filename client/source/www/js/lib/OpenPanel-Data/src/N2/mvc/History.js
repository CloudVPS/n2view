N2.mvc.History = _.extend(Backbone.History);
_.extend(N2.mvc.History.prototype, {
    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl : function() {
        console.log("loadUrl");
        var fragment = this.fragment = this.getFragment();
        var matched = _.any(this.handlers, function(handler) {
            if (handler.route.test(fragment)) {
                handler.callback(fragment);
                return true;
            }
      });
      return matched;
    }
});