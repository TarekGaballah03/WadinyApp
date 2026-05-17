import detenv from "dotenv"
import path from 'path'
detenv.config({path:path.resolve("src/config/.env")})
import { v2 as cloudinary } from 'cloudinary';


    // Configuration
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,     
  api_secret: process.env.CLOUDINARY_API_SECRET, 
  secure: true
    });
export default cloudinary