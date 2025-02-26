"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Eye, Download, Trash2, Search, Star, Grid3X3, Loader, Square } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { listUserModels } from "@/components/actions/featuresActions"
import Image from "next/image"
import { createThumbnailGenerator } from '@/utils/ThumbnailGenerator';
import { cn } from "@/lib/utils"

interface Model {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  favorite: boolean;
  thumbnailUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const [imgError, setImgError] = useState<{ [key: string]: boolean }>({});
  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const result = await listUserModels();
        if (result.error) {
          setError(result.error);
        } else if (result.models) {
          // Get saved favorites from localStorage
          const savedFavorites = JSON.parse(localStorage.getItem('modelFavorites') || '{}');

          // Apply saved favorite status to models
          const modelsWithFavorites = result.models.map(model => ({
            ...model,
            favorite: savedFavorites[model.id] || model.favorite || false,
            // Convert GLB URL to potential thumbnail URL
            thumbnailUrl: model.url.replace('/models/', '/thumbnails/').replace('.glb', '.jpg')
            
          }));
          
          setModels(modelsWithFavorites);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load models");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Filter models based on current tab and search query
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      currentTab === "all" ||
      (currentTab === "favorites" && model.favorite);

    return matchesSearch && matchesTab;
  });

  const handleDeleteModel = (modelId: string) => {
    setModels(models.filter(model => model.id !== modelId));
    setDeleteDialogOpen(false);
    // In a real implementation, you would call a server action to delete from S3
  };

  const handleToggleFavorite = (modelId: string) => {
    const updatedModels = models.map(model =>
      model.id === modelId ? { ...model, favorite: !model.favorite } : model
    );

    setModels(updatedModels);

    // Save to localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('modelFavorites') || '{}');
    const model = updatedModels.find(m => m.id === modelId);

    if (model) {
      savedFavorites[modelId] = model.favorite;
      localStorage.setItem('modelFavorites', JSON.stringify(savedFavorites));
    }
  };

  const handleImageError = async (modelId: string) => {
    setImgError(prev => ({ ...prev, [modelId]: true }));

    // Find the model that needs a thumbnail
    const model = models.find(m => m.id === modelId);
    console.log("Generating thumbnail for model:", model);
    if (!model) return;

    try {
      // Create a thumbnail generator
      const thumbnailGenerator = createThumbnailGenerator({
        width: 512,
        height: 512,
        backgroundColor: '#f0f0f0',
      });
      // Generate thumbnail from the model URL
      const thumbnailDataUrl = await thumbnailGenerator.generateThumbnail(model.url);
      console.log("Thumbnail generated successfully");

      // Upload the thumbnail
      const uploadSuccess = await thumbnailGenerator.uploadThumbnail(thumbnailDataUrl, model.id);
      if (uploadSuccess) {
        console.log("Thumbnail uploaded successfully");
      } else {
        console.error("Failed to upload thumbnail");
      }
      if (uploadSuccess) {
        // Update the model in state with the new thumbnail URL and clear error
        setImgError(prev => {
          const newErrors = { ...prev };
          delete newErrors[model.id];
          return newErrors;
        });

        // Force a reload of the image by updating the thumbnailUrl with a cache-busting parameter
        setModels(currentModels =>
          currentModels.map(m =>
            m.id === model.id
              ? { ...m, thumbnailUrl: `${model.thumbnailUrl}?t=${Date.now()}` }
              : m
          )
        );
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      // Keep the error state so the placeholder remains visible
    }
  };

  const handleViewModel = (modelId: string) => {
    console.log("Viewing model", modelId);
    router.push(`dashboard/models/${modelId}`);
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your 3D Models</h1>
          <p className="text-muted-foreground">
            View and manage all your 3D models created with SimpleMesh.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList>
              <TabsTrigger value="all">All Models</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[250px]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="border rounded-lg bg-card p-6 text-center min-h-[300px] flex flex-col items-center justify-center">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading your models...</p>
          </div>
        ) : error ? (
          <div className="border rounded-lg bg-card p-6 text-center min-h-[300px] flex flex-col items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredModels.map((model) => (
              <Card key={model.id} className="overflow-hidden group">
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {/* Thumbnail instead of 3D Model */}
                  {imgError[model.id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-800 p-4 text-center">
                      <div className="bg-white dark:bg-slate-600 rounded-full p-3 shadow-sm mb-3">
                        <Grid3X3 className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-medium text-sm mb-1 text-slate-800 dark:text-slate-200 line-clamp-1">
                        {model.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[90%]">
                        Preview image will be available soon
                      </p>
                    </div>
                  ) : (
                    <img
                      src={model.thumbnailUrl}
                      alt={`Thumbnail for ${model.name}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(model.id)}
                    />
                  )}

                  {/* Overlay with actions that appear on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      onClick={() => handleViewModel(model.id)}
                      size="icon"
                      variant="secondary"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button asChild size="icon" variant="secondary">
                      <a href={model.url} download>
                        <Download className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedModel(model);
                        setDeleteDialogOpen(true);
                      }}
                      size="icon"
                      variant="destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="truncate mr-2">
                      <p className="font-medium truncate">{model.name}</p>
                    </div>
                    <Button
                      onClick={() => handleToggleFavorite(model.id)}
                      size="icon"
                      variant="ghost"
                      className={model.favorite ? "text-yellow-500" : "text-muted-foreground"}
                    >
                      <Star className="h-4 w-4" fill={model.favorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg bg-card p-6 text-center min-h-[300px] flex flex-col items-center justify-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 w-fit">
              <Grid3X3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No models found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery ?
                `No models matching "${searchQuery}" found. Try a different search term.` :
                "No 3D models available."}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-1"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
            {!searchQuery && (
              <Link href="/create" passHref>
                <Button className="mt-2">Create Your First Model</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Model</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete "{selectedModel?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedModel && handleDeleteModel(selectedModel.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}