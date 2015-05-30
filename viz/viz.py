from flask import Flask, render_template, request
import json
from math import ceil

app = Flask(__name__)

# Later we will want to pull this from a file, or autogenerate,
# but this prevents arbitrary file access by whitelisting channels
valid_channels = set(['sample_1', 'sample_2'])

batch_size = 12

@app.route('/')
def display_main():
    return render_template('index.html')

# This route will return json, containing all the values
# known for that channel within the time_range
@app.route('/data/<channel>', methods=['GET'])
def fetch_data(channel):
    global batch_size

    if not is_valid_channel(channel):
        return 'ERROR'

    start_time = request.args.get('start_time', None)
    include_time = request.args.get('include_time', None)
    exclude_start = bool(request.args.get('exclude_start', False))

    if include_time is None:
        return json_error('include_time is required')
    else:
        include_time = int(include_time)

    if start_time is None:
        start_time = include_time
    else:
        start_time = int(start_time)

    if include_time < start_time:
        return json_error('include_time cannot be earlier than start_time')

    with open('data/' + channel + '.json') as channel_file:
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

def is_valid_channel(channel):
  global valid_channels

  return channel in valid_channels

def calculate_index(info, time):
    return int(ceil((time - info['time_start']) * 1.0 / info['time_span']))

def json_error(msg):
    return '{"status":"ERROR","message":"{0}"}'.format(msg)

if __name__ == '__main__':
    app.run(debug=True)
