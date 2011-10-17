
var HashMgmt = function(){
    this.hashes = [];
    this.foundHashes = [];
}
HashMgmt.prototype.addHash = function(hash){
    this.hashes.push(hash.toLowerCase());
}
HashMgmt.prototype.foundKey = function(hash,org){
    var hash = hash.toLowerCase();
    var pos = this.hashes.indexOf(hash);
    if(pos>=0){
        this.foundHashes.push({'hash':hash,'org':org});
        this.removeKey(hash);
        return true;
    }
    console.log(hash+"/"+org + "Error, Hash is unknown!")
};
HashMgmt.prototype.removeKey = function(hash){
    var hash = hash.toLowerCase();
    for(var x = 0;x<this.hashes.length;x++){
        if(this.hashes[x] === hash){
            this.hashes.splice(x,1);
            return true;
        }
    }
    return false;
}

HashMgmt.prototype.getSearchHashes = function(){
    return this.hashes;
}

HashMgmt.prototype.getFoundHashes = function(){
    return this.foundHashes;
}

// Node.JS
if(typeof exports === 'undefined'){
    exports = {};
}
exports.HashMgmt = HashMgmt;