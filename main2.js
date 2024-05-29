import './style.css';

const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Load the top image
const topImage = new Image();
topImage.src = 'front.png'; // Replace with the path to your top image

topImage.onload = function() {
    // Draw the top image on the canvas
    ctx.drawImage(topImage, 0, 0, canvas.width, canvas.height);

    // Set up event listeners for mouse and touch events
    canvas.addEventListener('mousemove', handleScratch);
    canvas.addEventListener('touchmove', handleScratch);
};

topImage.onerror = function() {
    console.error('Failed to load top image');
};

// Load the scratch texture
const scratchTexture = new Image();
scratchTexture.src = 'mask.png'; // Replace with the path to your scratch texture

scratchTexture.onload = function() {
    console.log('Scratch texture loaded successfully');
};

scratchTexture.onerror = function() {
    console.error('Failed to load scratch texture');
};

let lastX, lastY;
let inProgress = true;

function handleScratch(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX || event.touches[0].clientX) - rect.left;
    const y = (event.clientY || event.touches[0].clientY) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';

    // If this is the first move event, set the last coordinates to the current coordinates
    if (lastX === undefined || lastY === undefined) {
        lastX = x;
        lastY = y;
    }

    // Calculate distance and angle
    const distance = Math.hypot(x - lastX, y - lastY);
    const angle = Math.atan2(y - lastY, x - lastX);

    // Draw the texture along the line
    for (let i = 0; i < distance; i += scratchTexture.width / 4) { // Adjust the step size as needed
        const offsetX = Math.cos(angle) * i;
        const offsetY = Math.sin(angle) * i;
        ctx.drawImage(scratchTexture, x - offsetX - scratchTexture.width / 2, y - offsetY - scratchTexture.height / 2);
    }

    lastX = x;
    lastY = y;

    // Check if the scratching is completed
    checkCompletion();
}

function checkCompletion() {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 0) {
            count++;
        }
    }

    const percentage = (count / (canvas.width * canvas.height)) * 100;

    if (percentage < 75) { // Adjust the percentage as needed
        if (inProgress) {
            onScratchComplete();
        }
    }
}

function onScratchComplete() {
    inProgress = false;
    const element = document.querySelector('.button');
    if (element) {
        element.id = 'show';
        /* element.addEventListener('click', () => {
            window.location.href = 'https://betboom.ru';
        }); */
    } else {
        console.error('Element with class "button" not found.');
    }
}
