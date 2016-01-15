$.widget("ui.n2Bar",{
   options : { },
   _create : function () {
       this.element.html("<span class=\"percent-complete-bar\"><span class=\"background\" style=\"width:" + this.options.value + "%\"></span></span>");
      	return this.element;
   },
   _destroy : function () {
   	this.element.empty();
   	return this.element;
   }
});
        