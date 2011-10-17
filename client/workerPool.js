
var WorkerPool = function(n,workerScript,workerResultFunction){
    this.workersRunning = [];
    for(var x=0;x<n;x++){
        this.workersRunning.push(false);
    }
    this.workersN = n;
    this.workers = [];
    for (var x = 0; x < n; x++) {
        this.workers[x] = new Worker(workerScript);
        this.workers[x].addEventListener('message',this.threadReturnFactory(),false);
        this.workers[x].addEventListener('message',workerResultFunction,false);
    }
    for (var x = 0; x < n; x++) {
        this.onIdleWorker(x);
    }
};

WorkerPool.prototype.postMessageAll = function(msgObj){
    for (var x = 0; x < this.workersN; x++) {
        msgObj['workerId'] = x;
        this.workersRunning[x] = true;
        this.workers[x].postMessage(msgObj);
    }
};
WorkerPool.prototype.postMessageTo = function(nr,msgObj){
    if (typeof nr === "number" && nr >=0 && nr < this.workersN)
    {
        msgObj['workerId'] = nr;
        this.workersRunning[nr] = true;
        this.workers[nr].postMessage(msgObj);
    }
    else{
        throw("thread number is wrong");
    }
};

WorkerPool.prototype.countRunning = function(){
    var runningC = 0;
    for (var x = 0; x < this.workersN; x++) {
        if(this.workersRunning[x] === true){
            runningC++;
        }
    }
    return runningC;
};
WorkerPool.prototype.getFreeWorker = function(){
    for (var x = 0; x < this.workersN; x++) {
        if(this.workersRunning[x] === false){
            return x;
        }
    }
    return -1;
};


WorkerPool.prototype.threadReturnFactory = function(){
    var that = this;
    return function(e){
    var data = e.data;
    if (typeof(data.workerId) === "number" && data.workerId >= 0 && data.workerId < that.workersN)
    {
        if (data.status === "ready"){
            // worker initialised, waiting for action
            that.workersRunning[data.workerId] = false;
            that.onReadyWorker(data.workerId);
        }
        if (data.status === "idle"){
            // main calculation is done, worker needs something to do
            // maybe a new init
            that.workersRunning[data.workerId] = false;
            that.onIdleWorker(data.workerId);
        }
    }
};
}

WorkerPool.prototype.callIdleEvents = function(){
    for (var x = 0; x < this.workersN; x++) {
        if(this.workersRunning[x] === false){
            this.onIdleWorker(x);
        }
    }
}

WorkerPool.prototype.onIdleWorker = function(nr){};
WorkerPool.prototype.onReadyWorker = function(nr){};