const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, 'frontend', 'public', 'Landing.png');
const svgPath = path.join(__dirname, 'frontend', 'public', 'Landing.svg');

try {
  if (fs.existsSync(pngPath)) {
    const pngBuffer = fs.readFileSync(pngPath);
    
    // Parse PNG dimensions directly from IHDR chunk (standard bytes 16-23)
    const width = pngBuffer.readUInt32BE(16);
    const height = pngBuffer.readUInt32BE(20);
    console.log(`Image dimensions parsed: ${width}x${height}`);

    const base64String = pngBuffer.toString('base64');
    
    // Construct the SVG wrapper matching the EXACT dimensions of the PNG
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <image width="100%" height="100%" href="data:image/png;base64,${base64String}"/>
</svg>`;
    
    fs.writeFileSync(svgPath, svgContent, 'utf8');
    console.log('✔ Successfully wrapped Landing.png into Landing.svg!');
    console.log('SVG Size: ' + (fs.statSync(svgPath).size / 1024).toFixed(2) + ' KB');
  } else {
    console.error('Error: Landing.png not found at ' + pngPath);
  }
} catch (err) {
  console.error('Conversion error:', err.message);
}
