importScripts('md5.js');
importScripts('../shared/chargen.js');

var resultMD5Strings = [];
var workerId = -1;
var pgen;
var HashFound = {
    'n' : 0, // new pass
    'm' : "", // matches hash
    't' : 'F' //=> Found something
};

self.addEventListener('message',function(e){
    var data = e.data;
    switch(data.cmd){
        case 'startBruteForce':
            resultMD5Strings = data.searchHashes;
            workerId = data.workerId;
            pgen = new exports.GenPass(data.pLen);
            var x;
            for(x = data.rSta;x<data.rStp;x++){
                var newPass = pgen.getPassword(pgen.addToPassword(pgen.ZeroPassword(),x));
                var newMd5 = exports.hex_md5(newPass).toLowerCase();
                for(var y=0;y<resultMD5Strings.length;y++){
                    if(resultMD5Strings[y] === newMd5)
                    {
                        HashFound.orgText = newPass;
                        HashFound.hash = newMd5;
                        self.postMessage({'cmd' : 'FoundSomething','HashFound':HashFound,'workerId':workerId});
                    }
                }
            }
            self.postMessage({
                'cmd' : 'RangeChecked',
                'rId' : data.rId,
                'pLen' : data.pLen,
                'workerId': workerId,
                'status' : 'idle'
            });
            break;
        default:
            self.postMessage('Nix kennen ' + data.msg);
    }
},false);
