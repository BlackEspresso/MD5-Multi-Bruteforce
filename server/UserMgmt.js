
var User = function(uid,uName){
    this.uid = uid;
    this.uName = uName;
    this.acks = 0;
    this.lastActivity = new Date().getTime();
    this.firstActivity = new Date().getTime();
}

User.prototype.ack = function(){
    this.acks++;
    this.lastActivity = new Date().getTime();
}

User.prototype.AckPerSecond = function(){
    var timenow = new Date().getTime();
    return this.acks / (timenow-this.firstActivity) *1000;
}

var Users = function(){
    this.Users = [];
    this.nextId = 0;
}

Users.prototype.addUser = function(uid){
    var newuid = typeof uid === 'number' ? uid : this.nextId;
    this.Users.push(new exports.User(newuid,"anonymous "+newuid));
    return this.nextId++;
};
Users.prototype.deleteUser = function(uid){
    for(var x=0;x<this.Users.length;x++){
        if(this.Users[x].uid === uid){
            this.Users.splice(x,1);
        }
    }
};
Users.prototype.findUser = function(uid){
    for(var x=0;x<this.Users.length;x++){
       var u = this.Users[x];
       if(u.uid === uid){
           return u;
       }
    }
    return undefined;
};
Users.prototype.findInactiveUserIds = function(inactiveTime){
    var TimeNow = new Date().getTime();
    var inactiveIds = [];
    for(var x=0;x<this.Users.length;x++){
       var u = this.Users[x];
       if( TimeNow - u.lastActivity >= inactiveTime){
           inactiveIds.push(u.uid);
       }
    }
    return inactiveIds;
}

if(typeof exports === 'undefined'){
    exports = {};
}

exports.User = User;
exports.Users = Users;