"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Eye, Download, Trash2, Search, Star, Grid3X3, Loader, } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { listUserModels, deleteModel } from "@/components/actions/featuresActions"
import { createThumbnailGenerator } from '@/utils/ThumbnailGenerator';
import { motion } from "framer-motion";
import Image from "next/image"
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
          const modelsWithFavorites = result.models.map(model => {
            const thumbnailUrl = model.url.replace('/models/', '/thumbnails/').replace('.glb', '.jpg');

            return {
              ...model,
              favorite: savedFavorites[model.id] || model.favorite || false,
              thumbnailUrl
            };
          });

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
    deleteModel(modelId)
    setModels(models.filter(model => model.id !== modelId));
    setDeleteDialogOpen(false);
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
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    try {
      const thumbnailGenerator = createThumbnailGenerator({
        width: 1024,
        height: 1024,
      });
      const thumbnailDataUrl = await thumbnailGenerator.generateThumbnail(model.url);
      const uploadSuccess = await thumbnailGenerator.uploadThumbnail(thumbnailDataUrl, model.id);

      if (uploadSuccess) {
        setImgError(prev => {
          const newErrors = { ...prev };
          delete newErrors[model.id];
          return newErrors;
        });

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
    }
  };

  const handleViewModel = (modelId: string) => {
    router.push(`dashboard/models/${modelId}`);
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex flex-col gap-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-400 text-transparent bg-clip-text">
            Your 3D Models
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your collection of 3D creations in one place
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs
            defaultValue="all"
            value={currentTab}
            onValueChange={setCurrentTab}
            className="border-b-0"
          >
            <TabsList className="h-11 p-1 bg-background/90 backdrop-blur-sm border">
              <TabsTrigger value="all" className="text-sm font-medium px-4">
                All Models
              </TabsTrigger>
              <TabsTrigger value="favorites" className="text-sm font-medium px-4">
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[280px] h-11 bg-background/90 backdrop-blur-sm border focus-visible:ring-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="border rounded-xl bg-card/30 backdrop-blur-sm p-12 text-center min-h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
              <div className="relative flex items-center justify-center h-full w-full rounded-full bg-background border">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
            <p className="text-muted-foreground font-medium">Loading your models...</p>
          </div>
        ) : error ? (
          <div className="border border-red-200 rounded-xl bg-red-50 dark:bg-red-950/20 p-12 text-center min-h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="rounded-full p-4 bg-red-100 dark:bg-red-900/30">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredModels.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredModels.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden group border bg-card/40 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-primary/30">
                  <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
                    {imgError[model.id] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-100/80 to-slate-300/80 dark:from-slate-800/80 dark:to-slate-950/80">
                        <div className="bg-background rounded-full p-3 shadow-md mb-3 border">
                          <Grid3X3 className="h-8 w-8 text-primary" />
                        </div>
                        <p className="font-medium text-sm mb-1 line-clamp-1">
                          {model.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[90%]">
                          Generating preview...
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <Image
                          src={model.thumbnailUrl || '/placeholder-image.jpg'} // Provide fallback image
                          alt={`Thumbnail for ${model.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() => handleImageError(model.id)}
                          priority={index < 4}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}

                    {/* Overlay with actions that appear on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                      <Button
                        onClick={() => handleViewModel(model.id)}
                        size="icon"
                        className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button
                        asChild
                        size="icon"
                        className="rounded-full bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg hover:scale-105 transition-all duration-200"
                      >
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
                        className="rounded-full bg-red-500/80 hover:bg-red-500 text-white border-red-400/30 shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="truncate mr-2">
                        <p className="font-semibold truncate text-foreground/90">{model.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(model.createdAt).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleToggleFavorite(model.id)}
                        size="icon"
                        variant="ghost"
                        className={`rounded-full ${model.favorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Star className="h-5 w-5" fill={model.favorite ? "currentColor" : "none"} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="border rounded-xl bg-card/40 backdrop-blur-sm p-12 text-center min-h-[400px] flex flex-col items-center justify-center gap-4"
          >
            <div className="rounded-full bg-primary/10 p-4 mb-2">
              <Grid3X3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No models found</h3>
            <p className="text-muted-foreground max-w-md text-base">
              {searchQuery ?
                `No models matching "${searchQuery}" found. Try a different search term.` :
                "Create your first 3D model to get started."}
            </p>

          </motion.div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl border-neutral-200 dark:border-neutral-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Model</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-muted-foreground">
              Are you sure you want to delete&quot;<span className="font-medium text-foreground">{selectedModel?.name}</span>&quot;? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex-row gap-3 sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
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