(function($){
	var _i = 0;
	
	var _defaultOptions = {
		className : "trail",
		visit : $.fn.show,
		leave : $.fn.hide,
		nodes : { }
    };
    
    var _baseDefaults = $.extend({}, _defaultOptions);
    
    var _perNodeOptions = {};
	
	var _toShortString = function ( e ) {
		if ( e.jquery ) {
			e = e.get(0);
		}
		var i = e.outerHTML.indexOf(e.innerHTML);
		if (i !== -1 ){
			return e.outerHTML.substring(0,i) + "..." + e.outerHTML.substring(i + e.innerHTML.length, e.outerHTML.length);
		} else {
			return e.outerHTML;
		}
	};
	
	var _findOptions = function ( e ) {
		function up ( e ) {
			if ( e.attr("id") && _perNodeOptions[e.attr("id")] ) {
				return _perNodeOptions[e.attr("id")];
			} else {
				if ( e.parent().length === 1 ) {
					return up (e.parent());
				}
			}
		}
		
		var result = up ( e );
		return result?$.extend({}, _defaultOptions, result):_defaultOptions;
	};
	
	var _findOffspringTrail = function ( e, className, offspringTrail ) {
     	if ( !offspringTrail ) {
    		offspringTrail = [];
    	}
    	if( !e.jquery ){
    		e = $(e);
    	}
        var found = false;
        $.each(e.children(), function (index, child){
            if(!found){
                if($(child).hasClass(className)){
                    found = child;
                }
            }
        });
        if(!found){
            $.each(e.children(), function (index, child) {
                _findOffspringTrail($(child), className, offspringTrail);
            });
        } else {
            _findOffspringTrail(found, className, offspringTrail);
            offspringTrail.push(found);
        }
        
        return offspringTrail;
    }
	        
	var _methods = {
		configure : function ( options ) {
			if ( typeof options !== 'object' ) {
				$.error('jQuery.trail\'s configure method expects an object as argument');
				return this;
			} 
			
			if ( !this.get(0) ) {
				_defaultOptions = $.extend({}, _baseDefaults, options);
				return _defaultOptions;
			} else {
				if ( !this.attr("id") ) {
					$.error('jQuery.trail\'s configure method expects the target element to have an id, no id for element: ' + _toShortString(this));
					return this;
				}
				if ( _perNodeOptions == null ) {
					_perNodeOptions = {};
				}
				_perNodeOptions[this.attr("id")] = options;
			}
			
			return this;
		},
		
		createTrail : function( ) {
			
			if ( this.length === 0 ) {
				$.error('jQuery.trail\'s createTrail method expects an element');
			}
			
			if ( this.length > 1 || !this.attr("id") ) {
				$.error('jQuery.trail only supports unique nodes with id, no id for element: ' + _toShortString(this));
				return this;
			}
			
			var options;
			if ( _perNodeOptions === null ) {
				options = _defaultOptions;
			} else {
				options = _findOptions(this);
			}
			
			if ( !this.hasClass(options.className) ) {
				$.error('jQuery.trail expects element to have class \'' + options.className + '\' as trailing class: ' + _toShortString(this));
			}
			
			var trail = this.parentsUntil($("html"), "." + options.className);
	        trail.push(this.get(0));
	        _findOffspringTrail(this, options.className, trail);
	        
	        var trail = $(trail);
	        
	        var hashedTrail = {};
	        trail.each(function (index, e) {
	        	e = $(e);
	        	if ( !e.attr("id") ) {
	        		$.error('jQuery.trail only supports unique nodes with an id, no id for element: ' + _toShortString(e));
	        		return this;
	        	}
	        	hashedTrail[e.attr("id")] = e;
	        });
	       	
	       	$("." + options.className).each(function (index, e) {
	       		e = $(e);
	        	if ( !e.attr("id") ) {
	        		$.error('jQuery.trail only supports unique nodes with an id, no id for element: ' + _toShortString(e));
	        		return this;
	        	}
	        	
	        	var trailState = e.data("trailState");
	        	if ( !hashedTrail[e.attr("id")] ){
	        		
	        	
	        		if ( trailState === undefined || trailState === true) {
	        			var leave = options.leave;
	        				
	        			var nodeOptions = options.nodes[e.attr("id")];
	        			if ( nodeOptions ) {
		        			if ( nodeOptions && nodeOptions.beforeLeave && $.isFunction(nodeOptions.beforeLeave) ) {
		        				nodeOptions.beforeLeave.apply(e);
		        			}
	        				
		        			if ( nodeOptions && nodeOptions.leave && $.isFunction(nodeOptions.leave) ) {
		        				leave = nodeOptions.leave;
		        			}
	        			}
	        			
	        			leave.apply(e);
	        			
	        			e.data("trailState", false);
	        		}
	        	}
	       	});
	       	
	       	$("." + options.className).each(function (index, e) {
	       		e = $(e);
	        	if ( !e.attr("id") ) {
	        		$.error('jQuery.trail only supports unique nodes with an id, no id for element: ' + _toShortString(e));
	        		return this;
	        	}
	        	var trailState = e.data("trailState");
	        	if ( hashedTrail[e.attr("id")] ) {
	        		if ( trailState === undefined || trailState === false) {
	        			var visit = options.visit;
	        			
	        			var nodeOptions = options.nodes[e.attr("id")];
	        			if ( nodeOptions ) {
	        				if ( !e.data("wasVisited") ) {
		        				if ( nodeOptions.beforeFirstVisit && $.isFunction(nodeOptions.beforeFirstVisit) ) {
			        				nodeOptions.beforeFirstVisit.apply(e);
			        			}
			        			
			        			if ( nodeOptions.firstVisit && $.isFunction(nodeOptions.firstVisit) ) {
			        				nodeOptions.firstVisit.apply(e);
			        			}
							}
		        			
		        			if ( nodeOptions.beforeVisit && $.isFunction(nodeOptions.beforeVisit) ) {
		        				nodeOptions.beforeVisit.apply(e);
		        			}
		        			
		        			if ( nodeOptions.visit && $.isFunction(nodeOptions.visit) ) {
		        				visit = nodeOptions.visit;
		        			}
	        			}
	        				
	        			visit.apply(e);
	        			
	        			if ( nodeOptions ) {
	        				if ( nodeOptions.afterVisit && $.isFunction(nodeOptions.afterVisit) ) {
		        				nodeOptions.afterVisit.apply(e);
		        			}
	        			}
	        			
	        			e.data("wasVisited", true);
	        			e.data("trailState", true);
	        		}
	        	}
	        });	
	        
	        return this;
		}
	};
  
  $.fn.trail = function ( method ){
    	if ( _methods[method] ) {
    		return _methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    	} else if ( typeof method === 'object' || ! method ) {
    		return _methods.createTrail.apply( this, arguments );
    	} else {
    		$.error( 'Method ' +  method + ' does not exist on jQuery.trail' );
    	}
    }
}
)(jQuery);