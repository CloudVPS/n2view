N2.mvc.delegate.login = {
    detachedLoginElement : null,
    c : 0,
    
    onFirstActivation : function (element) {
        this.detachedLoginElement = $("#hiddenLogin").detach();
        element.append(this.detachedLoginElement);
    },
    
    activate : function (element, isActivatedForFirstTime) {
        $('#hiddenLogin').dialog({
            title: "N2 Login",
            draggable: false,
            autoOpen: true,
            width: 334,
            modal: true,
            closeOnEscape: false,
            resizable: false,
            show: 'fade',
            buttons: { "Login": function() { $("#loginForm").submit(); return false;}}
        });
        
        $("#loginForm").bind("submit", function(){
            controller.login();
            return false;
        });
        
        $(".ui-dialog-titlebar-close").hide();
    
        var submit = function(event){ 
            if ( event.which == 13 ) {
                $("#loginForm").submit(); 
            }
        }
        $("#username").bind("keypress", submit);
        $("#password").bind("keypress", submit);
        //window.location.href='#login';
    },
    deActivate : function (element) {
        $('#hiddenLogin').dialog('destroy');
    }
};