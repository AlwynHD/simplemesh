// FAQSection.jsx
import { Mail } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqData = [
    {
        id: "faq-1",
        question: "How long does a Generation take?",
        answer: "Typically, generating a 3D model takes between 15 to 25 seconds. The exact time can vary based on the complexity of the request and current server load. If a new server is required boot up time will be about 4 minutes."
    },
    {
        id: "faq-2",
        question: "How can I create a 3D Model?",
        answer: "Simply navigate to the dashboard, we have an intuitive interface that allows you to upload images or text which generate 3D models in just a few clicks."
    },
    {
        id: "faq-3",
        question: "How many credits does each task cost?",
        answer: "Image to 3D and Text to 3D generations costs 1 credit each per task."
    },
    {
        id: "faq-4",
        question: "Do you offer refunds?",
        answer: "Yes, we stand by our service quality. If you're not satisfied with your experience, please reach out to our support team at support@simplemesh.ai and we'll process your refund."
    },
    {
        id: "faq-6",
        question: "Can I use the generated models commercially?",
        answer: "Yes, any models generated models on our platform can be used for any purpose including commercial."
    },
    {
        id: "faq-7",
        question: "Are there any limitations on model complexity?",
        answer: "Our platform handles models of various complexity, but there are some practical limitations. Each model requires a well crafted prompt or an image with a clearly visible main subject. For particularly complex Images, you may need to generate separate components and assemble them."
    },
    {
        id: "faq-8",
        question: "How do I purchase credits?",
        answer: "You can purchase credits from the billing section of your dashboard. We accept all major credit cards and paypal."
    },
    {
        id: "faq-9",
        question: "Can I edit my 3D models after generation?",
        answer: "Not currently, we have this feature planned. Aswell as exporting models to popular software."
    },
    {
        id: "faq-10",
        question: "What happens to my unused credits?",
        answer: "Credits never expire and will remain in your account until used."
    },
    {
        id: "faq-11",
        question: "Is there a limit to how many models I can generate?",
        answer: "There's no limit to the number of models you can generate as long as you have available credits. Our system is designed to handle high volumes of generations without compromising on quality or speed."
    },
    {
        id: "faq-12",
        question: "Do you offer enterprise solutions?",
        answer: "Yes, we offer an enterprise plan. However if you want more dedicated support email us at support@simplemesh.ai"
    }
];

// Discord logo as SVG component
interface DiscordLogoProps extends React.SVGProps<SVGSVGElement> { }

const DiscordLogo: React.FC<DiscordLogoProps> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 127.14 96.36"
        width="24"
        height="24"
        fill="currentColor"
        {...props}
    >
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

export function FAQSection() {
    return (
        <section className="py-24 bg-background" id="questions">
            <div className="container mx-auto px-6 max-w-4xl">
                <h2 className="text-4xl font-bold text-center mb-16">
                    Frequently Asked Questions
                </h2>

                <Accordion type="single" collapsible className="space-y-5">
                    {faqData.map((faq) => (
                        <AccordionItem
                            key={faq.id}
                            value={faq.id}
                            className="border border-border/50 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                            <AccordionTrigger className="px-8 py-5 bg-card/30 hover:bg-card/50 text-left font-medium text-lg transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-8 py-6 bg-background text-muted-foreground leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-16 text-center p-8 bg-card/20 rounded-2xl border border-border/50 shadow-sm">
                    <h3 className="text-2xl font-medium mb-3">Still have questions?</h3>
                    <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                        Our support team is ready to help you with any other questions you might have.
                        Join our community or reach out directly for assistance.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button variant="default" size="lg" asChild className="px-6 py-2.5">
                            <a href="mailto:support@simplemesh.ai" className="inline-flex items-center">
                                <Mail className="mr-2 h-5 w-5" />
                                Contact Support
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" asChild className="px-6 py-2.5">
                            <a href="https://discord.gg/XzdMYGg5sM" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                                <DiscordLogo className="mr-2" />
                                Join our Discord
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}