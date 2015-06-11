# websocket server code adapted from https://gist.github.com/jkp/3136208


from Queue import Queue
from threading import Thread
import time
import random
import json
import os

# Simulate a normal signal value using Gaussian white noise
def simulate_value(mean, stdDev):
    return random.gauss(mean, stdDev)

# Grabs names and properties of channels from a provided .json file
def grab_channels(channel_filename):
    channels = {}
    with open(channel_filename) as channel_file:
        channel_metadata = json.load(channel_file, parse_float=float, parse_int=int)
        found_channels = find_channels(channel_metadata)
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

# Generates the specified number of timesteps' worth of artificial data,
# for all channels, and saves under the specified directory name
def generate_artificial_data(time_start, time_span, num_timesteps, directory_name):
    channels = grab_channels('channels.json')
    random.seed()

    for channel in channels:
        # Set time-related properties
        channel['time_start'] = time_start
        channel['time_span'] = time_span        
        
        # Add simulated data based on mean and stddev
        values = []
        for i in range(num_timesteps):
            datatype = channel['type']
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
            values.append(sim_value)
        channel['values'] = values

        if not os.path.exists(directory_name):
            os.makedirs(directory_name)

        with open(directory_name + '/' + channel['display_name'] + '.json', 'w') as outfile:
            json.dump(channel, outfile)

def demo():
    channels = grab_channels('channels.json')

    time_start = 0
    time_span = 17
    num_timesteps = 30000
    directory_name = 'sim_data'

    print "Generating %s data values for %s channels, from time %s to %s." \
        % (num_timesteps, len(channels), time_start, time_start + time_span)
    print "Generated data will be placed in %s." % (directory_name + '/')
    generate_artificial_data(time_start, time_span, num_timesteps, directory_name)

def main():
    demo()


if __name__ == "__main__":
    main()
