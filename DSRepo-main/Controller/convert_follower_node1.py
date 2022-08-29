from http import server
import json
import socket
import traceback
import time
import ast

# Wait following seconds below sending the controller request
time.sleep(5)

# Read Message Template
msg = json.load(open("Message.json"))

# Initialize
sender = "Controller"
target = "Node1"
port = 8080

# Request
msg['sender_name'] = sender
msg['request'] = "LEADER_INFO"
print(f"Request Created : {msg}")
temp = 0
# Socket Creation and Binding
skt = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
skt.bind((sender, port))

# Send Message
try:
    # Encoding and sending the message
    # for i in range(1,6):
    #     target = "Node"+str(i)
    #     print(target)
    #     msg['sender_name'] = sender
    #     msg['request'] = "STORE" 
    #     msg['key'] = "A" 
    #     msg['value'] = 4  
    #     skt.sendto(json.dumps(msg).encode('utf-8'), (target, port))
    target = "Node5"
    # msg['sender_name'] = sender
    # msg['request'] = "LEADER_INFO" 
    # msg['key'] = "A" 
    # msg['value'] = 4  
    # skt.sendto(json.dumps(msg).encode('utf-8'), (target, port))
    
    msg1 = json.load(open("Message.json"))
    msg1['sender_name'] = sender
    msg1['request'] = "STORE" 
    msg1['key'] = "A" 
    msg1['value'] = 4  
    skt.sendto(json.dumps(msg1).encode('utf-8'), (target, port))
    
    # msg['key'] = "C" 
    # msg['value'] = 13  
    # skt.sendto(json.dumps(msg).encode('utf-8'), (target, port))
    
    # msg['key'] = "D" 
    # msg['value'] = 13  
    # skt.sendto(json.dumps(msg).encode('utf-8'), (target, port))
except:
    #  socket.gaierror: [Errno -3] would be thrown if target IP container does not exist or exits, write your listener
    print(f"ERROR WHILE SENDING REQUEST ACROSS : {traceback.format_exc()}")

while True:
    output = skt.recv(2048)
    try :
        output = ast.literal_eval(output.decode('utf-8'))
    except:
        print(f"ERROR WHILE RECIEVING REQUEST")
    print(output)
    if(output["request"]=="LEADER_INFO"):
        if(temp==0):
            temp=1
            target = output["value"]
            msg1 = json.load(open("Message.json"))
            msg1['sender_name'] = sender
            msg1['request'] = "STORE" 
            msg1['key'] = "A" 
            msg1['value'] = 4  
            skt.sendto(json.dumps(msg1).encode('utf-8'), (target, port))

    #     msg2 = json.load(open("Message.json"))
    #     msg2['sender_name'] = sender
    #     msg2['request'] = "STORE" 
    #     msg2['key'] = "B" 
    #     msg2['value'] = 14  
    #     skt.sendto(json.dumps(msg2).encode('utf-8'), (target, port))

    # elif(output["request"]=="STORE_SUCCESS"):
    #     target = output["sender_name"]
    #     msg['sender_name'] = sender
    #     msg['request'] = "RETRIEVE" 
    #     msg['key'] = None
    #     msg['value'] = None 
    #     skt.sendto(json.dumps(msg).encode('utf-8'), (target, port))

