import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import PartnerLogos from './PartnerLogos';
import { Button } from './ui/Button';
import { logEvent } from '../lib/analytics';
import { useTranslation } from 'react-i18next';
import HelpTooltip from './HelpTooltip';

export default function HeroSection({ onRequestDemo }) {
  const prefersReduced = useReducedMotion();
  const { t } = useTranslation();
  return (
    <section
      id="product"
      className="relative overflow-hidden min-h-[70vh] px-6 py-20 flex items-center justify-center bg-surface text-ink"
    >
      <img
        src="/logo.svg"
        alt="ClarifyOps watermark"
        className="hidden md:block absolute right-10 bottom-0 w-1/2 max-w-md opacity-10 pointer-events-none select-none"
      />
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
          className="space-y-6 text-center md:text-left"
        >
          <>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">{t('hero.headline')}</h1>
            <p className="text-xl md:text-2xl max-w-xl mx-auto md:mx-0 text-muted">
              {t('hero.subhead')} <HelpTooltip term="AI Extracted from CMS1500" />
            </p>
          </>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              onClick={() => {
                logEvent('hero_cta_click');
                onRequestDemo();
              }}
              className="text-lg px-8 py-3 min-h-[44px]"
            >
              {t('hero.cta')}
            </Button>
            <a
              href="/free-trial"
              className="self-center text-muted hover:text-ink underline mt-2 sm:mt-0"
            >
              {t('hero.secondary')}
            </a>
          </div>
          <ul className="flex items-center justify-center md:justify-start space-x-6 text-sm text-muted">
            <li>{t('hero.proof1')}</li>
            <li>{t('hero.proof2')}</li>
            <li>{t('hero.proof3')}</li>
          </ul>
          <PartnerLogos />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.2 }}
          className="w-full"
        >
          <img
            src="https://placehold.co/800x450/webp?text=Claims+Extraction+Dashboard"
            alt="AI Claims Data Extraction Dashboard"
            loading="lazy"
            className="w-full rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
