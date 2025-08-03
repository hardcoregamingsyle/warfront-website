interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  cloudName?: string;
}

export function CloudinaryImage({ 
  publicId, 
  alt, 
  width, 
  height, 
  className,
  cloudName = "your-cloud-name" // Replace with your actual cloud name
}: CloudinaryImageProps) {
  // Build Cloudinary URL manually for now
  let transformations = "f_auto,q_auto";
  
  if (width && height) {
    transformations += `,w_${width},h_${height},c_fit`;
  }
  
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;

  return (
    <img 
      src={cloudinaryUrl} 
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}