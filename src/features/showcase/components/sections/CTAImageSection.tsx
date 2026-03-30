import React from 'react';
import Container from '../ui/Container';
import ctaImage from '@/src/statics/cta.jpg';

const CTAImageSection: React.FC = () => {
  return (
    <section className="py-5 bg-white">
      <Container>
        <div className="rounded-2xl overflow-hidden  w-full">
          <img
            src={ctaImage}
            alt="CTA Banner"
            className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      </Container>
    </section>
  );
};

export default CTAImageSection;
