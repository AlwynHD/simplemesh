import React from 'react';
import { motion } from "framer-motion";
import { Check, X, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

interface CompetitorFeature {
  name: string;
  simpleMesh: boolean;
  meshy: boolean;
  aiStudio: boolean;
  tooltip?: string;
}

interface ComparisonTableProps {
  handlePurchase?: (e?: React.MouseEvent) => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ handlePurchase }) => {
  const generalComparison = [
    { 
      label: "Pricing Model", 
      simpleMesh: "One-time purchase", 
      meshy: "Credit-based subscription", 
      aiStudio: "Credit-based subscription",
      tooltip: "SimpleMesh charges once for a set number of generations. Competitors use subscription models with monthly credit allocations."
    },
    { 
      label: "Base Price", 
      simpleMesh: "$9 (one-time)", 
      meshy: "$20/month", 
      aiStudio: "$16/month" 
    },
    { 
      label: "What You Get", 
      simpleMesh: "30 generations (never expire)", 
      meshy: "Credits for ~50 models/month", 
      aiStudio: "Credits for ~40 models/month" 
    },
    { 
      label: "Cost Per Model", 
      simpleMesh: "$0.30", 
      meshy: "$0.40", 
      aiStudio: "$0.40",
      tooltip: "SimpleMesh offers the lowest cost per 3D model generation" 
    },
    { 
      label: "No Recurring Charges", 
      simpleMesh: true, 
      meshy: false, 
      aiStudio: false,
      tooltip: "With SimpleMesh, you only pay when you need more generations"
    }
  ];

  const featuresList: CompetitorFeature[] = [
    { name: "Image to 3D", simpleMesh: true, meshy: true, aiStudio: true },
    { name: "Text to 3D", simpleMesh: true, meshy: true, aiStudio: true },
    { name: "HD Export Quality", simpleMesh: true, meshy: true, aiStudio: true },
    { name: "Multiple Export Formats", simpleMesh: false, meshy: true, aiStudio: true },
    { name: "Texture Editing", simpleMesh: false, meshy: true, aiStudio: true },
    { name: "Animation Tools", simpleMesh: false, meshy: true, aiStudio: true },
    { name: "API Access", simpleMesh: false, meshy: true, aiStudio: true }
  ];

  const companyInfo = [
    {
      name: "SimpleMesh",
      logoSrc: "/favicon/Logo-Fox-Light.svg",
      description: "(Our offering)"
    },
    {
      name: "Meshy",
      logoSrc: "/favicon/meshy.svg",
      description: ""
    },
    {
      name: "3D AI Studio",
      logoSrc: "/favicon/studio3d.png",
      description: ""
    }
  ];

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-24 w-full max-w-5xl mx-auto px-4"
      >
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-3">How We Compare</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            SimpleMesh focuses on affordable 3D generation with a straightforward pricing model
          </p>
        </div>
        
        <div className="overflow-auto">
          <div className="min-w-[800px] overflow-hidden rounded-xl border border-border shadow-md mb-8">
            <div className="grid grid-cols-4 bg-secondary/5">
              <div className="p-5 border-r border-b border-border font-semibold">
                <span className="text-foreground">Pricing & Value</span>
              </div>
              
              {companyInfo.map((company, idx) => (
                <div 
                  key={company.name} 
                  className={`p-5 border-b border-border text-center font-semibold ${idx < 2 ? "border-r" : ""}`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-8 w-24 relative mb-2">
                      <Image 
                        src={company.logoSrc} 
                        alt={`${company.name} logo`} 
                        fill
                        style={{objectFit: "contain"}}
                      />
                    </div>
                    {company.name} {company.description && <span className="text-xs font-normal text-muted-foreground">{company.description}</span>}
                  </div>
                </div>
              ))}
            </div>
            
            {generalComparison.map((item, index) => (
              <div 
                key={index}
                className={`grid grid-cols-4 ${index === generalComparison.length - 1 ? "" : "border-b border-border"}`}
              >
                <div className="p-5 border-r border-border bg-secondary/5 flex items-center">
                  <span className="text-muted-foreground">
                    {item.label}
                    {item.tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex ml-1 cursor-help">
                            <HelpCircle className="h-4 w-4 text-muted-foreground/70" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-3 max-w-xs bg-popover text-popover-foreground shadow-md border border-border rounded-md">
                          <p>{item.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </div>
                
                {['simpleMesh', 'meshy', 'aiStudio'].map((company, idx) => (
                  <div 
                    key={`${company}-${index}`} 
                    className={`p-5 flex items-center justify-center text-center
                      ${idx < 2 ? "border-r border-border" : ""}`}
                  >
                    {typeof item[company as keyof typeof item] === 'boolean' ? (
                      item[company as keyof typeof item] ? (
                        <Check className="h-5 w-5 text-foreground" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground" />
                      )
                    ) : (
                      <span className={item.label === "Cost Per Model" ? "font-semibold" : ""}>
                        {item[company as keyof typeof item]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="overflow-auto">
          <div className="min-w-[800px] overflow-hidden rounded-xl border border-border shadow-md">
            <div className="grid grid-cols-4 bg-secondary/5">
              <div className="p-5 border-r border-b border-border font-semibold">
                <span className="text-foreground">Features</span>
              </div>
              
              {companyInfo.map((company, idx) => (
                <div 
                  key={company.name} 
                  className={`p-5 border-b border-border text-center font-semibold ${idx < 2 ? "border-r" : ""}`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-8 w-24 relative mb-2">
                      <Image 
                        src={company.logoSrc} 
                        alt={`${company.name} logo`} 
                        fill
                        style={{objectFit: "contain"}}
                      />
                    </div>
                    {company.name} {company.description && <span className="text-xs font-normal text-muted-foreground">{company.description}</span>}
                  </div>
                </div>
              ))}
            </div>
            
            {featuresList.map((feature, index) => (
              <div 
                key={feature.name}
                className={`grid grid-cols-4 ${index === featuresList.length - 1 ? "" : "border-b border-border"}`}
              >
                <div className="p-5 border-r border-border bg-secondary/5 flex items-center">
                  <span className="text-muted-foreground">
                    {feature.name}
                    {feature.tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex ml-1 cursor-help">
                            <HelpCircle className="h-4 w-4 text-muted-foreground/70" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-3 max-w-xs bg-popover text-popover-foreground shadow-md border border-border rounded-md">
                          <p>{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </div>
                
                {['simpleMesh', 'meshy', 'aiStudio'].map((company, idx) => (
                  <div 
                    key={`${company}-${feature.name}`} 
                    className={`p-5 flex items-center justify-center
                      ${idx < 2 ? "border-r border-border" : ""}`}
                  >
                    {feature[company as keyof typeof feature] ? (
                      <Check className="h-5 w-5 text-foreground" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-lg mx-auto px-4">
          <p>SimpleMesh focuses on providing affordable 3D generation with a simple pricing model. 
          While competitors offer more advanced features, we prioritize value and simplicity.</p>
          <p className="mt-2 text-xs">Information based on publicly available data as of March 2025</p>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default ComparisonTable;