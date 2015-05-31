import json
import numpy as np
import itertools as it
from decimal import Decimal

# Gets a Pearson Correlation Coefficient as a score of correlation
# between the two lists passed in as arguments. 1 is total positive
# correlation, 0 is no correlation, and -1 is total negative correlation.
def get_pcc(x, y):
    if len(x) != len(y) or len(x) <= 0:
        print "Error: need to compare non-empty, equal size lists."
        return

    # Turn values into numpy arrays for comparison
    x = np.array(x)
    y = np.array(y)

    # Get the 2x2 matrix showing correlation (somewhat akin
    # to a covariance matrix)
    correlation_matrix = np.corrcoef(x, y)

    # The values in the antidiagonal of the matrix (which should
    # be the same) are our correlation coefficient
    correlation_coefficent = correlation_matrix[0,1]

    # Calculate pearson correlation and return the result
    return correlation_coefficent


# Loads channel data from the specified .json files
def get_data(channels):
    channel_samples = {}
    for channel in channels:
        with open('data/' + channel + '.json') as channel_file:
            info = json.load(channel_file, parse_float=float, parse_int=int)
            channel_samples[info['display_name']] = info['values']
    return channel_samples

# Demonstrates basic correlation functionality
def demo():
    # Load channel sample data
    channels = ['sample_1', 'sample_2', 'twice_sample_2', 'negative_correlation_sample_2']
    channel_samples = get_data(channels)
    print type(channel_samples)
    # print channel_samples['sample_1']
    for a, b in it.combinations(channel_samples.keys(), 2):
        print 'Correlation between %s and %s: %s' % (a, b, get_pcc(channel_samples[a], channel_samples[b]))

def main():
    demo()



if __name__ == '__main__':
    main()