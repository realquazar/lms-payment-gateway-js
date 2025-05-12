import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config({});

// check and load env variables

cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});

export const uploadMedia = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "auto"
        });
        return uploadResponse
    } catch (error) {
        console.log("error in uploading media");
        console.log(error);        
    }
}

export const deleteMediaFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log("Failed to delete media from cloudinary");        
        console.error(error);
    }
}

export const deleteVideoFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id, {resource_type: "video"});
    } catch (error) {
        console.log("Failed to delete media from cloudinary");        
        console.error(error);
    }
}