HostData = Backbone.Model.extend({
    initialize : function (options) {
        this.set(options);
    },
    url : function(){
        var interval;
        if(this.get("interval") === undefined){
            interval = 320;
        } else {
            interval = this.get("interval");
        }
        var url = "/n2/host/" + this.get("hostID") + "/graph/" + this.get("graphType");
        if(this.get("startDate")!==undefined){
            url+="/date/" + this.get("startDate");
        } 
        url+= "/interval/" + interval;
        return url;
    }
});

Host = Knockback.Model.extend({
    defaults: {
    	hostLabel : "",
        startDate : "",
        hostID : 0,
        hostname : "",
        cpuUsage : 0,
        status : "",
        recordTime : "",
        uptimeString : "",
        operatingSystem : "",
        hardwarePlatform : "",
        loadAverage : "",
        freeRAM : "",
        totalRAM : "",
        networkIn : 0,
        networkOut : 0,
        processList : "",
        freeSwapMemory : 0,
        diskActivity : 0,
        roundTripTime : 0,
        packetLoss : 0,
        ioWaitPercent : "",
        runningServices : [],
        virtualHosts : [],
        consoleSessions : [],
        mountedFilesystems : [],
        networkPorts : []
    },
    defaultChildModels : {
        report : "HostReport"
    },
    defaultChildCollections : {
        events : "HostEvents"
    },
    url : function () {
        var url = "/n2/host/" + this.get("hostID");
        if(this.get("startDate")){
            url+="/date/" + this.get("startDate");
        }
        return url;
    }
});

HostReport = Knockback.Model.extend({
    defaults : {
        html : ""
    },
    url : function(){
        return "/n2/host/" + this.parent.get("hostID") + "/analysis";
    }
});

HostEvents = Knockback.Collection.extend({
    initialize : function () {
        this.model = HostEvent;
    },
    url : function(){
        return "/n2/host/" + this.parent.get("hostID") + "/eventlog";
    },
    parse : function (o) {
        if(o && o.eventLog){
            return o.eventLog;
        }
    }
});

HostEvent = Knockback.Model.extend({
    defaults : {
        problems: "",
        status: "",
        text: "",
        timeStamp: ""
    }
});

User = Knockback.Model.extend({
    defaults : {
        id : 0,
        username : "",
        isAdmin : false
    },
    url : function () {
        return "/n2/user/" + this.get("username");
    }
});


Hosts = Backbone.Collection.extend({
    url : "/n2/host/"
});
		            