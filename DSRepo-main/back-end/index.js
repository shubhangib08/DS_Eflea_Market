
const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");

var corsOptions = {
  origin: "http://localhost:3000"
};

const db = require("./models");
require("dotenv").config();
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    loadApp();

    
    console.log("Connected to the database!");

    var dgram = require('dgram');

    var socket = dgram.createSocket('udp4');

    var NodeName = process.env.NODE_NAME;

    var LeaderName;

    var isNodeShutDown = false;

    socket.bind(PORT);

    socket.on('listening', function () {
      var address = socket.address(); 
      console.log('UDP Server started and listening on ' + address.address + ":" + address.port);
    });

    const {
      resetNodeData,
      getNodeData,
      initializeSocket,
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
      receiveAppendEntryACK,
      receiveVoteRequest,
      getCurrentTerm,
    } = require("./controllers/raft");
    

    initializeSocket(socket);

    setState("follower");

    //file for storing info like 
    // currentTerm : latest term server has seen (initialized to 0 on first boot, increases monotonically)
    // votedFor : candidateID that the current node voted for in the current term
    // log [ ] : log entries, each entry contains command for the state machine to execute and the term when the entry was received by the leader. ( For this phase, since we will not be making any client requests, this log will always be empty )
    // timeout interval: time after which a follower, having received no heartbeats from the leader, converts to a candidate and starts elections. Wait atleast for two heartbeat intervals before timeout. Also, randomize the timeout interval to avoid successive failed leader elections.
    // heartbeat interval: time interval after which the leader will send an APPEND_RPC request to the follower. Fixed for every node.
    resetNodeData();

    startElectionTimer();
    
    //console.log(getNodeData());

    socket.on('message', (msg, rinfo) => {
      if(isNodeShutDown == false){
        var temp = JSON.parse(msg.toString());
        
        //CONVERT_FOLLOWER
        if(temp["request"] == "CONVERT_FOLLOWER") {
          setState("follower")
        }

         //SHUTDOWN_UPDATE
        else if(temp["request"] == "SHUTDOWN_UPDATE") {
          setActiveNodeCount();
        }

        //TIMEOUT
        else if(temp["request"] == "TIMEOUT") {
          sendRequestVote();
        }

        //SHUTDOWN
        else if(temp["request"] == "SHUTDOWN") {
          isNodeShutDown=true;
          setNodeShutdown();
        }

        //LEADER_INFO
        else if(temp["request"] == "LEADER_INFO") {
          //console.log(temp);
          console.log("Leader is " + getLeaderDetails());
          message = {};
          message["request"]="LEADER_INFO";
          message["sender_name"]=NodeName;
          message["key"]="LEADER";
          message["value"]=getLeaderDetails();
          message["term"]=getCurrentTerm();
          sendMessage(NodeName, temp["sender_name"], message);
        }

        //RequestVote received
        else if(temp["request"] == "RequestVote") {

          //stop the timer
          stopElectionTimer();

          //send RequestVoteACK to the sender
          receiveVoteRequest(temp);
        }

        //RequestVoteAck
        else if(temp["request"] == "RequestVoteACK") {
          getVoteACK();  
        }

        //HeartBeat
        else if(temp["request"] == "AppendEntry") {
          //console.log("heart beat received ");
          recieveHeartBeat(JSON.stringify(temp));
        }

        else if(temp["request"] == "AppendEntryACK") {
          //console.log("heart beat received ");
          receiveAppendEntryACK(JSON.stringify(temp));
        }

        //STORE
        else if(temp["request"] == "STORE") {
          //if this node is the leader
          if(getLeaderDetails()==NodeName){
            storeRequest(temp["key"], temp["value"]);
          }
          //this node is not the leader
          else{
            message = {};
            message["request"]="LEADER_INFO";
            message["sender_name"]=NodeName;
            message["key"]="LEADER";
            message["value"]=getLeaderDetails();
            message["term"]=getCurrentTerm();
            sendMessage(NodeName, temp["sender_name"], message);
          }
        }

        else if(temp["request"] == "RETRIEVE") {
          //if this node is the leader
          if(getLeaderDetails()==NodeName){
            //console.log("retrieve the info");
            retrieveRequest();
          }
          //this node is not the leader
          else{
            message = {};
            message["request"]="LEADER_INFO";
            message["sender_name"]=NodeName;
            message["key"]="LEADER";
            message["value"]=getLeaderDetails();
            message["term"]=getCurrentTerm();
            sendMessage(NodeName, temp["sender_name"], message);
          }
        }
      }
      });

      socket.on('error',function(error){
        //console.log('Error: ' + error);
      });
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to eflea application." });
});

loadApp = async () => {
  require("./routes/register.routes")(app);
}

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

