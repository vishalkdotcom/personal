import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/images/projects');
const outputDir = path.join(__dirname, '../static/images/optimized');
const cacheFile = path.join(outputDir, '.optimization-cache.json');

// Configuration
const CONCURRENCY = Math.max(2, Math.min(8, os.cpus().length));
const sizes = [400, 800, 1200, 1600];
const formats = ['avif', 'webp', 'jpeg'];
const qualities = { avif: 75, webp: 75, jpeg: 80 }; // Slightly lower quality for better performance

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load cache
let cache = {};
if (fs.existsSync(cacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  } catch (error) {
    console.warn('⚠️ Could not load optimization cache, starting fresh');
    cache = {};
  }
}

function getFileHash(filePath) {
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath);
  return createHash('md5')
    .update(content)
    .update(stats.mtime.toISOString())
    .digest('hex');
}

function needsOptimization(inputPath, filename) {
  const hash = getFileHash(inputPath);
  const cacheKey = filename;
  
  // Check if file was processed with same hash
  if (cache[cacheKey] && cache[cacheKey].hash === hash) {
    // Verify all output files exist
    const name = path.parse(filename).name;
    const allExist = sizes.every(size => 
      formats.every(format => {
        const outputPath = path.join(outputDir, `${name}-${size}.${format}`);
        return fs.existsSync(outputPath);
      })
    );
    
    if (allExist) {
      return false; // Skip, already optimized
    }
  }
  
  return true; // Needs optimization
}

async function optimizeImageVariant(inputPath, filename, size, format) {
  const name = path.parse(filename).name;
  const outputPath = path.join(outputDir, `${name}-${size}.${format}`);
  
  // Skip if output file already exists and is newer than input
  if (fs.existsSync(outputPath)) {
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    if (outputStats.mtime > inputStats.mtime) {
      return { skipped: true, path: outputPath };
    }
  }
  
  const sharpInstance = sharp(inputPath, {
    // Optimize Sharp settings for performance
    sequentialRead: true,
    limitInputPixels: false
  });
  
  // Get metadata once
  const metadata = await sharpInstance.metadata();
  
  // Skip if image is smaller than target size
  if (metadata.width && metadata.width <= size) {
    if (format === 'jpeg' && (inputPath.endsWith('.jpg') || inputPath.endsWith('.jpeg'))) {
      // Just copy original if it's already JPEG and smaller
      fs.copyFileSync(inputPath, outputPath);
      return { copied: true, path: outputPath };
    }
  }
  
  await sharpInstance
    .resize(size, null, { 
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3 // Faster than default
    })
    .toFormat(format, {
      quality: qualities[format],
      effort: format === 'avif' ? 4 : undefined, // Reduced effort for speed
      progressive: format === 'jpeg',
      optimiseScans: format === 'jpeg'
    })
    .toFile(outputPath);
    
  return { generated: true, path: outputPath };
}

async function optimizeImage(inputPath, filename) {
  const name = path.parse(filename).name;
  const tasks = [];
  
  // Create all variant tasks
  for (const size of sizes) {
    for (const format of formats) {
      tasks.push({ size, format });
    }
  }
  
  // Process variants in batches for memory efficiency
  const batchSize = 4;
  const results = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchPromises = batch.map(({ size, format }) => 
      optimizeImageVariant(inputPath, filename, size, format)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  // Update cache
  const hash = getFileHash(inputPath);
  cache[filename] = { 
    hash, 
    timestamp: Date.now(),
    variants: results.length
  };
  
  return results;
}

async function processImagesInBatches(files) {
  const totalFiles = files.length;
  let processed = 0;
  let skipped = 0;
  let generated = 0;
  
  console.log(`📁 Found ${totalFiles} images to process with ${CONCURRENCY} concurrent workers`);
  
  const startTime = Date.now();
  
  // Process files in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    
    const promises = batch.map(async (file) => {
      const inputPath = path.join(inputDir, file);
      
      if (!needsOptimization(inputPath, file)) {
        console.log(`⏩ Skipping ${file} (already optimized)`);
        skipped++;
        return { skipped: true };
      }
      
      console.log(`🔄 Processing: ${file}`);
      const results = await optimizeImage(inputPath, file);
      
      const fileGenerated = results.filter(r => r.generated || r.copied).length;
      generated += fileGenerated;
      
      console.log(`✅ ${file}: ${fileGenerated} variants created`);
      processed++;
      
      return { processed: true, variants: fileGenerated };
    });
    
    await Promise.all(promises);
    
    // Progress update
    const currentProgress = Math.min(i + CONCURRENCY, totalFiles);
    const elapsed = Date.now() - startTime;
    const rate = currentProgress / (elapsed / 1000);
    const eta = totalFiles > currentProgress ? ((totalFiles - currentProgress) / rate) : 0;
    
    console.log(`📊 Progress: ${currentProgress}/${totalFiles} files (${Math.round(rate * 10) / 10} files/sec, ETA: ${Math.round(eta)}s)`);
  }
  
  return { processed, skipped, generated, totalFiles };
}

async function processAllImages() {
  console.log('🖼️ Starting optimized image processing...');
  
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpe?g|png|webp)$/i.test(file));
  
  if (files.length === 0) {
    console.log('No images found to process');
    return;
  }
  
  const startTime = Date.now();
  const { processed, skipped, generated, totalFiles } = await processImagesInBatches(files);
  
  // Save cache
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  
  const totalTime = Date.now() - startTime;
  const avgTimePerFile = totalTime / totalFiles;
  
  console.log('✨ Image optimization complete!');
  console.log(`📈 Stats: ${processed} processed, ${skipped} skipped, ${generated} variants generated`);
  console.log(`⏱️ Time: ${Math.round(totalTime / 100) / 10}s total (${Math.round(avgTimePerFile)}ms/file avg)`);
  
  if (generated > 0) {
    console.log(`💾 Cache saved with ${Object.keys(cache).length} entries`);
  }
}

// Ensure Sharp is properly configured for performance
sharp.cache(false); // Disable Sharp's cache to manage memory better
sharp.concurrency(CONCURRENCY);

processAllImages().catch(console.error);