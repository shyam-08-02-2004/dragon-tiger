import { Jimp } from "jimp";

async function cropImage() {
  try {
    const imagePath = "C:\\Users\\shyam\\.gemini\\antigravity\\brain\\d5a0698f-935b-4b57-a145-6080ce878e53\\media__1780950688401.jpg";
    const image = await Jimp.read(imagePath);
    
    // Original dimensions: 682 x 1024
    // We want to remove the header (say top 90px)
    // We want to remove the bottom part (chips, history, footer).
    // Let's guess the table ends around y=650.
    const cropX = 0;
    const cropY = 95; // remove header
    const cropWidth = 682;
    const cropHeight = 540; // 95 to 635
    
    image.crop({ x: cropX, y: cropY, w: cropWidth, h: cropHeight });
    await image.write("c:\\dragonTiger\\src\\assets\\dealer_girl_bg.png");
    console.log("Image successfully cropped and saved.");
  } catch (err) {
    console.error(err);
  }
}

cropImage();
