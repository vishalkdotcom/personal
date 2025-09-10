import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/images/projects');
const outputDir = path.join(__dirname, '../static/images/optimized');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [400, 800, 1200, 1600];
const formats = ['avif', 'webp', 'jpeg'];
const qualities = { avif: 80, webp: 80, jpeg: 85 };

async function optimizeImage(inputPath, filename) {
  const name = path.parse(filename).name;
  
  for (const size of sizes) {
    for (const format of formats) {
      const outputPath = path.join(outputDir, `${name}-${size}.${format}`);
      
      try {
        await sharp(inputPath)
          .resize(size, null, { withoutEnlargement: true })
          .toFormat(format, { 
            quality: qualities[format],
            effort: format === 'avif' ? 6 : undefined
          })
          .toFile(outputPath);
        
        console.log(`✅ Generated: ${name}-${size}.${format}`);
      } catch (error) {
        console.error(`❌ Error processing ${filename} to ${format}:`, error.message);
      }
    }
  }
}

async function processAllImages() {
  console.log('🖼️ Starting image optimization...');
  
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpe?g|png|webp)$/i.test(file));
  
  console.log(`📁 Found ${files.length} images to process`);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    console.log(`🔄 Processing: ${file}`);
    await optimizeImage(inputPath, file);
  }
  
  console.log('✨ Image optimization complete!');
}

processAllImages().catch(console.error);