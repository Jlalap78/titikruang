'use client';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import About from '@/components/About';
import Showcase from '@/components/Showcase';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import AnimatedCoinTrack from '@/components/AnimatedCoinTrack';
export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <AnimatedCoinTrack /> {/* <- Insert this wherever you want it */}
      <Hero />
      <Features />
      <About />
      <Showcase />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}

