"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeModelMetadata } from "@/components/actions/featuresActions";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MetadataGeneratorTest() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Sample data - in a real app these would come from context or params
  const sampleUserId = "7ad2e627-da52-4f81-862d-cd5f0efd1edf";
  const sampleModelId = "sample-model-457";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile || !imagePreview) {
      setError("Please select an image");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the server action with the base64 image data
      await storeModelMetadata(
        sampleUserId,
        sampleModelId,
        imagePreview
      );
      
      setResult("Metadata successfully generated and stored!");
    } catch (err) {
      console.error("Error storing metadata:", err);
      setError(`Failed to store metadata: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Image Metadata Generator</h1>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Upload Image for Metadata Generation</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="image-upload">Upload an image</Label>
              <Input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="mt-2"
              />
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Image Preview</h3>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-64 rounded-md border border-gray-200"
                />
              </div>
            )}
            
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isLoading || !imageFile}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating metadata...
                  </>
                ) : (
                  "Generate Metadata"
                )}
              </Button>
            </div>
          </form>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {result && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{result}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Using sample data:</p>
            <p>User ID: {sampleUserId}</p>
            <p>Model ID: {sampleModelId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}