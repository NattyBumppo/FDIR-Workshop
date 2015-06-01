from flask import Flask, render_template, request
import json
from math import ceil
import imp
import os
import operator
from correlator import correlator

# Create Flask app
app = Flask(__name__)

# Later we will want to pull this from a file, or autogenerate,
# but this prevents arbitrary file access by whitelisting channels
valid_channels = set(['sample_1', 'sample_2', 'twice_sample_2', 'negative_correlation_sample_2'])

batch_size = 12
pre_frame_size = 3 # This is the amount before the 'time' to look for correlation
post_frame_size = 3 # This is the time after, thus a size of pre + post + 1

@app.route('/')
def display_main():
    return render_template('index.html')

# This route will return json, containing all the values
# known for that channel within the time_range
@app.route('/data/<channel>', methods=['GET'])
def fetch_data(channel):
    if not is_valid_channel(channel):
        return json_error('Invalid channel name.')

    start_time = request.args.get('start_time', None)
    include_time = request.args.get('include_time', None)
    exclude_start = bool(request.args.get('exclude_start', False))

    if include_time is None:
        return json_error('include_time is required')
    else:
        include_time = int(float(include_time))

    if start_time is None:
        start_time = include_time
    else:
        start_time = int(float(start_time))

    if include_time < start_time:
        return json_error('include_time cannot be earlier than start_time')

    with open(relative_path('data/' + channel + '.json')) as channel_file:
        info = json.load(channel_file)

    # Determine start and include indices
    start_index = calculate_index(info, start_time)
    include_index = calculate_index(info, include_time)

    if exclude_start:
        start_index += 1

    # Now we want to make sure we're sending back at
    # least batch_size, if not more (when asked for)
    include_index += max(0, batch_size - (include_index - start_index + 1))

    # Now slice including start index and slice index, and return that array, along with info

    info['values'] = info['values'][start_index:include_index + 1]

    # Adjust the time_start, so the client can know the offset if it wants
    info['time_start'] += start_index * info['time_span']

    # Add the display name as the channel name if not set
    if 'display_name' not in info:
        info['display_name'] = channel

    info['status'] = 'SUCCESS'

    return json.dumps(info)

# For now, it is important to note that this relies on the assumption
# of regularity of data for the files (time_start, time_span, and
# the size of the values array being the same)
# Later this can/will be changed to take those into account, but for now
# this is the assumption, in order to get it working
@app.route('/correlation_vector/<channel>')
def correlation_vector(channel):
    time = request.args.get('time', None)
    limit = int(float(request.args.get('limit', -1)))

    if time is None:
        return json_error('time must be specified')

    time = int(float(time))

    if not is_valid_channel(channel):
        return json_error('Invalid channel name.')

    # First read in info for the main channel
    with open(relative_path('data/' + channel + '.json')) as channel_file:
        info = json.load(channel_file)

    # Determine starting and ending indices of the slices
    time_index = calculate_index(info, time)

    if time_index >= len(info['values']):
        return json_error('Invalid time')

    # We want to push the window forward if we can
    # We're explicitly clipping in case a channel has more values than main
    # We may want to address the case where any has less, but for now all should
    # have the same amount. One option would be to zero pad the arrays before slicing
    end_index = min(time_index + post_frame_size, len(info['values']) - 1)

    # Now we push the window backward if we can
    start_index = max(time_index - pre_frame_size, 0)

    # Now read in the appropriate channel slices
    channel_values = {}
    channel_names = {}
    for channel_name in valid_channels:
        with open(relative_path('data/' + channel_name + '.json')) as channel_file:
            info = json.load(channel_file)
            channel_values[channel_name] = info['values'][start_index:end_index]
            channel_names[channel_name] = info.get('display_name', channel_name)

    main_channel = channel_values.pop(channel)

    # Calculate the correlation vector
    corr_vector = correlator.get_correlation_vector(main_channel, channel_values.values())

    # This creates an array of dictionaries, matching name to correlation, which
    # we can then sort, and slice, to return only a subset. This could be done on
    # the client, but will require less data transfer if done here. If sending all
    # we could just make it a dictionary comprehension, and dump that as json
    # We also normalize scores from [-1, 1] => [0, 1]
    corr_map = [
        {
            'name': name, # Internal name
            'display_name': channel_names[name], # Set display name
            'correlation': (corr_vector[i] + 1) / 2.0
        }
        for (i, name)
        in enumerate(channel_values.keys())
    ] # Order should be preserved

    # Sort in place based on correlation
    corr_map.sort(key=operator.itemgetter('correlation'), reverse=True)

    if limit > -1:
        corr_map = corr_map[0:limit]

    response_info = {
        'status': 'SUCCESS',
        'correlation_vector': corr_map
    }

    return json.dumps(response_info)

# As noted above, this functionality relies on the assumption of data regularity
# This should be addressed later, probably, to enforce appropriate constraints
@app.route('/correlation_matrix')
def correlation_matrix():
    time = request.args.get('time', None)

    if time is None:
        return json_error('time must be specified')

    time = int(float(time))

    # First read in a random channel
    with open(relative_path('data/' + next(iter(valid_channels)) + '.json')) as channel_file:
        general_info = json.load(channel_file)

    # Determine starting and ending indices of the slices
    # See the note about regularity above
    time_index = calculate_index(general_info, time)

    # It would be nice to check that time is valid, but for now we're assuming
    # that it is a valid time. Later we could check against a random channel, or such

    # We want to push the window forward if we can
    # Note the similar section in correlation vector, and it's comment
    # Note also the use of the first valid channel's info
    end_index = min(time_index + post_frame_size, len(general_info['values']) - 1)

    # Now we push the window backward if we can
    start_index = max(time_index - pre_frame_size, 0)

    # We continue by reading in all the data files
    channel_values = {}
    channel_names = {}
    for channel_name in valid_channels:
        with open(relative_path('data/' + channel_name + '.json')) as channel_file:
            info = json.load(channel_file)
            channel_values[channel_name] = info['values'][start_index:end_index]
            channel_names[channel_name] = info.get('display_name', channel_name)

    # Now we can get the correlation matrix

    corr_matrix = correlator.get_correlation_matrix(channel_values.values())

    name_list = [channel_names[name] for name in channel_values.keys()] # Order should be preserved

    response_info = {
        'status': 'SUCCESS',
        'channel_names': name_list,
        'correlation_matrix': corr_matrix.tolist()
    }

    return json.dumps(response_info)

# Below are helper methods

def is_valid_channel(channel):
  global valid_channels

  return channel in valid_channels

def calculate_index(info, time):
    return int(ceil((time - info['time_start']) * 1.0 / info['time_span']))

def json_error(msg):
    return '{{"status":"ERROR","message":"{0}"}}'.format(msg)

def relative_path(path):
    return os.path.join(os.path.dirname(__file__), path)

if __name__ == '__main__':
    app.run(debug=True)
