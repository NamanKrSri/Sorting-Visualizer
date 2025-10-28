// ==================== SCRIPT.JS ====================
// Global variables to track the sorting state and statistics

let array = []; // Array that holds the values to be sorted
let comparisons = 0; // Counter for number of comparisons made
let accesses = 0; // Counter for number of array accesses
let startTime = 0; // Timestamp when sorting starts
let isSorting = false; // Flag to track if sorting is in progress
let shouldStop = false; // Flag to signal when to stop sorting
let animationSpeed = 50; // Delay between animation frames in milliseconds

// Get references to all DOM elements
const arraySizeSlider = document.getElementById('arraySize');
const speedSlider = document.getElementById('speed');
const sizeValue = document.getElementById('sizeValue');
const speedValue = document.getElementById('speedValue');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const algorithmSelect = document.getElementById('algorithm');

// Object containing time complexity information for each algorithm
const complexityData = {
    bubble: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    selection: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    insertion: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    merge: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    quick: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
    heap: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' }
};

// Event listener for array size slider changes
arraySizeSlider.addEventListener('input', (e) => {
    sizeValue.textContent = e.target.value; // Update displayed value
    if (!isSorting) generateArray(); // Generate new array if not currently sorting
});

// Event listener for speed slider changes
speedSlider.addEventListener('input', (e) => {
    animationSpeed = 210 - e.target.value; // Inverse relationship: higher value = faster speed
    speedValue.textContent = animationSpeed + 'ms'; // Update displayed value
});

// Event listener for algorithm selection changes
algorithmSelect.addEventListener('change', (e) => {
    updateComplexityDisplay(e.target.value); // Update time complexity display
});

/**
 * Updates the time complexity display based on selected algorithm
 * @param {string} algorithm - The selected algorithm key
 */
function updateComplexityDisplay(algorithm) {
    const complexity = complexityData[algorithm]; // Get complexity data for algorithm
    // Update each complexity field in the UI
    document.getElementById('bestCase').textContent = complexity.best;
    document.getElementById('avgCase').textContent = complexity.avg;
    document.getElementById('worstCase').textContent = complexity.worst;
    document.getElementById('spaceComplexity').textContent = complexity.space;
}

/**
 * Generates a new random array with values between 50 and 400
 */
function generateArray() {
    const size = parseInt(arraySizeSlider.value); // Get current array size from slider
    array = []; // Clear existing array
    // Generate random values for each position
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 350) + 50);
    }
    resetStats(); // Reset all statistics
    renderArray(); // Display the new array
}

/**
 * Renders the array as visual bars in the DOM
 * @param {Array} compareIndices - Indices of bars being compared
 * @param {Array} swapIndices - Indices of bars being swapped
 * @param {Array} sortedIndices - Indices of bars that are sorted
 */
function renderArray(compareIndices = [], swapIndices = [], sortedIndices = []) {
    const container = document.getElementById('arrayContainer');
    container.innerHTML = ''; // Clear existing bars
    
    const maxHeight = Math.max(...array); // Find tallest bar for scaling
    
    // Create a bar element for each array value
    array.forEach((value, idx) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar';
        // Scale bar height as percentage of max height
        bar.style.height = `${(value / maxHeight) * 100}%`;
        
        // Add appropriate class based on bar state
        if (compareIndices.includes(idx)) {
            bar.classList.add('comparing');
        }
        if (swapIndices.includes(idx)) {
            bar.classList.add('swapping');
        }
        if (sortedIndices.includes(idx)) {
            bar.classList.add('sorted');
        }
        
        container.appendChild(bar); // Add bar to container
    });
}

/**
 * Resets all statistics counters and displays to zero
 */
function resetStats() {
    comparisons = 0;
    accesses = 0;
    document.getElementById('comparisons').textContent = '0';
    document.getElementById('accesses').textContent = '0';
    document.getElementById('timeElapsed').textContent = '0.00s';
}

/**
 * Updates the statistics display with current values
 */
function updateStats() {
    document.getElementById('comparisons').textContent = comparisons;
    document.getElementById('accesses').textContent = accesses;
    // Calculate elapsed time in seconds
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    document.getElementById('timeElapsed').textContent = elapsed + 's';
}

/**
 * Creates a delay using Promise for smooth animations
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if sorting should stop and throws error to break execution
 * @throws {Error} - Throws 'stopped' error if shouldStop is true
 */
function checkStop() {
    if (shouldStop) {
        throw new Error('stopped'); // Throw error to exit sorting function
    }
}

/**
 * Initiates the sorting process based on selected algorithm
 */
async function startSorting() {
    if (isSorting) return; // Prevent multiple simultaneous sorts
    
    // Update UI state
    isSorting = true;
    shouldStop = false;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    resetBtn.disabled = true;
    algorithmSelect.disabled = true;
    
    resetStats(); // Reset statistics
    startTime = Date.now(); // Record start time

    const algorithm = algorithmSelect.value; // Get selected algorithm
    
    try {
        // Execute the appropriate sorting algorithm
        switch(algorithm) {
            case 'bubble':
                await bubbleSort();
                break;
            case 'selection':
                await selectionSort();
                break;
            case 'insertion':
                await insertionSort();
                break;
            case 'merge':
                await mergeSort(0, array.length - 1);
                break;
            case 'quick':
                await quickSort(0, array.length - 1);
                break;
            case 'heap':
                await heapSort();
                break;
        }

        // If sorting completed without stopping, mark all bars as sorted
        if (!shouldStop) {
            const sortedIndices = array.map((_, i) => i);
            renderArray([], [], sortedIndices);
        }
    } catch (error) {
        // Catch the 'stopped' error and handle gracefully
        if (error.message !== 'stopped') {
            console.error('Sorting error:', error);
        }
    } finally {
        // Reset UI state regardless of completion or stop
        isSorting = false;
        shouldStop = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
        algorithmSelect.disabled = false;
    }
}

/**
 * Stops the current sorting process
 */
function stopSorting() {
    shouldStop = true; // Set flag to stop sorting
    stopBtn.disabled = true; // Disable stop button immediately
}

// ==================== SORTING ALGORITHMS ====================

/**
 * BUBBLE SORT ALGORITHM
 * Time Complexity: O(n²) average and worst case, O(n) best case
 * Space Complexity: O(1)
 * Repeatedly steps through the list, compares adjacent elements and swaps them if needed
 */
async function bubbleSort() {
    const n = array.length;
    // Outer loop: controls number of passes
    for (let i = 0; i < n - 1; i++) {
        checkStop(); // Check if user requested stop
        // Inner loop: compares adjacent elements
        for (let j = 0; j < n - i - 1; j++) {
            checkStop(); // Check if user requested stop
            
            comparisons++; // Increment comparison counter
            accesses += 2; // Two array accesses for comparison
            updateStats(); // Update statistics display
            
            // Highlight bars being compared
            renderArray([j, j + 1], [], []);
            await sleep(animationSpeed); // Pause for visualization
            
            // If elements are out of order, swap them
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]]; // Swap
                renderArray([], [j, j + 1], []); // Highlight swapped bars
                await sleep(animationSpeed); // Pause for visualization
            }
        }
    }
}

/**
 * SELECTION SORT ALGORITHM
 * Time Complexity: O(n²) for all cases
 * Space Complexity: O(1)
 * Finds minimum element and places it at the beginning
 */
async function selectionSort() {
    const n = array.length;
    // Outer loop: moves boundary of unsorted portion
    for (let i = 0; i < n - 1; i++) {
        checkStop(); // Check if user requested stop
        let minIdx = i; // Assume first element is minimum
        
        // Inner loop: find minimum element in unsorted portion
        for (let j = i + 1; j < n; j++) {
            checkStop(); // Check if user requested stop
            
            comparisons++; // Increment comparison counter
            accesses += 2; // Two array accesses for comparison
            updateStats(); // Update statistics display
            
            // Highlight current element and current minimum
            renderArray([j, minIdx], [], []);
            await sleep(animationSpeed); // Pause for visualization
            
            // Update minimum index if smaller element found
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        
        // Swap minimum element with first unsorted element
        if (minIdx !== i) {
            [array[i], array[minIdx]] = [array[minIdx], array[i]]; // Swap
            renderArray([], [i, minIdx], []); // Highlight swapped bars
            await sleep(animationSpeed); // Pause for visualization
        }
    }
}

/**
 * INSERTION SORT ALGORITHM
 * Time Complexity: O(n²) average and worst case, O(n) best case
 * Space Complexity: O(1)
 * Builds sorted array one element at a time by inserting elements in correct position
 */
async function insertionSort() {
    const n = array.length;
    // Loop through array starting from second element
    for (let i = 1; i < n; i++) {
        checkStop(); // Check if user requested stop
        let key = array[i]; // Element to be inserted
        let j = i - 1;
        
        // Move elements greater than key one position ahead
        while (j >= 0 && array[j] > key) {
            checkStop(); // Check if user requested stop
            
            comparisons++; // Increment comparison counter
            accesses += 2; // Two array accesses for comparison
            updateStats(); // Update statistics display
            
            // Highlight elements being compared
            renderArray([j, j + 1], [], []);
            await sleep(animationSpeed); // Pause for visualization
            
            array[j + 1] = array[j]; // Shift element to the right
            renderArray([], [j, j + 1], []); // Highlight shifted bars
            await sleep(animationSpeed); // Pause for visualization
            j--;
        }
        array[j + 1] = key; // Insert key at correct position
        accesses++; // One array access for insertion
    }
}

/**
 * MERGE SORT ALGORITHM
 * Time Complexity: O(n log n) for all cases
 * Space Complexity: O(n)
 * Divides array into halves, sorts them and merges back
 */
async function mergeSort(left, right) {
    if (left < right) {
        checkStop(); // Check if user requested stop
        const mid = Math.floor((left + right) / 2); // Find middle point
        await mergeSort(left, mid); // Sort first half
        await mergeSort(mid + 1, right); // Sort second half
        await merge(left, mid, right); // Merge sorted halves
    }
}

/**
 * Helper function to merge two sorted subarrays
 * @param {number} left - Starting index of left subarray
 * @param {number} mid - Ending index of left subarray
 * @param {number} right - Ending index of right subarray
 */
async function merge(left, mid, right) {
    // Create copies of subarrays
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left; // Initialize pointers
    
    // Merge arrays by comparing elements
    while (i < leftArr.length && j < rightArr.length) {
        checkStop(); // Check if user requested stop
        
        comparisons++; // Increment comparison counter
        accesses += 2; // Two array accesses for comparison
        updateStats(); // Update statistics display
        
        // Highlight elements being compared
        renderArray([left + i, mid + 1 + j], [], []);
        await sleep(animationSpeed); // Pause for visualization
        
        // Place smaller element in merged array
        if (leftArr[i] <= rightArr[j]) {
            array[k] = leftArr[i];
            i++;
        } else {
            array[k] = rightArr[j];
            j++;
        }
        renderArray([], [k], []); // Highlight placed element
        await sleep(animationSpeed); // Pause for visualization
        k++;
    }
    
    // Copy remaining elements from left subarray
    while (i < leftArr.length) {
        checkStop(); // Check if user requested stop
        array[k] = leftArr[i];
        accesses++; // One array access
        renderArray([], [k], []); // Highlight placed element
        await sleep(animationSpeed); // Pause for visualization
        i++;
        k++;
    }
    
    // Copy remaining elements from right subarray
    while (j < rightArr.length) {
        checkStop(); // Check if user requested stop
        array[k] = rightArr[j];
        accesses++; // One array access
        renderArray([], [k], []); // Highlight placed element
        await sleep(animationSpeed); // Pause for visualization
        j++;
        k++;
    }
}

/**
 * QUICK SORT ALGORITHM
 * Time Complexity: O(n log n) average case, O(n²) worst case
 * Space Complexity: O(log n) due to recursion
 * Selects pivot element and partitions array around it
 */
async function quickSort(low, high) {
    if (low < high) {
        checkStop(); // Check if user requested stop
        const pi = await partition(low, high); // Get partition index
        await quickSort(low, pi - 1); // Sort elements before partition
        await quickSort(pi + 1, high); // Sort elements after partition
    }
}

/**
 * Helper function to partition array for quick sort
 * @param {number} low - Starting index
 * @param {number} high - Ending index
 * @returns {number} - Partition index
 */
async function partition(low, high) {
    const pivot = array[high]; // Choose last element as pivot
    let i = low - 1; // Index of smaller element
    
    // Move elements smaller than pivot to left side
    for (let j = low; j < high; j++) {
        checkStop(); // Check if user requested stop
        
        comparisons++; // Increment comparison counter
        accesses += 2; // Two array accesses for comparison
        updateStats(); // Update statistics display
        
        // Highlight element being compared with pivot
        renderArray([j, high], [], []);
        await sleep(animationSpeed); // Pause for visualization
        
        // If current element is smaller than pivot
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
            renderArray([], [i, j], []); // Highlight swapped bars
            await sleep(animationSpeed); // Pause for visualization
        }
    }
    
    // Place pivot in correct position
    [array[i + 1], array[high]] = [array[high], array[i + 1]]; // Swap
    renderArray([], [i + 1, high], []); // Highlight swapped bars
    await sleep(animationSpeed); // Pause for visualization
    
    return i + 1; // Return partition index
}

/**
 * HEAP SORT ALGORITHM
 * Time Complexity: O(n log n) for all cases
 * Space Complexity: O(1)
 * Builds max heap and repeatedly extracts maximum element
 */
async function heapSort() {
    const n = array.length;
    
    // Build max heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        checkStop(); // Check if user requested stop
        await heapify(n, i); // Heapify subtree rooted at index i
    }
    
    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
        checkStop(); // Check if user requested stop
        
        // Move current root (maximum) to end
        [array[0], array[i]] = [array[i], array[0]]; // Swap
        renderArray([], [0, i], []); // Highlight swapped bars
        await sleep(animationSpeed); // Pause for visualization
        
        // Heapify reduced heap
        await heapify(i, 0);
    }
}

/**
 * Helper function to heapify a subtree rooted at index i
 * @param {number} n - Size of heap
 * @param {number} i - Root index of subtree
 */
async function heapify(n, i) {
    let largest = i; // Initialize largest as root
    const left = 2 * i + 1; // Left child index
    const right = 2 * i + 2; // Right child index
    
    // Check if left child exists and is greater than root
    if (left < n) {
        checkStop(); // Check if user requested stop
        
        comparisons++; // Increment comparison counter
        accesses += 2; // Two array accesses for comparison
        updateStats(); // Update statistics display
        
        // Highlight left child and current largest
        renderArray([left, largest], [], []);
        await sleep(animationSpeed); // Pause for visualization
        
        // Update largest if left child is greater
        if (array[left] > array[largest]) {
            largest = left;
        }
    }
    
    // Check if right child exists and is greater than largest so far
    if (right < n) {
        checkStop(); // Check if user requested stop
        
        comparisons++; // Increment comparison counter
        accesses += 2; // Two array accesses for comparison
        updateStats(); // Update statistics display
        
        // Highlight right child and current largest
        renderArray([right, largest], [], []);
        await sleep(animationSpeed); // Pause for visualization
        
        // Update largest if right child is greater
        if (array[right] > array[largest]) {
            largest = right;
        }
    }
    
    // If largest is not root, swap and recursively heapify
    if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]]; // Swap
        renderArray([], [i, largest], []); // Highlight swapped bars
        await sleep(animationSpeed); // Pause for visualization
        
        // Recursively heapify the affected subtree
        await heapify(n, largest);
    }
}

// Initialize the visualizer when page loads
generateArray(); // Generate initial random array
updateComplexityDisplay('bubble'); // Display bubble sort complexity by default