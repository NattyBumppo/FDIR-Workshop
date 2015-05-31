import json
import numpy as np
import itertools as it
from decimal import Decimal

# Gets a Pearson Correlation Coefficient as a score of correlation
# between the two lists passed in as arguments. 1 is total positive
# correlation, 0 is no correlation, and -1 is total negative correlation.
def get_pcc(x, y):
    assert len(x) == len(y)
    assert len(x) > 0

    # Get the 2x2 matrix showing correlation (somewhat akin
    # to a covariance matrix)
    correlation_matrix = np.corrcoef(x, y)

    # The values in the antidiagonal of the matrix (which should
    # be the same) are our correlation coefficient
    correlation_coefficent = correlation_matrix[0,1]

    # Set any NaNs (due to constant values) to 0
    correlation_coefficent = np.nan_to_num(correlation_coefficent)

    # Calculate pearson correlation and return the result
    return correlation_coefficent

# Calculates a correlation vector showing correlation of one data set to other data sets
def get_correlation_vector(main_dataset, other_datasets):
    assert len(main_dataset) > 0
    assert len(other_datasets) > 0

    # Get the nxn matrix showing correlation between each set of samples
    correlation_matrix = np.corrcoef(main_dataset, other_datasets)

    # Set any NaNs (due to constant values) to 0
    correlation_matrix = np.nan_to_num(correlation_matrix)

    return correlation_matrix[1]

# Calculates a correlation matrix showing the PCC between each pair
# of channel sample sets
def get_correlation_matrix(sample_set):
    assert len(sample_set) > 0

    # Get the nxn matrix showing correlation between each set of samples
    correlation_matrix = np.corrcoef(sample_set)

    # Set any NaNs (due to constant values) to 0
    correlation_matrix = np.nan_to_num(correlation_matrix)

    return correlation_matrix

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

    print 'Finding correlation between every pair of channels:'
    for a, b in it.combinations(channel_samples.keys(), 2):
        print 'Correlation between %s and %s:\n %s' % (a, b, get_pcc(channel_samples[a], channel_samples[b]))

    print 'Finding full correlation matrix of all channels:'
    print get_correlation_matrix(channel_samples.values())

    print 'Correlation vector between sample 2 and all other channels:'
    other_channels = [channel_samples[channel_name] for channel_name in channel_samples.keys() if (channel_name != 'Sample 2')]
    print get_correlation_vector(other_channels, channel_samples['Sample 2'])

def main():
    demo()


if __name__ == '__main__':
    main()
