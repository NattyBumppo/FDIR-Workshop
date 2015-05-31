# websocket server code adapted from https://gist.github.com/jkp/3136208

import struct
import SocketServer
from base64 import b64encode
from hashlib import sha1
from mimetools import Message
from StringIO import StringIO
from Queue import Queue
from threading import Thread
import time
import random
import hashlib
from datetime import datetime
import json

defaultPortNo = 3333

global_message_queue = Queue()

def startNewWebsocketServer(portNo):
    print 'Serving websocket connection requests on port ' + str(portNo)
    server = SocketServer.TCPServer(
        ("localhost", portNo), WebSocketsHandler)
    server.serve_forever()

class WebSocketsHandler(SocketServer.StreamRequestHandler):
    magic = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
 
    def setup(self):
        SocketServer.StreamRequestHandler.setup(self)
        print "Connection established", self.client_address
        self.handshake_done = False
 
    def handle(self):
        while True:
            if not self.handshake_done:
                self.handshake()
            else:
                # Handshake complete; now we'll send any
                # data that comes into the queue
                while True:
                    try:
                        message = global_message_queue.get_nowait()
                    except:
                        # Queue is probably empty, so just wait a bit
                        # then try again
                        time.sleep(0.015)
                    else:
                        # Queue wasn't empty, so send what we got
                        self.send_message(message)

                # For now, we're not reading any data
                # self.read_next_message()
 
    def read_next_message(self):
        length = ord(self.rfile.read(2)[1]) & 127
        if length == 126:
            length = struct.unpack(">H", self.rfile.read(2))[0]
        elif length == 127:
            length = struct.unpack(">Q", self.rfile.read(8))[0]
        masks = [ord(byte) for byte in self.rfile.read(4)]
        decoded = ""
        for char in self.rfile.read(length):
            decoded += chr(ord(char) ^ masks[len(decoded) % 4])
        self.on_message(decoded)
 
    def send_message(self, message):
        # Just in case, change to a string
        message = str(message)

        print 'Sending message:', message

        self.request.send(chr(129))
        length = len(message)
        if length <= 125:
            self.request.send(chr(length))
        elif length >= 126 and length <= 65535:
            self.request.send(chr(126))
            self.request.send(struct.pack(">H", length))
        else:
            self.request.send(chr(127))
            self.request.send(struct.pack(">Q", length))
        self.request.send(message)
 
    def handshake(self):
        data = self.request.recv(1024).strip()
        headers = Message(StringIO(data.split('\r\n', 1)[1]))
        if headers.get("Upgrade", None) != "websocket":
            return
        print 'Handshaking...'
        key = headers['Sec-WebSocket-Key']
        digest = b64encode(sha1(key + self.magic).hexdigest().decode('hex'))
        response = 'HTTP/1.1 101 Switching Protocols\r\n'
        response += 'Upgrade: websocket\r\n'
        response += 'Connection: Upgrade\r\n'
        response += 'Sec-WebSocket-Accept: %s\r\n\r\n' % digest
        self.handshake_done = self.request.send(response)
        print 'Handshake done.'
 
    def on_message(self, message):
        print message
        self.send_message('test')
 

def simulate_telemetry():
    channels = grab_channels('channels.json')
    random.seed()

    # Simulate some random values and make one single
    # telemetry packet string
    telemetry_string = simulate_random_values(channels)
    return telemetry_string


def simulate_random_values(channels):
    telemetry_string = ':'

    for channel in channels:
        # Append the name of the channel
        telemetry_string += ':' + channel['display_name'] + ':'
        datatype = channel['type']
        if 'units' in channel:
            units = channel['units']
        else:
            units = ''

        if (datatype == 'float'):
            mean = float(channel['mean'])
            stdDev = float(channel['stddev'])
            sim_value = simulate_value(mean, stdDev)
        elif (datatype == 'int'):
            mean = float(channel['mean'])
            stdDev = float(channel['stddev'])
            sim_value = round(simulate_value(mean, stdDev))
        else:
            sim_value = channel['mean']
        # Append the simulated value
        telemetry_string += str(sim_value) + ':'
        # Append the units (for display purposes)
        telemetry_string += units + ':'
    
    # Append a time string for this reading (/ delimited)
    telemetry_string += datetime.utcnow().strftime("%A/%B/%d/%Y/%H/%M/%S") + ':'

    # Finally, append a hash on the whole telemetry string for error-checking
    telemetry_string += get_hash(telemetry_string)

    return telemetry_string

def get_hash(telemetry_string):
    hash_object = hashlib.md5(telemetry_string)
    return hash_object.hexdigest()

# Simulate a normal signal value using Gaussian white noise
def simulate_value(mean, stdDev):
    return random.gauss(mean, stdDev)

# Grabs names and properties of channels from a provided .json file
def grab_channels(channel_filename):
    channels = {}
    with open(channel_filename) as channel_file:
        channel_metadata = json.load(channel_file, parse_float=float, parse_int=int)
        found_channels = find_channels(channel_metadata)

        # print "======================RESULTS======================"
        # print len(found_channels)
        # for channel in found_channels:
        #     print 'Channel found:'
        #     print channel
    return found_channels

def find_channels(current_node):
    found_channels = []

    # First get any channels from children of this node
    if 'children' in current_node:
        for child_node in current_node['children']:
            found_channels += find_channels(child_node)

    # Get channels at this node 
    if 'display_name' in current_node:
        found_channels.append(current_node)

    # Return all channels found
    return found_channels

def main():
    # Spawn a thread that runs a websocketServer
    worker = Thread(target=startNewWebsocketServer, args=(defaultPortNo,))
    worker.setDaemon(True)
    worker.start()

    # Simulate telemetry and send it to the client indefinitely
    while True:
        telemetry_this_frame = simulate_telemetry()
        global_message_queue.put(telemetry_this_frame)
        time.sleep(1)

    # Clean up and end
    worker.join(1)

    grab_channels('channels.json')


if __name__ == "__main__":
    main()