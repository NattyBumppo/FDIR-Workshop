import json
import numpy as np
import itertools as it
import numpy as np

# Notes for alarm.json
#
# All triggers use the following known variables:
#
# c: dictionary of all channel sample sets
# i: index of the current timestep (0-indexed)
#
# The following functions are available as well:
#
# mean([a, b, ..., n]): mean average of values
#
# stddev([a, b, ..., n]): standard deviation of values
#
# lastn(c['name'], i, n): list of the last n values (including the current i value)
# of c['name'] (or fewer, if current timestep is too low)
#

# Loads alarm data from the specified .json file
def get_alarm_data(alarm_filename):
    with open(alarm_filename) as alarm_file:
        alarm_data = json.load(alarm_file, parse_float=float, parse_int=int)
        alarms = alarm_data['alarms']

    return alarms

def get_channel_data(channels):
    channel_samples = {}
    time_start_data = {}
    time_span_data = {}
    for channel in channels:
        with open('test/' + channel + '.json') as channel_file:
            info = json.load(channel_file, parse_float=float, parse_int=int)
            channel_samples[info['display_name']] = info['values']
            time_start_data[info['display_name']] = info['time_start']
            time_span_data[info['display_name']] = info['time_span']

    return channel_samples, time_start_data, time_span_data

# Gets the arithmetic mean of a list of numbers
def mean(numbers):
    return np.mean(numbers)

# Gets the standard deviation of a list numbers
def stddev(numbers):
    return np.std(numbers)

# Gets a sublist containing the last n numbers in the set
# (may return a list of fewer than n numbers, if the 
def lastn(numbers, i, n):
    if (n > i):
        # Changes number of values returned so that
        # it won't go past the beginning of the list
        n = i;
    return numbers[i+1-n:i+1]

# Identifies all of the data items in the provided channels which
# trigger the provided alarms
def get_faults(channel_samples, time_start, time_step, alarms):
    # We make the assumption that all sets of samples are equal length.
    # This might be problematic later, but we'll put an assert here just
    # to make it obvious that we're doing this.
    len_first = len(channel_samples[channel_samples.keys()[0]]) if channel_samples else None
    assert all(len(channel_samples[i])==len_first for i in channel_samples)
    numSamples = len(channel_samples[channel_samples.keys()[0]])

    # Now go through all samples for each channel and
    # check for fault violations
    faults = []
    c = channel_samples
    for i in range(numSamples):
        for alarm in alarms:
            for trigger in alarm['triggers']:
                try:
                    if eval(trigger):
                        # Fault triggered; add to list
                        fault = {}
                        fault['name'] = alarm['name']
                        fault['trigger'] = trigger
                        fault['time'] = time_start + time_step * i
                        faults.append(fault)
                    else:
                        # No fault
                        pass
                except KeyError, e:
                    print 'Channel', e, 'not found'
    return faults

# Demonstrates basic fault detection functionality
def demo():
    # Get alarm data (defines fault characteristics)
    alarms = get_alarm_data('alarms.json')

    # Load channel sample data
    channels = ['Internal health metric', 'Left motor voltage', 'Right motor voltage', 'X acceleration', 'Y acceleration', 'Z acceleration']
    channel_samples, time_start_data, time_span_data = get_channel_data(channels)

    # For now, we're going to use a simplification: use the time_start and time_span
    # of the first channel loaded for all channels
    time_start = time_start_data[time_start_data.keys()[0]]
    time_span = time_span_data[time_span_data.keys()[0]]
    time_step = float(time_span) / len(channel_samples[channel_samples.keys()[0]])

    # Get list of faults and their corresponding times and associated channel names
    faults = get_faults(channel_samples, time_start, time_step, alarms)

    print faults


def main():
    demo()

if __name__ == '__main__':
    main()
