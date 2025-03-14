
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { ArrowRight, Lightbulb, Brain, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Showcase = () => {
  const { user, loading } = useFirebaseAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // If the user is authenticated, redirect to dashboard
  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  
  return (
    <div className="min-h-screen bg-noir">
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-neon-cyan font-detective text-2xl">MathDetective</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Link to="/signin">
            <Button className="bg-neon-cyan hover:bg-neon-cyan/80 text-black">
              {t('showcase.signIn')}
            </Button>
          </Link>
        </div>
      </header>
      
      <main>
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-detective text-neon-cyan mb-6">
              {t('showcase.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              {t('showcase.subtitle')}
            </p>
            <Link to="/signin">
              <Button size="lg" className="bg-neon-pink hover:bg-neon-pink/80 text-white">
                {t('showcase.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="py-20 px-6 bg-noir-accent">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-noir p-8 rounded-lg border border-gray-800 hover:border-neon-cyan transition-colors">
                <div className="bg-neon-cyan/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Lightbulb className="text-neon-cyan h-7 w-7" />
                </div>
                <h3 className="text-xl text-neon-cyan mb-3">
                  {t('showcase.features.interactive')}
                </h3>
                <p className="text-gray-400">
                  {t('showcase.features.interactiveDesc')}
                </p>
              </div>
              
              <div className="bg-noir p-8 rounded-lg border border-gray-800 hover:border-neon-purple transition-colors">
                <div className="bg-neon-purple/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Brain className="text-neon-purple h-7 w-7" />
                </div>
                <h3 className="text-xl text-neon-purple mb-3">
                  {t('showcase.features.skills')}
                </h3>
                <p className="text-gray-400">
                  {t('showcase.features.skillsDesc')}
                </p>
              </div>
              
              <div className="bg-noir p-8 rounded-lg border border-gray-800 hover:border-neon-pink transition-colors">
                <div className="bg-neon-pink/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Beaker className="text-neon-pink h-7 w-7" />
                </div>
                <h3 className="text-xl text-neon-pink mb-3">
                  {t('showcase.features.real')}
                </h3>
                <p className="text-gray-400">
                  {t('showcase.features.realDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 px-6 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} MathDetective
          </div>
          <div className="flex space-x-4">
            <Link to="/signin" className="text-gray-400 hover:text-neon-cyan">
              {t('showcase.signIn')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Showcase;
