(function(_){
    _.mixin({
        objectFromString : function (inputString){ if(_.isString(inputString)){ var parse = function (parts){ var o = window; while(parts.length && o){ o = o[parts.shift()];}; return o; }; return parse(inputString.split(".")); }}
    });
})(_);

