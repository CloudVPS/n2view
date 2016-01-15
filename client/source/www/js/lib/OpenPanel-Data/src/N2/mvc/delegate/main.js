N2.mvc.delegate.main = {
    grid: undefined,
    preset : "all",
    activate : function (element) {
        console.log("activate grid");
        
    },
    
    onInitialRender : function (element) {
        
    },
    
    deActivate : function (element) {
        console.log("deActivate grid");
    },
    
    onFinish : function(element){
        /*
        $("#hostFilters input", element).removeAttr("checked");
        $("#hostFilters input", element).each(function(index, element){
           var input = $(element);
           if(input.attr("data-href")){
               input.click(function(){
                  document.location.href=input.attr("data-href"); 
               });
           }
        });
        $("#tab-preset-"+this.preset, element).attr({ checked: "checked"});
        $("#hostFilters", element).buttonset();
        */
    }
};
    