const fs = require('fs');

const fileBuffer = fs.readFileSync('C:\\Users\\shyam\\.gemini\\antigravity\\brain\\d5a0698f-935b-4b57-a145-6080ce878e53\\media__1780950688401.jpg');

// Read the first few bytes to find the JPEG headers and extract dimensions
let i = 0;
while (i < fileBuffer.length) {
    if (fileBuffer[i] == 0xFF && (fileBuffer[i+1] == 0xC0 || fileBuffer[i+1] == 0xC2)) {
        let height = fileBuffer[i+5]*256 + fileBuffer[i+6];
        let width = fileBuffer[i+7]*256 + fileBuffer[i+8];
        console.log(`Dimensions: ${width}x${height}`);
        break;
    }
    i++;
}
