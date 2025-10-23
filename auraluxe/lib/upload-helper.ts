import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Compression failed:', error);
    return file;
  }
}

export async function uploadProductImages(
  productName: string,
  files: {
    mainImage?: File;
    albumImages?: File[];
    view360Images?: File[];
    video?: File;
  },
  onProgress?: (progress: number) => void
) {
  const folderName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const urls: {
    mainImage?: string;
    albumImages?: string[];
    view360Images?: string[];
    videoUrl?: string;
  } = {};

  let totalFiles = 0;
  let uploadedFiles = 0;

  if (files.mainImage) totalFiles++;
  if (files.albumImages) totalFiles += files.albumImages.length;
  if (files.view360Images) totalFiles += files.view360Images.length;
  if (files.video) totalFiles++;

  const updateProgress = () => {
    uploadedFiles++;
    if (onProgress) {
      onProgress(Math.round((uploadedFiles / totalFiles) * 100));
    }
  };

  // Upload main image
  if (files.mainImage) {
    const compressed = await compressImage(files.mainImage);
    const ext = compressed.name.split('.').pop();
    const path = `${folderName}/main.${ext}`;
    
    const { data, error } = await supabase.storage
      .from('productimg')
      .upload(path, compressed, { upsert: true });

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('productimg')
      .getPublicUrl(path);
    
    urls.mainImage = urlData.publicUrl;
    updateProgress();
  }

  // Upload album images
  if (files.albumImages && files.albumImages.length > 0) {
    urls.albumImages = [];
    for (let i = 0; i < files.albumImages.length; i++) {
      const compressed = await compressImage(files.albumImages[i]);
      const ext = compressed.name.split('.').pop();
      const path = `${folderName}/album/${i + 1}.${ext}`;
      
      const { error } = await supabase.storage
        .from('productimg')
        .upload(path, compressed, { upsert: true });

      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('productimg')
        .getPublicUrl(path);
      
      urls.albumImages.push(urlData.publicUrl);
      updateProgress();
    }
  }

  // Upload 360 images
  if (files.view360Images && files.view360Images.length > 0) {
    urls.view360Images = [];
    for (let i = 0; i < files.view360Images.length; i++) {
      const compressed = await compressImage(files.view360Images[i]);
      const ext = compressed.name.split('.').pop();
      const path = `${folderName}/360/${i + 1}.${ext}`;
      
      const { error } = await supabase.storage
        .from('productimg')
        .upload(path, compressed, { upsert: true });

      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('productimg')
        .getPublicUrl(path);
      
      urls.view360Images.push(urlData.publicUrl);
      updateProgress();
    }
  }

  // Upload video
  if (files.video) {
    const ext = files.video.name.split('.').pop();
    const path = `${folderName}/video/product.${ext}`;
    
    const { error } = await supabase.storage
      .from('productimg')
      .upload(path, files.video, { upsert: true });

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('productimg')
      .getPublicUrl(path);
    
    urls.videoUrl = urlData.publicUrl;
    updateProgress();
  }

  return urls;
}
