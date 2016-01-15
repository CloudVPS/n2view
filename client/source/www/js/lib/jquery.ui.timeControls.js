$.widget( "ui.timeControls", {
        version: "@VERSION",
        defaultElement: "<div>",
        options: {
            now : Date.now(),
            date : null,
            enabledClass : "timeControlButtonEnabled",
            disabledClass : "timeControlButtonDisabled",
            mouseOverClass : "timeControllButtonOver"
        },
        _create: function() {
            this.update(this.options.date);
        },
        update : function (givenDate) {
            var id = Math.ceil(Math.random() * 1000000) + "radio";
            var click = function (someDate) {
                if(that.options.click){
                    that.options.click(someDate);
                }
            };
            var now = Date.now();
            var date;
            if(givenDate == null || givenDate == "") {
                date = now;
            } else {
                date = givenDate;
            }
            var data = {
                name : id,
                id : id,
                month : date.toString("MMM"),
                year : date.toString("yy"),
                day : date.toString("d"),
                time : date.toString("hh:mm:ss")
            };
            this.element.html($.tmpl($("#timeControlTemplate"), data));
            //$(".dateDisplay").html($.tmpl($("#retroCalendarTemplate"), data));
            $(".dateDisplay").html($.tmpl($("#regularDateTimeTemplate"), { date: date }));
            
            //$(".timeDisplay", this.element).retroClock({ date: date });
            
            //$(".currentTime", this.element).html(date.toString("yyyy/MM/dd HH:mm:ss"));
            var buttons = [
                {
                    selector: ".minusDay",
                    newDate : new Date(date).addDays(-1)
                },
                {
                    selector: ".minusHour",
                    newDate : new Date(date).addHours(-1)
                },
                {
                    selector: ".minus5m",
                    newDate : new Date(date).addMinutes(-5)
                },
                {
                    selector: ".minus1m",
                    newDate : new Date(date).addMinutes(-1)
                },
                {
                   selector: ".now"
                },
                {
                    selector: ".plus1m",
                    newDate : new Date(date).addMinutes(1)
                },
                {
                    selector: ".plus5m",
                    newDate : new Date(date).addMinutes(5)
                },
                {
                    selector: ".plusHour",
                    newDate : new Date(date).addHours(1)
                },
                {
                    selector: ".plusDay",
                    newDate : new Date(date).addDays(1)
                }
            ];
            
            $(".timeControlList input", this.element).each(function(index, b){
                $(b).attr({id : id + "" + (index+1)});
                $(b).next().attr({
                    "for" : $(b).attr("id")
                });
            });
            var that = this;
            $("#" + id , this.element).buttonset();
            _.each(buttons, function (button){
                var e = $(button.selector, that.element);
                var newDate = button.newDate;
                if(!button.newDate){
                    newDate = now;
                }
                if(newDate.compareTo(now)<=0){
                    e.bind("click", function(){
                        click(button.newDate);
                    });
                    e.button('enable');
                } else {
                   e.button('disable');
                }
            });
        }
    });