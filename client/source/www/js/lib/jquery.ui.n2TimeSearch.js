$.widget("ui.n2TimeSearch",{
	// crap fscking code
    url : "",
    options : { 
    	keypress : function (){
    		
    	}
	},
    _create : function () {
        var that = this;
        var date;
        this.element.keyup(
            function (e) {
                var input = that.element;
                if (input.val().length > 0) {
                    date = Date.parse(input.val());
                    
                    if (date !== null && date.compareTo(Date.now()) <= 0) {
                        that.element.css({
                            color: "green"
                        });
                        
                        input.keypress(function(event) {
                            if (event.which == 13) {
                                input.unbind("keypress");
                                that.element.val("");
                                that.options.keypress(date);
                            }
                        });
                    } else {
                        that.element.css({
                            color: "red"
                        });
                        input.unbind("keypress");
                    }
                } else if(input.val() === "") {
                    date = Date.now();
                    that.element.css({
                        color: "green"
                    });
                } else {
                    that.element.css({
                        color: "red"
                    });
                    input.keypress(function(event) {
                        if (event.which == 13) {
                            input.unbind("keypress");
                            that.element.val("");
                            that.options.keypress(date);
                        }
                    });
                }
            }
        );
    },
    setTargetUrl : function (url) {
        this.url = url;
    }
});