import sharp from 'sharp';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cpus } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/images/projects');
const outputDir = path.join(__dirname, '../static/images/optimized');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  await fs.mkdir(outputDir, { recursive: true });
}

const sizes = [400, 800, 1200, 1600];
const formats = ['avif', 'webp', 'jpeg'];
const qualities = { avif: 80, webp: 80, jpeg: 85 };

// Performance optimizations
const MAX_CONCURRENT = Math.min(cpus().length, 8); // Limit concurrent operations
const processedFiles = new Set(); // Track processed files to avoid duplicates

async function getImageMetadata(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    return metadata;
  } catch (error) {
    console.warn(`⚠️ Could not read metadata for ${inputPath}: ${error.message}`);
    return null;
  }
}

async function isOptimizationNeeded(inputPath, outputPath, inputStats) {
  try {
    const outputStats = await fs.stat(outputPath);
    // Skip if output is newer than input
    return inputStats.mtime > outputStats.mtime;
  } catch {
    // Output doesn't exist, needs optimization
    return true;
  }
}

async function optimizeImageVariant(inputPath, filename, size, format, metadata, inputStats) {
  const name = path.parse(filename).name;
  const outputPath = path.join(outputDir, `${name}-${size}.${format}`);
  
  // Skip if file already processed and up-to-date
  if (!(await isOptimizationNeeded(inputPath, outputPath, inputStats))) {
    return { skipped: true, path: outputPath };
  }

  // Skip if original is smaller than target size
  if (metadata && metadata.width && metadata.width < size) {
    return { skipped: true, reason: 'smaller than target' };
  }

  try {
    const sharpInstance = sharp(inputPath)
      .resize(size, null, { 
        withoutEnlargement: true,
        fastShrinkOnLoad: true
      });

    // Optimize format-specific settings
    const formatOptions = {
      quality: qualities[format],
    };

    if (format === 'avif') {
      formatOptions.effort = 4; // Reduced from 6 for better performance
    } else if (format === 'webp') {
      formatOptions.effort = 4; // Add effort setting for WebP
    } else if (format === 'jpeg') {
      formatOptions.mozjpeg = true; // Use mozjpeg for better compression
    }

    await sharpInstance
      .toFormat(format, formatOptions)
      .toFile(outputPath);
    
    return { success: true, path: outputPath };
  } catch (error) {
    return { error: error.message, path: outputPath };
  }
}

async function optimizeImage(inputPath, filename, inputStats) {
  const metadata = await getImageMetadata(inputPath);
  const tasks = [];
  
  for (const size of sizes) {
    for (const format of formats) {
      tasks.push(optimizeImageVariant(inputPath, filename, size, format, metadata, inputStats));
    }
  }
  
  // Process all variants concurrently for this image
  const results = await Promise.allSettled(tasks);
  
  let successful = 0, skipped = 0, failed = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const res = result.value;
      if (res.success) {
        successful++;
      } else if (res.skipped) {
        skipped++;
      } else if (res.error) {
        failed++;
        const size = sizes[Math.floor(index / formats.length)];
        const format = formats[index % formats.length];
        console.error(`❌ Error processing ${filename} (${size}px, ${format}): ${res.error}`);
      }
    } else {
      failed++;
      console.error(`❌ Task failed for ${filename}:`, result.reason);
    }
  });
  
  return { filename, successful, skipped, failed, total: tasks.length };
}

async function processAllImages() {
  const startTime = Date.now();
  console.log('🖼️ Starting optimized image processing...');
  
  try {
    const files = (await fs.readdir(inputDir))
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file));
    
    console.log(`📁 Found ${files.length} images to process`);
    console.log(`🚀 Using ${MAX_CONCURRENT} concurrent workers`);
    
    // Get file stats for all images upfront
    const imageData = await Promise.all(
      files.map(async (file) => {
        const inputPath = path.join(inputDir, file);
        const stats = await fs.stat(inputPath);
        return { file, inputPath, stats };
      })
    );

    // Process images in batches with concurrency control
    const results = [];
    for (let i = 0; i < imageData.length; i += MAX_CONCURRENT) {
      const batch = imageData.slice(i, i + MAX_CONCURRENT);
      const batchPromises = batch.map(({ file, inputPath, stats }) => {
        console.log(`🔄 Processing: ${file}`);
        return optimizeImage(inputPath, file, stats);
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Progress update
      const processed = Math.min(i + MAX_CONCURRENT, imageData.length);
      console.log(`📊 Progress: ${processed}/${imageData.length} images processed`);
    }
    
    // Summary
    const totalStats = results.reduce((acc, result) => ({
      successful: acc.successful + result.successful,
      skipped: acc.skipped + result.skipped,
      failed: acc.failed + result.failed,
      total: acc.total + result.total
    }), { successful: 0, skipped: 0, failed: 0, total: 0 });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('✨ Image optimization complete!');
    console.log(`📈 Results: ${totalStats.successful} generated, ${totalStats.skipped} skipped, ${totalStats.failed} failed`);
    console.log(`⏱️ Completed in ${duration}s`);
    
    if (totalStats.failed > 0) {
      console.warn(`⚠️ ${totalStats.failed} operations failed - check logs above`);
    }
    
  } catch (error) {
    console.error('💥 Fatal error during image optimization:', error);
    process.exit(1);
  }
}

processAllImages().catch(console.error);