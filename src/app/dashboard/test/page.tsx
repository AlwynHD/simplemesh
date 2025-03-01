"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { textureGeneration } from "@/components/actions/featuresActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TextureGenerationTest() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [pipelineType, setPipelineType] = useState<"stage1" | "UV_only">("stage1");
  const [seed, setSeed] = useState<number>(40);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a 3D mesh file (.obj)");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    
    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('mesh', file);
      }
      
      if (prompt) {
        formData.append('prompt', prompt);
      }
      
      formData.append('pipeline_type', pipelineType);
      
      if (seed !== undefined) {
        formData.append('seed', seed.toString());
      }
      
      const response = await textureGeneration(formData);
      
      setResult("Texture generated successfully! Result: " + JSON.stringify(response));
    } catch (err: any) {
      setError(err.message || "Failed to generate texture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Texture Generation Test</CardTitle>
          <CardDescription>
            Upload a 3D mesh (.obj file) and generate textures using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mesh">3D Mesh File (.obj)</Label>
              <Input 
                id="mesh" 
                type="file" 
                accept=".obj"
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
              {file && <p className="text-sm text-green-600">File selected: {file.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt">Texture Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Sci-Fi digital painting, colorful, high quality"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pipeline">Pipeline Type</Label>
              <Select value={pipelineType} onValueChange={(value) => setPipelineType(value as "stage1" | "UV_only")}>
                <SelectTrigger id="pipeline">
                  <SelectValue placeholder="Select pipeline type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage1">Stage 1</SelectItem>
                  <SelectItem value="UV_only">UV Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seed">Random Seed</Label>
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value))}
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Texture"}
            </Button>
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
            <p className="font-medium">Note:</p>
            <p>This process may take several minutes to complete, depending on the complexity of your mesh and the requested texture.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}