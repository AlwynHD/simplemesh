"use client"

import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-[hsl(var(--background))]/90 backdrop-blur-md border-b border-[hsl(var(--border))]/30 py-4">
        <div className="container flex items-center justify-between px-4 mx-auto">
          <div className="flex items-center flex-shrink-0 ml-4 xl:ml-0">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/favicon/Logo-Fox-Light.svg" alt="Logo" width={36} height={36} className="cursor-pointer" />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-base font-medium text-[hsl(var(--foreground))] transition-all duration-200 hover:text-opacity-70">
              Home
            </Link>
            <Link href="/pricing" className="text-base font-medium text-[hsl(var(--foreground))] transition-all duration-200 hover:text-opacity-70">
              Pricing
            </Link>
            <Link href="/privacy" className="relative text-base font-medium text-[hsl(var(--foreground))] transition-all duration-200 group">
              Privacy
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[hsl(var(--primary))]"></span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-lg">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p className="text-[hsl(var(--foreground))]/90 mb-4">
              Welcome to SimpleMesh, which is designated and operated by SimpleMesh LLC. (including its subsidiaries, affiliates, agents, and service providers, collectively, "we," "us," "our" or "SimpleMesh"). SimpleMesh provides users and visitors ("you" and "your") with services of creating 3D content using generative AI technology, including but not limited to AI-powered 3D modeling, texturing, and animation. ("Services").
            </p>
            <p className="text-[hsl(var(--foreground))]/90">
              This Privacy Policy (the "Policy") describes and governs how we collect, use, share and protect (collectively, "process") personal information collected in the context of our Services. Before you use or submit any information through or in connection with the Services, please carefully review this Policy.
            </p>
          </div>

          {/* What Information We Collect */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">What Information We Collect</h2>
            <div className="text-[hsl(var(--foreground))]/90 whitespace-pre-line">
              When you use our Services, we collect information in multiple ways, including when you provide information directly to us, and when we passively collect information from your browser or device.

              Information you provide directly includes:
              • Registration information (email address, username, verification codes)
              • Purchase information when you subscribe to paid services
              • Content you provide through our Services (text prompts, image prompts, 3D models)
              • Communications sent to us
              • Third-party communications when you refer others to our Services

              Information passively collected includes:
              • Usage information (IP address, browser settings, device information)
              • Cookies and other electronic technologies
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <div className="text-[hsl(var(--foreground))]/90 whitespace-pre-line">
              We use the information collected from the Services in a manner that is consistent with this Policy:

              • To operate, maintain, and provide you with the Services
              • To restrict attempts to use the Services from restricted territory or in breach of our Terms
              • For marketing and promotional purposes when you consent to receive such communications
              • To analyze data usage trends and improve our Services
              • To ensure security and stability of our Services
            </div>
          </div>

          {/* How We Disclose Your Information */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">How We Disclose Your Information</h2>
            <div className="text-[hsl(var(--foreground))]/90 whitespace-pre-line">
              We share information collected through the Services with certain third parties in the following circumstances:

              • Third-party service providers who process data on our behalf (security providers, advertising providers, IT services)
              • Government authorities/law enforcement officials when required by law
              • Potential buyers and advisers in the event of a corporate sale or similar event
              • Third parties that partner with us or offer services you choose to link
              • When you provide your consent
              • Aggregated, anonymized, and/or de-identified information for research
              • Other users if you choose to make your information publicly available
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Children's Privacy</h2>
            <div className="text-[hsl(var(--foreground))]/90 whitespace-pre-line">
              Our websites are NOT directed to children (refers to children under age of 13, or 16 for children located in Europe) and we do not knowingly collect personal data from children. If we discover that a child has provided us with personal data, we will promptly delete such personal data from our systems.

              Children may not submit any personal data to us without permission from their parents or guardians. If you have reason to believe that a child has provided personal information to us through the Services, please contact us, and we will delete that information from our databases to the extent required by law.
            </div>
          </div>

          {/* Security */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <div className="text-[hsl(var(--foreground))]/90 whitespace-pre-line">
              We are committed to keeping your personal data safe and strive to maintain the highest standards of security. For this purpose, we have put in place robust technical and organizational measures utilizing current state-of-the-art technologies to ensure that your personal data is adequately protected.

              Our security measures include:
              • A dedicated team of information security professionals
              • Comprehensive information security systems
              • Access control and encryption technologies
              • Confidentiality agreements with employees who may access your information
              • Regular training on personal data protection
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
            <div className="text-[hsl(var(--foreground))]/90 whitespace-pre-line">
              You have certain rights regarding your personal data, subject to applicable law. These include the rights to:

              • Access your personal data
              • Rectify incorrect or incomplete data
              • Erase your personal data
              • Object to processing of your data
              • Restrict the processing of your data
              • Receive your data in a usable electronic format
              • Withdraw consent
              • Request not to be subject to automated decision-making
              • Lodge a complaint with your local data protection authority

              To exercise these rights, please contact us using the information provided in the Contact Us section.
            </div>
          </div>

          {/* Privacy Information for California Residents */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy Information for California Residents</h2>
            <div className="text-[hsl(var(--foreground))]/90 whitespace-pre-line">
              If you are a California resident, you have certain rights under the California Consumer Privacy Act (CCPA).

              Your personal information, including contact information and Internet network data, may be disclosed to online advertising and analytics partners. You have the right to opt out of the disclosure of your personal information for purposes of online advertising.

              The California "Shine the Light" law gives residents of California certain rights regarding the disclosure of personal information to third parties for their direct marketing purposes. We do not currently disclose your personal information to third parties for their own direct marketing purposes.
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]/40 p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-[hsl(var(--foreground))]/90 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="p-4 bg-[hsl(var(--secondary))]/10 rounded-md flex items-center space-x-2">
              <svg className="w-5 h-5 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:support@simplemesh.ai" className="text-[hsl(var(--primary))] hover:underline">support@simplemesh.ai</a>
            </div>
          </div>
          
          {/* Agreement Section */}
          <div className="bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--ring))]/20 rounded-lg border border-[hsl(var(--border))]/40 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">By using our services, you consent to this Privacy Policy</h2>
                <p className="text-[hsl(var(--foreground))]/80">Thank you for reviewing our Privacy Policy</p>
              </div>
              <Link 
                href="/" 
                className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium leading-6 text-[hsl(var(--foreground))] transition-all duration-200 ease-in-out bg-[hsl(var(--secondary))]/5 border border-[hsl(var(--border))]/30 rounded-lg hover:bg-[hsl(var(--secondary))]/20 hover:border-[hsl(var(--border))]/50"
              >
                <span className="relative z-10">Return Home</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[hsl(var(--background))]/80 backdrop-blur-md border-t border-[hsl(var(--border))]/20 py-8 mt-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Image src="/favicon/Logo-Fox-Light.svg" alt="Logo" width={28} height={28} className="mr-2" />
            <span className="text-[hsl(var(--foreground))]/70 text-sm">© {new Date().getFullYear()} SimpleMesh LLC. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 text-sm font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-[hsl(var(--foreground))]/70 hover:text-[hsl(var(--foreground))] text-sm">
              Terms of Service
            </Link>

          </div>
        </div>
      </footer>
    </div>
  )
}