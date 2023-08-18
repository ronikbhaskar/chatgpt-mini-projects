const imageInput = document.getElementById('imageInput');
const imageContainer = document.getElementById('imageContainer');
const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const canvas3 = document.getElementById('canvas3');
const loading = document.getElementById("loading");
const canvases = [canvas1, canvas2, canvas3];
const randomnessSlider = document.getElementById("randomnessSlider");
const randDisp = document.getElementById("rand");
const frequencyThreshold = document.getElementById("frequencyThreshold");
const freqDisp = document.getElementById("freq");
const WIDTH = 256;
const HEIGHT = 256;

randDisp.innerText = ` ${randomnessSlider.value}`;
      
randomnessSlider.oninput = function() {
    randDisp.innerText = ` ${randomnessSlider.value}`;
}

freqDisp.innerText = ` ${Number(frequencyThreshold.value) - 128}`;
      
frequencyThreshold.oninput = function() {
    freqDisp.innerText = ` ${Number(frequencyThreshold.value) - 128}`;
}

for (let i = 0; i < canvases.length; i++) {
    canvases[i].addEventListener("click", (event) => {
        event.preventDefault();
        const dataURL = canvases[i].toDataURL('image/jpeg'); // Change to 'image/jpeg' for JPEG format
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'markov-image.jpg'; // Change the filename as needed
        link.click();
    });
}

imageInput.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            const image = new Image();
            image.src = e.target.result;
            image.onload = function() {
                displayImage(image);
                //   drawImageOnCanvas(image);
                const values = getCenterSquare(image);
                const rs = values[0];
                const gs = values[1];
                const bs = values[2];
                // let pixelValues = readImagePixelValues(image);
                for (let i = 0; i < canvases.length; i++) {
                    let indexMatrix = randomChains(
                        WIDTH, 
                        HEIGHT, 
                        (10000 - Number(randomnessSlider.value)) / 10000, 
                        Number(frequencyThreshold.value),
                        Number(frequencyThreshold.value),
                    );

                    let newRs = copyArray(rs);
                    newRs = markovFourier(newRs, indexMatrix);

                    let newGs = copyArray(gs);
                    newGs = markovFourier(newGs, indexMatrix);

                    let newBs = copyArray(bs);
                    newBs = markovFourier(newBs, indexMatrix);

                    drawPixelValuesToCanvas(newRs, newGs, newBs, canvases[i]);
                }
            };
            URL.revokeObjectURL(reader.src);
        };
    }
    imageInput.value = "";
}

function copyArray(currentArray) {
    const newArray = [];

    for (var i = 0; i < currentArray.length; i++)
        newArray[i] = currentArray[i].slice();

    return newArray;
}

/* apparently, this has some stupid mutation side effects on data */
function markovFourier(data, indexMatrix) {
    const fft = chainMatrix(transpose(data.map(cfft)).map(cfft), indexMatrix);
    const ifft = transpose(fft.map(icfft)).map(icfft);
    return ifft.map(row => row.map(x => Math.round(x.re)));
}

function displayImage(image) {
    imageContainer.innerHTML = '';
    const imgElement = document.createElement('img');
    imgElement.src = image.src;
    imgElement.style.maxWidth = '100%';
    imgElement.style.height = 'auto';
    imageContainer.appendChild(imgElement);
}

function getCenterSquare(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // Calculate dimensions for the center square
    const minSide = Math.min(image.width, image.height);
    const centerX = (image.width - minSide) / 2;
    const centerY = (image.height - minSide) / 2;
  
    // Clear canvas and draw the center square
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx.drawImage(image, centerX, centerY, minSide, minSide, 0, 0, WIDTH, HEIGHT);

    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const rs = [];
    const gs = [];
    const bs = [];

    for (let y = 0; y < canvas.height; y++) {
        const rRow = [];
        const gRow = [];
        const bRow = [];
        for (let x = 0; x < canvas.width; x++) {
            const offset = (y * canvas.width + x) * 4;
            const red = pixelData[offset];
            const green = pixelData[offset + 1];
            const blue = pixelData[offset + 2];
            rRow.push(red);
            gRow.push(green);
            bRow.push(blue);
        }
        rs.push(rRow);
        gs.push(gRow);
        bs.push(bRow);
    }
  
    return [rs, gs, bs];
}

function drawPixelValuesToCanvas(rs, gs, bs, canvas) {
    const ctx = canvas.getContext('2d');
  
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
  
    const imageData = ctx.createImageData(WIDTH, HEIGHT);
  
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const red = minmax((rs[y][x] + 255) % 256, 0, 255);
            const green = minmax((gs[y][x] + 255) % 256, 0, 255);
            const blue = minmax((bs[y][x] + 255) % 256, 0, 255);
            const offset = (y * WIDTH + x) * 4;
    
            imageData.data[offset] = red;
            imageData.data[offset + 1] = green;
            imageData.data[offset + 2] = blue;
            imageData.data[offset + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

/* bounds val between min and max, also floors val */
function minmax(val, minimum, maximum) {
    return Math.min(Math.max(Math.floor(val), minimum), maximum);
}
