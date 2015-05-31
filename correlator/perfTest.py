import numpy as np
import time

# Calculates a correlation matrix showing the PCC between each pair
# of channel sample sets
def get_correlation_matrix(sample_set):
    if len(sample_set) <= 0:
        print "Error: need to generate correlation matrix from non-empty lists."
        return

    # Get the nxn matrix showing correlation between each set of samples
    correlation_matrix = np.corrcoef(sample_set)

    return correlation_matrix


start = time.time()

# Generate 1000 channels of 1000 data values each and find the correlation matrix
channels = np.random.randn(1000, 1000)
mat = get_correlation_matrix(channels)

print 'Elapsed time:', time.time()-start, 'seconds'