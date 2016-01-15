
Date.parseDate = function (date, withSeconds) {
	if(withSeconds){
		var parts = date.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/);
		return new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]);
		
	} else {
		var parts = date.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})/);
		return new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5]);
	}
	
};

var viewModel = {
    host : ko.observable(new Host().viewModel),
    user : ko.observable(new User().viewModel),
    callback : ko.observable(""),
    hostView : ko.observable(""),
    redirect: ko.observable(""),
    interval: ko.observable(""),
    gridView : ko.observable(""),
    hostsWarningTotal : ko.observable(""),
    hostsTotal : ko.observable(""),
    groups : ko.observableArray([]),
    isRepeating : ko.observable(false),
    hostSearch : ko.observable(""),
    hostLimit : ko.observable(0),
    fragment : ko.observable(""),
    hostUrlWrap : function (value) {
        if(this.host().hostID()==0){
            return "#";
        } else {
            return this.hostUrl() + "/" + value + (this.host().startDate()?"/date/" + this.host().startDate() : "");
        }
    },
    hostDate : function  () {
    	if (this.host() && this.host().startDate() !== null && this.host().startDate() !== ""){
    		return Date.parseDate(this.host().startDate());
    	}
    	
		return new Date();
    },
    formatDate : function (d) {
        if(d){
            return d.toString('yyyy-MM-ddTHH:mm');
        }
    },
    newDate : function(f, amount){
        var d;
        try {
            if(this.host()){
                if(this.host().startDate()){
                	d = Date.parseDate(this.host().startDate());
                    
                } else {
                    if(amount>0){
                        return;
                    }
                    d = Date.now();
                }
                d[f].call(d, amount);
                if(d.compareTo(Date.now()) == 1){
                    return;
                }
                return d;
            }
        } catch (e) {
            return;
        }
    },
    magicDateUrl : function (f, amount, e) {
        var d = this.newDate(f, amount);
    	if(d){
            if($("#" + e).length){
            	$("#" + e).button('enable');
            }
            return this.hostUrl() + '/' + this.hostView() +'/date/' + this.formatDate(d) + (this.hostView()=="statistics"?"/interval/" + this.interval():"");
        } else {
            if($("#" + e).length){
                $("#" + e).button('disable');
            }
            return "";
        }
    }
};

viewModel.hostUrl = ko.dependentObservable(function(){
    if(this.host().hostID()==0){
        return "#";
    } else {
        return "#!hosts/" + this.host().hostID();
    }
}, viewModel);

viewModel.hostView.subscribe(function(hostView){
	$("#hostMenu label").removeClass("ui-state-active");
    $("label[for='" + hostView + "Button']").addClass("ui-state-active");
});

viewModel.interval.subscribe(function(interval){
    $("#intervalMenu label").removeClass("ui-state-active");
	$("label[for='interval" + interval + "']").addClass("ui-state-active");
});

viewModel.gridView.subscribe(function(filter){
	$("#gridMenu label").removeClass("ui-state-active");
    $("label[for='" + filter + "Button']").addClass("ui-state-active");
});

viewModel.hostLimit.subscribe(function (hosts)  {
	if ( hosts.length == 1 ) {
		$("#singleHostHideBackButton, #hostsTotal, #hostWarningsTotal").css({display: "none"});
	} else {
		$("#singleHostHideBackButton, #hostsTotal, #hostWarningsTotal").css({display: "block"});
	}
});


viewModel.shouldShowDetails = ko.dependentObservable(function(){
	return true;
	
    if ( this.host().hostID() !== 0 ) {
    	if((this.host().processList() && _.keys(this.host().processList()).length > 0) || 
        	(this.host().networkPorts() && _.keys(this.host().networkPorts()).length > 0) ||
        	this.host().runningServices().length > 0 || 
        	this.host().virtualHosts().length > 0 || 
        	this.host().mountedFilesystems().length > 0 || 
        	(this.host().consoleSessions() && _.keys(this.host().consoleSessions()).length>0)
        ){
        	$("#detailsButton, label[for='detailsButton']").fadeIn();
        	return true;
        } else {
        	$("#detailsButton, label[for='detailsButton']").fadeOut();
        	return false;
        }
    } else {
        return true;
    }
}, viewModel);


