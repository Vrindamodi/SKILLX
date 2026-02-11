import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: '\u{1F4DA}',
    title: 'Learn Anything',
    description: 'Find expert teachers for any skill',
    color: 'bg-blue-500',
  },
  {
    icon: '\u{1F9E0}',
    title: 'Teach & Earn',
    description: 'Share your knowledge, earn money',
    color: 'bg-green-500',
  },
  {
    icon: '\u23F1\uFE0F',
    title: 'Quick Expert Help',
    description: 'Rent-a-skill for instant solutions',
    color: 'bg-purple-500',
  },
  {
    icon: '\u{1F9F9}',
    title: 'Local Services',
    description: 'Find & offer services in your area',
    color: 'bg-orange-500',
  },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLastSlide = currentSlide === slides.length - 1;

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      navigate('/register');
    } else {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    navigate('/register');
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Skip button */}
      {!isLastSlide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-6 right-6 z-20"
        >
          <button
            onClick={handleSkip}
            className="btn-ghost text-sm"
          >
            Skip
          </button>
        </motion.div>
      )}

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full max-w-sm"
          >
            {/* Card */}
            <div className={`glass-card p-8 text-center ${slide.color}`}>
              {/* Icon */}
              {/* <div className="text-7xl mb-6">{slide.icon}</div> */}

              {/* Title */}
              <h2 className="text-4xl font-bold text-white mb-3">
                {slide.title}
              </h2>

              {/* Description */}
              <p className="text-dark-300 text-base leading-relaxed">
                {slide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="pb-10 px-6">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-primary-500'
                  : 'w-2 bg-dark-600 hover:bg-dark-500'
              }`}
            />
          ))}
        </div>

        {/* Action button */}
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className={`flex items-center justify-center gap-2 font-medium rounded-xl py-3 px-8 transition-all duration-200 ${
              isLastSlide
                ? 'btn-primary w-full max-w-sm text-base'
                : 'btn-primary'
            }`}
          >
            {isLastSlide ? 'Get Started' : 'Next'}
            {!isLastSlide && <ChevronRight className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
