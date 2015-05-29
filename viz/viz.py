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

    if start_time is not None:
        start_time = int(start_time)

    if include_time is not None:
        include_time = int(include_time)

    if start_time is not None and include_time is not None and include_time < start_time:
        return 'ERROR'

    with open('data/' + channel + '.json') as channel_file:
        channel_info = json.load(channel_file)

    # Determine starting index of appropriate slice
    start_index = 0
    if start_time is not None:
        start_index = calculate_index(channel_info, start_time)

    if exclude_start:
        start_index += 1

    end_index = len(channel_info['values']) - 1 # This will be inclusive, hence the '- 1's
    slice_index = min(end_index, start_index + batch_size - 1) # This will be inclusive, hence the '- 1's
    if include_time is not None:
        include_index = calculate_index(channel_info, include_time)

        if include_index > end_index:
            return 'ERROR'

        slice_index = max(slice_index, include_index)

    # Check that the indices are valid

    start_invalid = start_index < 0 or start_index > end_index
    slice_invalid = slice_index < 0 or slice_index > end_index

    if start_invalid or slice_invalid or start_index >= slice_index:
        return 'ERROR'

    # Now slice including start index and slice index, and return that array, along with info

    channel_info['values'] = channel_info['values'][start_index:slice_index+1]

    return json.dumps(channel_info)

def is_valid_channel(channel):
  global valid_channels

  return channel in valid_channels

def calculate_index(info, time):
    return int(ceil((time - info['time_start']) * 1.0 / info['time_span']))

if __name__ == '__main__':
    app.run(debug=True)
