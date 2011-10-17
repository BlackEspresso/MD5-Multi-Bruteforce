var socket = io.connect('http://euve2416.vserver.de:8080');
var uid=-1;
var searchHashes = [];
var shutup = false;
var myconsole;
var workHistory = new WorkHistory(4);
// Init start
var wrf = function(e){
    var data = e.data;
    switch(data.cmd){
        case 'RangeChecked':
            data.uid = uid;
            socket.emit('RangeChecked',data);
            myconsole.value += "Done, chunck Nr.: " + data.rId.begin+" for password length "+data.pLen+"\n";
            myconsole.scrollTop = myconsole.scrollHeight;
            break;
        case 'FoundSomething':
            myconsole.value+="Found something " + data.HashFound.orgText + " "+data.HashFound.hash+"\n";
            myconsole.scrollTop = myconsole.scrollHeight;
            socket.emit('FoundKey',
                {'orgText':data.HashFound.orgText,
                    'hash':data.HashFound.hash,
                    'uid':uid}
            );
            break;
        default:
            console.log(data);
    }
};

var wp = new WorkerPool(4,'doWork.js',wrf);

socket.on('StatusUpdate',function(data){
    var htmlcontent = "<tr><th>Worker</th><th>Hashes/Sec</th><th>Last Activity(seconds)</th></tr>";
    if(data.Users !== undefined ){
        for(var x=0;x<data.Users.length;x++){
            htmlcontent += "<tr>"+
                "<td>"+data.Users[x].userName+"</td>"+
                "<td>"+Math.round(data.Users[x].userHpS)+"</td>"+
                "<td>"+Math.round(data.Users[x].inactive/1000)+"</td>"+
                "</tr>";
        }
    }
    document.getElementById('StatusUsers').innerHTML = htmlcontent;
    document.getElementById('yourId').textContent = uid;
    document.getElementById('globalHpS').textContent = Math.round(data.globalHpS);
    htmlcontent = "<tr><th>Hash</th></tr>";
    if(data.Hashes !== undefined ){
        for(var x=0;x<data.Hashes.length;x++){
            htmlcontent += "<tr>"+
                "<td>"+data.Hashes[x]+"</td>"
            "</tr>";
        }
    }
    document.getElementById('SearchHashes').innerHTML = htmlcontent;
    htmlcontent = "<tr><th>Hash</th><th>Original Text</th></tr>";
    if(data.FoundHashes !== undefined ){
        for(var x=0;x<data.FoundHashes.length;x++){
            htmlcontent += "<tr>"+
                "<td>"+data.FoundHashes[x].hash+"</td>"+
                "<td>"+data.FoundHashes[x].org+"</td>"+
                "</tr>";
        }
    }
    document.getElementById('FoundHashes').innerHTML = htmlcontent;
});
socket.on('newUID', function(data){
    uid = data.uid;
    startWork();
});
socket.on('newHashes',function(data){
    for(var x=0;x<data.searchHashes.length;x++){
        searchHashes[x] = data.searchHashes[x];
    }
});
socket.on('shutup',function(){shutup=true;});
socket.on('aMessage',function(data){
    myconsole.value+=data.msg+"\n";
    myconsole.scrollTop = myconsole.scrollHeight;
});
socket.on('newPasswordLength',function(data){
    workHistory.free();
});

// Init end

var startBruteForce = function(){
    myconsole = document.getElementById('myconsole');
    if(uid<0)//sometimes onload is called twice. this prevent id switching.
        socket.emit('getUID',{});
    socket.emit('getStatus',{});
    var htmlcontent = "<tr><th>Thread Nr.</th><th>Processing Chunk</th></tr>";
    for(var x = 0;x<wp.workersN;x++){
        htmlcontent+="<tr><td>"+x+"</td><td id='thread" + x+"'>-</td></tr>";
    }
    document.getElementById('yourThreads').innerHTML = htmlcontent;
}

var startWork = function(){
    socket.on('newRange',function(data){
        var freeWorker = wp.getFreeWorker();
        if (freeWorker >= 0 && !workHistory.isInHistory(data.rId.begin)){
            console.log("Got Key nr. " + data.rId.begin + "for " + freeWorker);
            data.cmd='startBruteForce';
            data.searchHashes = searchHashes;
            workHistory.addToHistory(data.rId.begin);

            var td = document.getElementById('thread'+freeWorker);
            if(td !== null){
                td.textContent = data.rId.begin;
            }
            wp.postMessageTo(freeWorker,data);
        }
        else{
            if (freeWorker >= 0)
                console.log(data.rId.begin + " Key already in process");
            if (freeWorker < 0)
                console.log("No free workers for" + data.rId.begin);
        }
        if(workHistory.isInHistory(data.rId.begin)){
            socket.emit('getRange',{'uid':uid});
        }
    });
    wp.onIdleWorker = function(wNr){
        socket.emit('getRange',{'uid':uid});
    }
    setInterval(function(){
        if(shutup == false)
            wp.callIdleEvents();
    },5000);
};
var addHash = function(){
    var hash = document.getElementById('newhash');
    var hashstring = hash.value.trim();
    if(hashstring.length == 32){
        socket.emit('addHash',{'hash':hashstring});
        hashstring.value = "";
    }else
        myconsole.value +="Cannot add hash! A hex md5 hash is 32 char long!\n"

}
var update = function(){
    socket.emit('getStatus',{});
}
