var WorkHistory = function(maxLen){
    this.history = [];
    this.maxLen = maxLen;
    this.pos = 0;
}

WorkHistory.prototype.addToHistory = function(text){
    if(this.pos >= this.maxLen){this.pos = 0;}
    this.history[this.pos++] = text;
    return true;
}

WorkHistory.prototype.isInHistory = function(text){
    if(this.history.indexOf(text)>=0){return true;}
    return false;
}

WorkHistory.prototype.free = function(){
    for(var x=0;x<this.history.length;x++){
        this.history[x] = undefined;
    }
}