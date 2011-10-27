var app = require('http').createServer(httpHandler);
var io = require('socket.io').listen(app);
var util = require('util');


var UserMgmt = require('./UserMgmt');
var users = new UserMgmt.Users();
var HashMgmt = require('./HashMgmt');
var hashMgmt = new HashMgmt.HashMgmt();
var ranges = require('./ranges');
var chargen = require('../shared/chargen');
var distributor = require('./distributor');

hashMgmt.addHash('e2ba01c259d796bb4bf60e5d4ad8cdb2');
hashMgmt.addHash('74b87337454200d4d33f80c4663dc5e5');
hashMgmt.addHash('02c425157ecd32f259548b33402ff6d3');
hashMgmt.addHash('594f803b380a41396ed63dca39503542');
hashMgmt.addHash('95ebc3c7b3b9f1d2c40fec14415d3cb8');
hashMgmt.addHash('coffeecoffeecoffeecoffeecoffeeco');


var PasswordStartLength = 4;
var PasswordLength = PasswordStartLength;
var PasswordMaxLength = 9;

var chGen = new chargen.GenPass(PasswordLength);
var dist = new distributor.Distributor(chGen,'',300000);
var stats = {
    globalHpS : 0,
    UserCount: 0,
    Users : [],
    Hashes : [],
    FoundHashes: [],
    maxChunks : 0
};
var pausing = false;

io.set('transports',['xhr-polling']);
io.set('log level','0');
function httpHandler(req,res){
    res.writeHead(200);
    res.end("Md5 Bruteforce Server");
}

io.sockets.on('connection',function(socket){
    socket.on('getUID',function(){
        socket.emit('newUID',{'uid':users.addUser()});
        console.log('UserAdded');
    });
    socket.emit('newHashes',{'searchHashes':hashMgmt.getSearchHashes()});

    var fireNewPassRange = function(){
        if(pausing){return false;}
        if(dist.hasNewRange()){
            var newRange = dist.getNewPassRange();
            socket.emit('newRange',newRange);
        }
        else{
            console.log("new PassRange");
            socket.emit('aMessage',{msg:'Passwords with Length: ' + dist.pGenerator.pLen +
                ' done, gona switch...'});
            socket.emit('flushHistory',{});
            PasswordLength++;
            if (PasswordLength>PasswordMaxLength){
                PasswordLength = PasswordStartLength;
                socket.emit('aMessage',{msg:"Returning to StartLength: " + PasswordStartLength});
            }
            chGen = new chargen.GenPass(PasswordLength);
            dist = new distributor.Distributor(chGen,'',300000);
            // wait few seconds then start new Password Range
            setInterval(fireNewPassRange,1000);
        }
    };
    socket.on('getRange',function(data){
       fireNewPassRange();
    });
    socket.on('FoundKey',function(data){
        hashMgmt.foundKey(data.hash,data.orgText);
        console.log("Anonymous " + data.uid +" Found a Key: " + data.orgText);
        if (hashMgmt.getSearchHashes().length === 0 ){
            console.log("Bruteforced all Hashes");
            socket.emit('aMessage',{msg:'Ok, bruteforced all hashes! Pausing...'});
            pausing = true;
        }
    });
    socket.on('RangeChecked',function(data){
        if (data.pLen === dist.pGenerator.pLen){
            dist.ackRange(ranges.Range.fromObj(data.rId));
            if(users.findUser(data.uid)!==undefined)
                users.findUser(data.uid).ack();
            else
                users.addUser(data.uid)
        }
        else{
            console.log("Anonymous " + data.uid +" send chunk for old length");
        }
    });
    socket.on('getStatus',function(){
        updateStats();
        socket.emit('StatusUpdate',stats);
    });
    socket.on('addHash',function(data){
        if (typeof data.hash !== 'string' || data.hash.length != 32){
            return;
        }
        hashMgmt.addHash(data.hash);
        updateStats();
        socket.emit('StatusUpdate',stats);
        if (pausing){
            fireNewPassRange();
            pausing = false;
            socket.emit('aMessage',{msg:'Ok, have a new Hash. Continue ...'});
        }
    });
    setInterval(function(){
        updateStats();
        socket.emit('StatusUpdate',stats);
    },5000);
    
});


var updateStats = function(){
    stats.Users = [];
    stats.Hashes = [];
    stats.FoundHashes = [];
    stats.pLen = dist.pGenerator.pLen;
    var NowTime = new Date().getTime();
    for(var x =0;x<users.Users.length;x++){
        stats.globalHpS = dist.AckPerSecond()*dist.RangeSize;
        stats.Users.push({
            'userName':users.Users[x].uName,
            'userHpS':users.Users[x].AckPerSecond() * dist.RangeSize,
            'inactive':NowTime - users.Users[x].lastActivity});
        stats.UserCount = users.Users.length;
    }
    for(var x=0;x<hashMgmt.getSearchHashes().length;x++){
        stats.Hashes.push(hashMgmt.getSearchHashes()[x]);
    }
    for(var x=0;x<hashMgmt.getFoundHashes().length;x++){
        stats.FoundHashes.push(hashMgmt.getFoundHashes()[x]);
    }
    stats.maxChunks = dist.RangeSize;
}

setInterval(function(){
    var inactiveUsers = users.findInactiveUserIds(120000);
    for(var x=0;x<inactiveUsers.length;x++){
        users.deleteUser(inactiveUsers[x]);
        console.log("Deleted inactive user " + inactiveUsers[x]);
    }
},120000);

app.listen(8080);
console.log('Server spawned');