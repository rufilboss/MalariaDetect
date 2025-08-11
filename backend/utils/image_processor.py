import cv2
import numpy as np
from PIL import Image
import io
import logging
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        self.target_size = (128, 128)
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    
    def preprocess_image(self, image_data: bytes) -> bytes:
        """
        Preprocess image data for malaria classification
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Preprocessed image bytes
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize image
            image = image.resize(self.target_size, Image.Resampling.LANCZOS)
            
            # Apply basic image enhancement
            image = self._enhance_image(image)
            
            # Convert back to bytes
            output = io.BytesIO()
            image.save(output, format='PNG')
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise e
    
    def _enhance_image(self, image: Image.Image) -> Image.Image:
        """
        Apply image enhancement techniques
        """
        try:
            # Convert to numpy array
            img_array = np.array(image)
            
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
            lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            lab[:, :, 0] = clahe.apply(lab[:, :, 0])
            enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            
            # Apply slight Gaussian blur to reduce noise
            enhanced = cv2.GaussianBlur(enhanced, (3, 3), 0)
            
            # Convert back to PIL Image
            return Image.fromarray(enhanced)
            
        except Exception as e:
            logger.error(f"Error enhancing image: {str(e)}")
            return image  # Return original if enhancement fails
    
    def validate_image(self, image_data: bytes) -> Tuple[bool, str]:
        """
        Validate uploaded image
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # Check file format
            if image.format.lower() not in ['jpeg', 'jpg', 'png', 'bmp', 'tiff']:
                return False, f"Unsupported image format: {image.format}"
            
            # Check image size
            if image.size[0] < 50 or image.size[1] < 50:
                return False, "Image too small (minimum 50x50 pixels)"
            
            if image.size[0] > 5000 or image.size[1] > 5000:
                return False, "Image too large (maximum 5000x5000 pixels)"
            
            # Check file size (max 10MB)
            if len(image_data) > 10 * 1024 * 1024:
                return False, "Image file too large (maximum 10MB)"
            
            return True, "Image is valid"
            
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
    
    def extract_image_metadata(self, image_data: bytes) -> dict:
        """
        Extract metadata from image
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary containing image metadata
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            
            metadata = {
                "format": image.format,
                "mode": image.mode,
                "size": image.size,
                "width": image.size[0],
                "height": image.size[1],
                "file_size_bytes": len(image_data)
            }
            
            # Extract EXIF data if available
            if hasattr(image, '_getexif') and image._getexif():
                exif = image._getexif()
                if exif:
                    metadata["exif"] = {
                        "datetime": exif.get(36867),  # DateTime
                        "make": exif.get(271),        # Make
                        "model": exif.get(272),       # Model
                        "software": exif.get(305)     # Software
                    }
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting image metadata: {str(e)}")
            return {"error": str(e)}
    
    def create_thumbnail(self, image_data: bytes, size: Tuple[int, int] = (64, 64)) -> bytes:
        """
        Create a thumbnail of the image
        
        Args:
            image_data: Raw image bytes
            size: Thumbnail size (width, height)
            
        Returns:
            Thumbnail image bytes
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            image.thumbnail(size, Image.Resampling.LANCZOS)
            
            output = io.BytesIO()
            image.save(output, format='PNG')
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error creating thumbnail: {str(e)}")
            raise e 