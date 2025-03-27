'use client';

import { useState, useRef } from 'react';

export default function LowPolyMeshOptimiser() {
  const [file, setFile] = useState<File | null>(null);
  const [optimizationLevel, setOptimizationLevel] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultUrl(null); // Reset result when new file is selected
    }
  };
  
  const handleOptimize = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Mock optimization process
    // In a real application, you would send the file to your backend
    // for processing or use a WebAssembly library to process it in the browser
    setTimeout(() => {
      setIsProcessing(false);
      // Create a fake result URL - in a real app this would be the URL to download the optimized mesh
      setResultUrl('#optimized-model');
    }, 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Low Poly Mesh Optimiser</h1>
      <p className="mb-6">
        Upload a 3D model to reduce its polygon count while preserving its appearance.
      </p>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload your 3D model</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".obj,.stl,.fbx,.glb,.gltf"
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {file.name}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Optimization Level: {optimizationLevel}%
          </label>
          <input
            type="range"
            min="10"
            max="90"
            value={optimizationLevel}
            onChange={(e) => setOptimizationLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Higher Quality</span>
            <span>Smaller File Size</span>
          </div>
        </div>
        
        <button
          onClick={handleOptimize}
          disabled={!file || isProcessing}
          className={`px-4 py-2 rounded-md font-medium ${
            !file || isProcessing
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Optimize Mesh'}
        </button>
      </div>
      
      {isProcessing && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Optimizing your mesh...</p>
        </div>
      )}
      
      {resultUrl && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-bold mb-2">Optimization Complete!</h2>
          <p className="mb-4">Your model has been successfully optimized.</p>
          <div className="bg-gray-200 h-64 flex items-center justify-center mb-4 rounded-lg">
            <p className="text-gray-500">3D preview would appear here</p>
          </div>
          <a
            href={resultUrl}
            download="optimized-model.obj"
            className="inline-block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Download Optimized Model
          </a>
        </div>
      )}
    </div>
  );
}