N2.mvc.delegate.menu = {
    onFinish : function(element){
        $("#logout", element).button({
            icons: {
                primary: 'ui-icon-power'
            }
        }).click(function () {
            document.location.href = "#logout";
        });
        $("#logo", element).button();
        
    }
};
    