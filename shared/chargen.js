/**
 * Every password with length 'pLen' will be represented by an unique id.
 * @param plen
 * @param chars
 */
var GenPass = function(pLen){
    this.pLen = pLen;
    this.chars =  "abcdefghijklmnopqrstuvwxyz";
    this.charsLen = this.chars.length;
    //var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678";
};
/**
 * Returns starting Password e.g. [0,0,0,0] as CharArray (charA)
 */
GenPass.prototype.ZeroPassword = function(){
    var charA = [];
    for(var x = 0;x<this.pLen;x++){
        charA.push(0);
    }
    return charA;
};
/**
 * Returns CharArray as char String [0,0,0,0] => "aaaa"
 * @param posA
 */
GenPass.prototype.getPassword = function(posA){
    var passStr = "";
    for(var x = 0;x<posA.length;x++){
        passStr += this.chars[posA[x]];
    }
    return passStr;
};
/**
 * Goes n passwords forward from starting charArray posA
 * posA = [0,0,0,0]; n= 15 => [0,0,0,15] or
 * posA = [0,0,0,0]; n= 26 => [0,0,1,0]
 * @param posA
 * @param n
 */
GenPass.prototype.addToPassword = function(posA,n){
    var positions = Math.floor(Math.log(n)/Math.log(this.charsLen));
    var addToPosArray = [];
    for(var x=positions;x>=0;x--){
        addToPosArray[x] = Math.floor(n/Math.pow(this.charsLen,x));
        n = n - Math.pow(this.charsLen,x)*addToPosArray[x];
    }
    for(var x=0;x<addToPosArray.length;x++){
        if(posA[x]+addToPosArray[x]>=this.charsLen){
            posA[x] = posA[x] + addToPosArray[x]-this.charsLen;
            posA[x+1] += 1;
        }
        else{
            posA[x]+=addToPosArray[x];
        }
    }
    if (posA.length > this.pLen)
    {
        posA = [];
        for(var x=0;x<this.pLen;x++){
            posA[x] = this.charsLen -1;
        }
    }
    return posA;
};
/**
 * Returns the representing number from posA
 * [0,0,1,4] => 28;
 * @param posA
 */
GenPass.prototype.currentPass = function(posA){
    var summe = 0;
    for(var x=0;x<posA.length;x++){
        summe += Math.pow(this.charsLen,x)*posA[x];
    }
    return summe;
};
/**
 * Returns number of passwords left from posA
 * @param posA
 */
GenPass.prototype.restPassN = function(posA){
    var summe = 0;
    for(var x=0;x<posA.length;x++){
        summe += Math.pow(this.charsLen,x)*(this.charsLen-posA[x]-1);
    }
    return summe;
};
/**
 * Returns number of possibilities. equals to highest password number.
 */
GenPass.prototype.Possibilities= function(){
    return Math.pow(this.charsLen,this.pLen)-1;
};


// Node.JS
if(typeof exports === 'undefined'){
    exports = {};
}
exports.GenPass = GenPass;