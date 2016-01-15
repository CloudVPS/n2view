N2.mvc.delegate.logout = {
    activate : function (element, isActivatedForFirstTime) {
        console.log("activate login");
        this.c++;
        $("#username").val("pietje" + this.c);
        
        $('#loggedOut').dialog({
            title: "N2 Logout",
            draggable: false,
            autoOpen: true,
            width: 252,
            height: 260,
            modal: true,
            //closeOnEscape: false,
            resizable: false,
            show: 'fade',
            buttons : [
               {
                   text: "Login again",
                   click : function (){ window.location.href=""; }
               }
           ]
        });
        $(".ui-dialog-titlebar-close").hide();
    },
    
    deActivate : function (element) {
        $('#loggedOut').dialog('destroy');
    }
};