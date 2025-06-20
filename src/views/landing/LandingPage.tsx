import LandingpageFirstLook from '../../components/landing/LandingPageFirstLook';
import FeaturesCards from '@/components/landing/FeaturesCards';
import IITBhilaiInfo from '@/components/landing/IITBhilaiInfo';
import ContactSection from '@/components/landing/ContactSection';
import FaqSlider from '@/components/landing/FaqSlider';
const LandingPage = () => {
  return (
    <div className="scroll-smooth">
      <LandingpageFirstLook />
      <FeaturesCards />
      <IITBhilaiInfo />
      <FaqSlider />
      <ContactSection />
    </div>
  );
};

export default LandingPage;
