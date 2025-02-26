'use client';

import { useEffect, useState } from 'react';
import { getModelById } from '@/components/actions/featuresActions';
import { useParams } from 'next/navigation';
import ModelViewer from '@/components/ModelViewer';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  favorite: boolean;
}

export default function ModelPage() {
  const params = useParams();
  const modelId = params.model as string;
  
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModel() {
      try {
        setLoading(true);
        const result = await getModelById(modelId);
        
        if (result.error) {
          setError(result.error);
          setModel(null);
        } else if (result.model) {
          setModel(result.model);
          setError(null);
        } else {
          setError('Model not found');
          setModel(null);
        }
      } catch (err) {
        console.error('Failed to fetch model:', err);
        setError('Failed to load model');
        setModel(null);
      } finally {
        setLoading(false);
      }
    }

    if (modelId) {
      fetchModel();
    }
  }, [modelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Loading model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            You may not have permission to view this model, or it may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{model?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Created: {model?.createdAt ? new Date(model.createdAt).toLocaleString() : 'Unknown'}
        </p>
      </div>
      
      <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
        {model?.url ? (
          <ModelViewer modelUrl={model.url} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No model preview available</p>
          </div>
        )}
      </div>
    </div>
  );
}