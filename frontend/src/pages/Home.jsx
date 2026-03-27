import { useEffect } from 'react';
import Hero from '../components/Hero';
import Emission from '../components/Emission';
import Candidature from '../components/Candidature';
import Medecins from '../components/Medecins';
import Boutique from '../components/Boutique';
import Episodes from '../components/Episodes';
import Footer from '../components/Footer';

export default function Home() {
  // Scroll reveal observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <Emission />
      <Candidature />
      <Medecins />
 {/* <Boutique /> */}
      <Episodes />
      <Footer />
    </>
  );
}
