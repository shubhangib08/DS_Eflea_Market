const fs = require("fs");
const { exit } = require("process");
const nodeDataPath = "../node/nodeData.json";
var socket;
const PORT = 8080;
var heartBeatTimer = null;
var electionTimer = null;
var recieveHeartBeatTimer = null;
var NodeName = process.env.NODE_NAME;
var timeout = process.env.TIMER;
var state = "follower";
var voteCount = 0;
var leaderName = "";
var isNodeShutDown = false;
var activeNodeCount = 5;
const storeSuccessMap = new Map();

resetNodeData = () => {
    let data = {
        term: 0, 
        votedFor: 0, 
        entry: [],
        commitIndex: -1,
        lastApplied: -1,
        nextIndex: [0,0,0,0,0],
        matchIndex: [-1,-1,-1,-1,-1],
        prevlogTerm: -1,
        prevlogIndex: -1,
        key: "",
        value: "",
    };
    if (fs.existsSync(nodeDataPath)) {
        // path exists
        console.log("exists:", nodeDataPath);
        return;
    } 
    fs.writeFileSync(nodeDataPath, JSON.stringify(data), { flag: "w+" }, (err) => {
        console.log("reset_nodeData error while writing data " + err);
    });
};

setNodeData = (data) => {
    fs.writeFileSync(nodeDataPath, JSON.stringify(data), { flag: "w+" }, (err) => {
        console.log("reset_nodeData error while writing data " + err);
    });
};

getNodeData = () => {
    var data = [];
    if (fs.existsSync(nodeDataPath)) {
        var logfile = fs.readFileSync(nodeDataPath);
        data = JSON.parse(logfile);
    }
    return data;
};

function sendHeartBeat() {
    data = getNodeData();
    
    message = {};
    message["sender_name"] = NodeName;
    message["request"] = "AppendEntry";
    message["term"] = data["term"];
    message["nextIndex"] = data["nextIndex"];
    message["matchIndex"] = data["matchIndex"];
    
    for (let i = 1; i < 6; i++) {
        var name = 'Node' + i;
        if (name == NodeName) continue;

        //send data according to the next index of the node
        var nextIdx = data["nextIndex"];
        var entryIdx = nextIdx[i-1];
        var entryData = data["entry"];
        var key="", value="", prevlogTerm=-1, prevlogIndex=-1;

        if(entryIdx>-1 && entryData.length>entryIdx)
        {  
            key = Object.values(entryData)[entryIdx].key;
            value = Object.values(entryData)[entryIdx].value;
            if(entryIdx>0)
            {    
                prevlogIndex = entryIdx-1;
                prevlogTerm=Object.values(entryData)[entryIdx-1].term;
            }
        }
        
        
        message["key"] = key;
        message["value"] = value;
        message["prevlogTerm"] = prevlogTerm;
        message["prevlogIndex"] = prevlogIndex;
        
        sendMessage(NodeName, name, message)
    }
    //console.log("check state here "+state)
    if(state=="leader") {
        setTimeout(sendHeartBeat, 350);
    }
}

sendRequestVote = () => {
    state = "candidate";
    data = getNodeData();
    
    message = {};
    message["term"] = data["term"] + 1;
    message["request"] = "RequestVote";
    message["sender_name"] = NodeName;
    message["key"] = "";
    message["value"] = "";
    for (let i = 1; i < 6; i++) {
        var name = 'Node' + i;
        if (name == NodeName) continue;
        sendMessage(NodeName, name, message)
    }
    voteCount = 1;

    data["term"] = data["term"] + 1
    setNodeData(data);
    heartBeatTimer = setTimeout(sendHeartBeat, 300);
}

initializeSocket = (socketId) => {
    socket = socketId;
};

startElectionTimer = () => {
    electionTimer = setTimeout(sendRequestVote, timeout);
};

stopElectionTimer = () => {
    //console.log("here");
    clearTimeout(electionTimer);
    clearTimeout(heartBeatTimer);
};

setState = (state) => {
    state = state;
};

getState = () => {
    return state;
};

getVoteACK = () => {
    voteCount++;
    if ((voteCount >= activeNodeCount/2) && state == "candidate") {
        state = "leader";
        console.log("I am leader");
        leaderName = NodeName;
        data = getNodeData();
        // for (let i = 0; i < 5; i++) {
        //     data["nextIndex"][i-1]=data["nextIndex"][i-1]+1;
        // }
        // data["commitIndex"] = data["commitIndex"] + 1;
        setNodeData(data);
        sendHeartBeat();
    }
};

recieveHeartBeat = (info) => {
    clearTimeout(electionTimer);
    clearTimeout(recieveHeartBeatTimer);
    voteCount=0;
    var data = getNodeData();
    var leaderData = JSON.parse(info);
    state="follower";
    leaderName = leaderData["sender_name"];
    leaderData["request"] = "AppendEntryACK";
    leaderData["success"] = false;
    leaderData["sender_name"] = NodeName;
    leaderData["index"] = process.env.INDEX;
    //store information
    if(leaderData["key"]!="")
    {
        //term is not matching
        if(leaderData["term"]<data["term"]){
            //send false to leader
            console.log("Leader term is lesser than the current node term");
            leaderData["success"] = false;
        }
        else 
        {    
            //store information
            if(leaderData["key"]!=""){
                //first entry
                if(leaderData["prevlogIndex"]==-1 && leaderData["prevlogTerm"]==-1){
                    var newLog = {"term": leaderData["term"], "key": leaderData["key"], "value": leaderData["value"]};
                    data["entry"].push(newLog);
                    leaderData["success"] = true;
                }

                else{
                    //check log consistencey condition
                    //sucess
                    var idx = leaderData["prevlogIndex"];
                    var entrySz = data["entry"].length;
                    var logs = data["entry"];

                    if(idx>entrySz || (logs.length>idx && leaderData["prevlogTerm"]!=Object.values(logs)[idx].term)){
                        console.log("Last log term or index not matching .. failed to store data");
                        leaderData["success"] = false;
                    }
                    else{
                        var newLog = {"term": leaderData["term"], "key": leaderData["key"], "value": leaderData["value"]};
                        data["entry"].push(newLog);
                        leaderData["success"] = true;
                    }
                }
            }
        }
    }  
    else 
    {
        data["term"] = leaderData["term"];
    } 
    //sending the match index for this node
    leaderData["entrySize"] = data["entry"].length;
    data["nextIndex"] = leaderData["nextIndex"];
    data["matchIndex"] = leaderData["matchIndex"];
    if(data["entry"].length>0) console.log(data["entry"]);
    sendMessage(NodeName, leaderName, leaderData);
    recieveHeartBeatTimer = setTimeout(heartBeatFail, 600);
    setNodeData(data);
};

getLeaderDetails = () => {
    //console.log("Inside the getLeaderDetails" + leaderName)
    //console.log(data);
    return leaderName;
};

sendMessage = (from, to, message) => {
    if(isNodeShutDown==false)
    {
        const buf1 = Buffer.from(JSON.stringify(message));
        socket.send(buf1, PORT, to);
    }
};

function heartBeatFail() {
    electionTimer = setTimeout(sendRequestVote, timeout);
}

storeRequest = (key, value) => {
    data = getNodeData();
    var newLog = {"term": data["term"], "key": key, "value": value};
    data["key"] = key;
    data["value"] = value;
    
    var logs = data["entry"];
    var sz = data["entry"].length;
    if(sz>0) {
        data["prevlogIndex"] = sz-1;
        data["prevlogTerm"] = Object.values(logs)[sz-1].term;
    }
    else {
        data["prevlogIndex"] = -1;
        data["prevlogTerm"] = -1;
    }
    //updating leader nextIndex
    var index = process.env.INDEX;
    data["nextIndex"][index] = data["nextIndex"][index]+1;
    data["entry"].push(newLog);
    data["matchIndex"][index] = data["entry"].length;

    //storeSuccessMap.set(key,1);
    
    setNodeData(data);
    newData = getNodeData();
    message = {};
    message["request"] = "STORE_SUCCESS";
    message["sender_name"] = NodeName;
    message["key"] = "COMMITED_LOGS";
    message["value"] = newData["entry"];
    sendMessage(NodeName, "Controller", message);
};

retrieveRequest = () => {
    //console.log("Retrieve information");
    data = getNodeData();
    message = {};
    message["request"] = "RETRIEVE";
    message["sender_name"] = NodeName;
    message["key"] = "COMMITED_LOGS";
    message["value"] = data["entry"];
    sendMessage(NodeName, "Controller", message)
};

setNodeShutdown = () => {
    console.log("setNodeShutdown");
    state = "follower"
    clearTimeout(electionTimer);
    clearTimeout(recieveHeartBeatTimer);
    isNodeShutDown = true;
};

setActiveNodeCount = () => {
    activeNodeCount--;
};

receiveAppendEntryACK = (ackData) => {
    ackData = JSON.parse(ackData);
    //console.log("receiveAppendEntryACK" + ackData);
    var index = ackData["index"];
    data = getNodeData();
    data["matchIndex"][index] = ackData["entrySize"];
    if(ackData["key"]!="")
    {    
        if(ackData["success"]==true){
            //if ack by most of the server commit
            data["nextIndex"][index] = data["nextIndex"][index]+1;
            console.log("successfully saved in "+ ackData["sender_name"]);
        }
        else{
            console.log("unsuccessfull saving data in "+ ackData["sender_name"]);
            data["nextIndex"][index] = data["nextIndex"][index]-1;
        }
        //updating match index for this node
        data["matchIndex"][index] = ackData["entrySize"];
        //updating commit index on the basis of matchindex
        let itemsMap = {};
        let maxValue = 0;
        let maxCount = 0;
        for (let item of data["matchIndex"]) {
            if (itemsMap[item] == null) itemsMap[item] = 1;
            else itemsMap[item]++;
            if (itemsMap[item] > maxCount) {
                maxValue = item;
                maxCount = itemsMap[item];
            }
        }
        //commiting the max occurance of match index
        data["commitIndex"] = maxValue;
        console.log("Updated data is " + JSON.stringify(data));
    }
    setNodeData(data);
};

receiveVoteRequest = (reqData) => {
    var data = getNodeData(); 
    if(reqData["term"]<data["term"] || (reqData["term"]==data["term"] && reqData["commitIndex"]<data["commitIndex"]))
    {
        console.log("Cannot vote to maintain the consistency of data");
        return;
    }
    message = {};
    message["request"]="RequestVoteACK";
    message["sender_name"]=NodeName;
    message["key"]="";
    message["value"]="";
    sendMessage(NodeName, reqData["sender_name"], message);
};

getCurrentTerm = () => {
    var data = getNodeData(); 
    return data["term"];
};

module.exports = {
    initializeSocket,
    resetNodeData,
    getNodeData,
    startElectionTimer,
    stopElectionTimer,
    setState,
    getState,
    getVoteACK,
    recieveHeartBeat,
    getLeaderDetails,
    sendMessage,
    storeRequest,
    retrieveRequest,
    setNodeShutdown,
    setActiveNodeCount,
    sendRequestVote,
    receiveAppendEntryACK,
    receiveVoteRequest,
    getCurrentTerm,
};