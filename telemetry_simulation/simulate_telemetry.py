import random

channel_filename = 'channels.meta'

# Simulate a normal signal value using Gaussian white noise
def simulate_value(mean, stdDev):
    return random.gauss(mean, stdDev)

# Grab names and properties of channels
def grab_channels():
    channels = {}
    channel_lines = open(channel_filename, 'r').readlines()
    for line in channel_lines:
        tokens = line.strip().split(',')
        if len(tokens) > 1:
            # print tokens
            # Strip other delimiters from the channel name
            channel_name = ''.join(''.join(tokens[0].split(',')).split('*')).strip()
            datatype = tokens[1]
            units = tokens[2]
            mean = tokens[3]
            stdDev = tokens[4]
            
            # Add collected values to dictionary
            channel_entry = {}
            if (datatype != '-'):
                channel_entry['datatype'] = datatype.strip()
            if (units != '-'):
                channel_entry['units'] = units.strip()
            else:
                channel_entry['units'] = ''
            if (mean != '-'):
                channel_entry['mean'] = mean.strip()
            else:
                channel_entry['mean'] = ''
            if (stdDev != '-'):
                channel_entry['stdDev'] = stdDev.strip()
            else:
                channel_entry['stdDev'] = ''
            if channel_name != '':
                channels[channel_name] = channel_entry

    return channels

def main():
    channels = grab_channels()

    random.seed()

    # Simulate some random values
    for channel in channels:
        print channel + ': '
        for i in range(3):
            datatype = channels[channel]['datatype']
            units = channels[channel]['units']
            if (datatype == 'float'):
                mean = float(channels[channel]['mean'])
                stdDev = float(channels[channel]['stdDev'])
                sim_value = simulate_value(mean, stdDev)
            elif (datatype == 'int'):
                mean = float(channels[channel]['mean'])
                stdDev = float(channels[channel]['stdDev'])
                sim_value = round(simulate_value(mean, stdDev))
            else:
                sim_value = channels[channel]['mean']
            print str(sim_value) + ' ' + units
        print ''

if __name__ == '__main__':
    main()