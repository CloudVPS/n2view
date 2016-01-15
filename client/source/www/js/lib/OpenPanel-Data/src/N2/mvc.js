N2.mvc = {
        view : {
            formatters : {
                uptime : function (seconds){
                    if(seconds){
                        
                        var numdays = Math.floor(seconds / 86400);
                        var numhours = Math.floor((seconds % 86400) / 3600);
                        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
                        var numseconds = ((seconds % 86400) % 3600) % 60;
    
                        return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
                    }
                },
                date : function (d, withSeconds) {
                    var secondsExtension = withSeconds === true?":ss":"";
                    if(d){
                        var date = Date.parseExact(d, "yyyy-MM-ddTHH:mm" + secondsExtension);
                        return date.toString("dddd dd MMMM yyyy HH:mm" + secondsExtension);
                    }
                },
                status : function (status) {
                    if(status){
                        
                    var formats = {
                            DEAD : "<span style=\"color: #f00\">${status}</span>"
                    };
                    if(!formats[status]){
                        return status;
                    } else {
                        var d = $("<div></div>");
                        d.append($.tmpl(formats[status], {status : status}));
                        return d.html();
                    }
                    }
                }
            }
        }
};