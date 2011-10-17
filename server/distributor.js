//var util = require('util');

var Distributor = function(pGenerator,nRanges,RangeSize){
    this.poolSize = pGenerator.Possibilities();
    this.pGenerator = pGenerator;
    this.ackCount = 0; // counts acknowledges.
    this.startTime = new Date().getTime();
    this.openRegion = new ranges.Region(); // regions of numbers which will be processed
    this.inProgressRegion = new ranges.Region(); // a region of numbers that a currently in progress
    this.processedRegion = new ranges.Region();  // region of number which are acknowledged
    this.inProgressPassRanges = [];     // inProgress Password Objects to determinate inactive numbers
    if (typeof(nRanges) === 'number' && nRanges > 0 && nRanges <= this.poolSize){
        this.nRanges = nRanges;
        this.RangeSize = parseInt(this.poolSize / nRanges);
    }
    else{
        this.nRanges = parseInt(this.poolSize / RangeSize);
        this.RangeSize = RangeSize;
    }
    this.openRegion.addRange(new ranges.Range(0,this.nRanges));
};

Distributor.prototype.hasNewRange = function(){
    if(this.openRegion.isEmpty()==false){
        return true;
    }
    if (this.openRegion.isEmpty() && this.inProgressRegion.isEmpty()==false){
        for(var x =0;x<this.inProgressRegion.region.length;x++){
            var tempRange = this.inProgressRegion.region[x];
            this.openRegion.addRange(tempRange);
        }
        return true;
    }
    if(this.openRegion.isEmpty() && this.inProgressRegion.isEmpty()){
        return false;
    }
    throw("handle me");
};

Distributor.prototype.getNewPassRange = function(){
    if (this.hasNewRange()){
        if (!this.openRegion.isEmpty())
            var RangeId = this.openRegion.getASingleRange();
        //else if(!this.inProgressRegion.isEmpty())
        //    var RangeId = this.inProgressRegion.getASingleRange();
        else
            throw("Empty Ranges!")
        this.inProgressRegion.addRange(RangeId);
        //debugger;
        // if lastId modify the RangeSize if needed
        var pr;
        if (RangeId.begin === this.nRanges){
            var rest = this.poolSize - this.RangeSize*(RangeId.begin+1);
            pr = this.createPassRangeObj(
                RangeId,this.RangeSize*RangeId.begin,this.RangeSize*(RangeId.begin+1)+rest+1
            );
        }
        else{
            pr = this.createPassRangeObj(
                RangeId,this.RangeSize*RangeId.begin,this.RangeSize*(RangeId.begin+1)
            );
        }
        this.inProgressPassRanges.push(pr);
        return pr;
    }
    throw("out of Ranges!");
};

Distributor.prototype.ackRange = function(RangeId){
    if (this.inProgressRegion.isInRegion(RangeId)){
        this.inProgressRegion.removeRange(RangeId);
        this.processedRegion.addRange(RangeId);
        for(var x=0;x<this.inProgressPassRanges.length;x++){
            var pr = this.inProgressPassRanges[x];
            if(pr.rId.begin == RangeId.begin){
                this.ackCount++;
            }
        }
        return true;
    }
    console.log("The Range with RangeId "+RangeId.begin +" isnt Active!");
};

/**
 * Generates a Password-Range-Object which includes all information for a processing
 * Thread.
 * @param RangeId
 * @param PassStart
 * @param PassStop
 */
Distributor.prototype.createPassRangeObj = function(RangeId,PassStart,PassStop){
    return {
        rId  : RangeId.copy(),
        pLen : this.pGenerator.pLen,
        rSta : PassStart,
        rStp : PassStop,
        tSta : new Date()
    }
};
Distributor.prototype.AckPerSecond = function(){
    var timenow = new Date().getTime();
    return this.ackCount / (timenow-this.startTime) * 1000;
};

// Node.JS
if(typeof exports === 'undefined'){
    exports = {};
}
if(typeof require === 'undefined'){
    ranges = exports;
}
else{
    ranges =  require('./ranges');;
}
exports.Distributor = Distributor;


