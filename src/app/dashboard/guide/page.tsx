"use client";

import { motion } from "framer-motion";
import { 
  BookOpen, Code, Settings, Lightbulb, ChevronRight, 
  FileText, MessagesSquare, VideoIcon 
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GuidePage() {
  const guideCategories = [
    { title: "Getting Started", icon: BookOpen, comingSoon: true },
    { title: "Best Practices", icon: Settings, comingSoon: true },
    { title: "Tips & Tricks", icon: Lightbulb, comingSoon: true },
  ];

  const contentTypes = [
    { type: "Documentation", icon: FileText },
    { type: "Video Tutorials", icon: VideoIcon },
  ];

  return (
    <div className="container mx-auto py-16 px-4 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Resource Guide</h1>
        <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
          Your one-stop destination for learning how to make the most of our platform.
        </p>
      </motion.div>

      {/* Guide Categories - Centered 3 items */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-20"
      >
        <h2 className="text-2xl font-semibold text-center mb-8">Guide Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {guideCategories.map((category, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              className="flex"
            >
              <Card className="h-full w-full border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-background to-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-primary/10 rounded-lg shadow-sm">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    {category.comingSoon && (
                      <Badge variant="outline" className="bg-muted shadow-sm">Coming Soon</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.comingSoon 
                      ? "We're working on bringing you valuable content in this section."
                      : "Learn the fundamentals and get up to speed quickly with our platform."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={category.comingSoon ? "outline" : "default"} 
                    className="w-full" 
                    disabled={category.comingSoon}
                  >
                    {category.comingSoon ? "Coming Soon" : "Explore"} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Content Types - Centered 2 items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-semibold text-center mb-8">Content Formats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
          {contentTypes.map((content, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="flex flex-col items-center text-center p-8 rounded-xl bg-gradient-to-b from-muted/50 to-background border border-border/50 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-4 bg-primary/10 rounded-full mb-5 shadow-inner">
                <content.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">{content.type}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Coming soon to help you learn in your preferred format.
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}