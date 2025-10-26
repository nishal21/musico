const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    const svgPath = path.join(__dirname, '../public/icon.png');
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/icon-192.png'));

    // Generate 512x512 icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/icon-512.png'));

    console.log('✅ PWA icons generated successfully!');
    console.log('📱 Your app is now PWA-ready!');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('💡 Make sure you have sharp installed: npm install sharp --save-dev');
  }
}

generateIcons();