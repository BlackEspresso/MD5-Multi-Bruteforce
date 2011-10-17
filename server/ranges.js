
var Range = function(begin,end){
    this.begin = begin;
    this.end = end;
    if (end < begin)
        throw("Range error begin > end!");
};
Range.fromObj = function(obj){
    return new Range(obj.begin,obj.end);
};
Range.prototype.copy = function(){
    return new Range(this.begin,this.end);
};

Range.prototype.isInRange = function(n){
    if (n instanceof Number){
        if (n >= this.begin && n < this.end){
            return true;
        }
    }
    if (typeof n !== 'undefined' && n.begin !== 'undefined' && n.end !== 'undefined'){
        if(n.begin >= this.begin && n.end <= this.end)
            return true;
    }
    return false;
};
Range.prototype.matches = function(range){
    if (range.begin <= this.begin && range.end-1 >= this.begin){
        return 0; // Matches on the start
    }
    if (range.begin <= this.end+1 && range.end >= this.end){
        return 1; // matches on the end
    }
    return -1;
};
Range.prototype.extend = function(range){
    if(this.matches(range) === 0){
        this.begin = range.begin;
        return true;
    }
    else if(this.matches(range) === 1){
        this.end = range.end;
        return true
    }
    return false;
};
Range.prototype.getLength = function(){
    return this.end - this.begin + 1;
};
Range.prototype.isSingleRange = function(){
    return this.getLength()=== 1
};
Range.prototype.ToSingleRange = function(){
    return new Range(this.begin,this.begin);
};

var Region = function(startRange){
    if (startRange !== undefined)
        this.region = [startRange];
    else
        this.region = [];
};
Region.prototype.CleanUp = function(){
    //debugger;
    for(var x=0;x<this.region.length-1;x++){
        if (this.region[x].matches(this.region[x+1])>=0){
            this.region[x].extend(this.region[x+1]);
            this.region.splice(x+1,1);
            x--;
        }
    }
};
Region.prototype.getSmallestRange = function(){
    var minlen, len, pos;
    if(this.isEmpty()){throw "Region is Empty!";}
    for(var x=0;x<this.region.length;x++){
        len = this.region[x].getLength();
        if (len < minlen || x === 0){
            minlen = len;
            pos = x;
        }
    };
    return this.region[pos].copy();
};

Region.prototype.getASingleRange = function(){
    var sr = this.getSmallestRange();
    var sn = sr.ToSingleRange();
    this.removeRange(sn);
    return sn;
};
Region.prototype.removeRange = function(range){
    for(var x=0;x<this.region.length;x++){
        if(this.region[x].isInRange(range)){
            var oldreg = this.region.splice(x,1)[0];
            var regleft;
            var regright;
            if(oldreg.begin === range.begin && range.end < oldreg.end){
                regright = new Range(range.end+1,oldreg.end);
                this.region.splice(x,0,regright);
                return true;
            }
            if(oldreg.end === range.end && range.begin > oldreg.begin){
                regleft = new Range(oldreg.begin,range.begin-1);
                this.region.splice(x,0,regleft);
                return true;
            }
            if(oldreg.end === range.end && oldreg.begin === range.begin){
                // Nothing
                return true;
            }
            if(range.begin > oldreg.begin && range.end < oldreg.end){
                regleft = new Range(oldreg.begin,range.begin-1);
                regright = new Range(range.end+1,oldreg.end);
                this.region.splice(x,0,regleft,regright);
                return true;
            }
        }
    }
    return false;
};
Region.prototype.addRange = function(ra){
    var range = ra.copy();
    if(this.region.length === 0){
        this.region.push(range);
        return "added as first element";
    }

    for(var x=0;x<this.region.length;x++){
        if(range.isInRange(this.region[x])){
            this.region.splice(x,1);
            this.addRange(range);
            this.CleanUp();
            return "deletet&added Range";
        }
    }
        
    for(var x=0;x<this.region.length;x++){
        var reg = this.region[x];
        if(reg.matches(range)>=0){
            reg.extend(range);
            this.CleanUp();
            return "extend reg";
        }
        if(x<this.region.length-1){
            var nextReg = this.region[x+1];
            if(reg.end < range.begin && nextReg.begin > range.end){
                this.region.splice(x+1,0,range);
                return "insert between ranges";
            }
        }
    }
    if(range.begin > this.region[this.region.length-1].end){
        this.region.push(range);
        return "extenend at end";
    }
    if(range.end < this.region[0].begin){
        this.region.splice(0,0,range);
        return "insert in first place";
    }



    console.log("addRange Error: " + range.begin + " " + range.end);
    //throw("Region.addRange : Theres something going on ...");
};
Region.prototype.isEmpty = function(){
    if (this.region.length === 0)
        return true;
    return false;
};
Region.prototype.isInRegion = function(range){
    for(var x=0;x<this.region.length;x++){
        if(this.region[x].isInRange(range)){
            return true;
        }
    }
    return false;
};


// Node.JS
if(typeof exports === 'undefined'){
    exports = {};
}
exports.Range = Range;
exports.Region = Region;