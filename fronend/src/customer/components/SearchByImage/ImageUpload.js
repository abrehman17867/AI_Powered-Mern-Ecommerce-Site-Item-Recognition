import React, { useState } from 'react';
import axios from 'axios';
import { api } from '../../../config/apiConfig';

function ImageUpload() {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState('');
    const [imageName, setImageName] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/api/search_by_image/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Prediction:', response.data.prediction);
            console.log('Uploaded Image:', response.data.imageName);
        } catch (error) {
            console.error('Error uploading the file', error);
        }
    };

    return (
        <div>
            <h1>Image Upload and Prediction</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {/* {prediction && <p>Prediction: {prediction}</p>}
            {imageName && <p>Uploaded Image: {imageName}</p>} */}
        </div>
    );
}

export default ImageUpload;
