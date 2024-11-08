import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Check,
  Code,
  Github,
  Globe,
  Linkedin,
  MessageSquare,
  Shield,
  Twitter,
  Users,
  Zap
} from 'lucide-react';
import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
const features = [
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: "Real-time Chat",
    description: "Instant messaging with real-time updates and presence indicators"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure Communication",
    description: "End-to-end encryption for all your messages and data"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Lightning Fast",
    description: "Optimized performance for seamless communication"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Team Collaboration",
    description: "Built for teams of all sizes with collaborative features"
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "Developer Friendly",
    description: "Easy integration with comprehensive API documentation"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Access",
    description: "Connect from anywhere with worldwide server distribution"
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    features: ["Basic chat features", "Up to 10 members", "7-day message history", "Basic support"],
    recommended: false
  },
  {
    name: "Pro",
    price: "12",
    features: ["Unlimited messages", "Up to 100 members", "Priority support", "Custom branding"],
    recommended: true
  },
  {
    name: "Enterprise",
    price: "Contact us",
    features: ["Unlimited everything", "24/7 support", "Custom integration", "SLA guarantee"],
    recommended: false
  }
];

const testimonials = [
  {
    name: "John Doe",
    feedback: "Coiisy has transformed the way our team communicates. It's fast, secure, and reliable.",
    position: "CEO, TechCorp"
  },
  {
    name: "Jane Smith",
    feedback: "The real-time chat feature is a game-changer for our remote team.",
    position: "Project Manager, Innovate Inc."
  }
];

const FooterSection = () => {
  return (
    <footer className="bg-gray-50 text-gray-600 py-8 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <h3 className="text-lg font-bold mb-2 text-gray-900">Coiisy</h3>
          <p className="text-sm text-gray-500">
            Revolutionizing team communication with secure, real-time messaging solutions.
          </p>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-2 text-gray-900">Quick Links</h3>
          <ul className="space-y-1">
            <li><Link to="/about" className="text-sm text-gray-500 hover:text-blue-600">About Us</Link></li>
            <li><Link to="/features" className="text-sm text-gray-500 hover:text-blue-600">Features</Link></li>
            <li><Link to="/pricing" className="text-sm text-gray-500 hover:text-blue-600">Pricing</Link></li>
            <li><Link to="/contact" className="text-sm text-gray-500 hover:text-blue-600">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-2 text-gray-900">Legal</h3>
          <ul className="space-y-1">
            <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-sm text-gray-500 hover:text-blue-600">Terms of Service</Link></li>
            <li><Link to="/cookies" className="text-sm text-gray-500 hover:text-blue-600">Cookie Policy</Link></li>
            <li><Link to="/security" className="text-sm text-gray-500 hover:text-blue-600">Security</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-2 text-gray-900">Connect With Us</h3>
          <div className="flex space-x-3">
            <a href="https://github.com/coiisy" className="text-gray-500 hover:text-blue-600">
              <Github size={20} />
            </a>
            <a href="https://twitter.com/coiisy" className="text-gray-500 hover:text-blue-600">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com/company/coiisy" className="text-gray-500 hover:text-blue-600">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Coiisy. All rights reserved.</p>
        <p className="mt-1">
          Made with ❤️ for developers worldwide
        </p>
      </div>
    </footer>
  );
};



const ChatLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const aboutRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const Navigation = () => (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
        style={{ scaleX }}
      />
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-4 px-6 flex justify-between items-center z-40 shadow-sm">
        <Link to="/" className="text-blue-600 text-2xl font-bold">
          Coiisy
        </Link>
        <div className="flex items-center space-x-4 md:space-x-8">
          <button
            onClick={() => scrollToSection(aboutRef)}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection(featuresRef)}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection(pricingRef)}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection(testimonialsRef)}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Testimonials
          </button>
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>
    </>
  );

  const SectionSeparator = () => (
    <div className="w-full py-16">
      <div className="max-w-6xl mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>
    </div>
  );

  const HeroSection = () => (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 md:px-8 max-w-7xl mx-auto bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-gray-900">
          Welcome to <span className="text-blue-600">Coiisy</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-12">
          Experience the next generation of secure, real-time communication.
          Built for teams, loved by everyone.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-md"
        >
          Get Started Free
        </motion.button>
      </motion.div>
    </section>
  );

  const AboutSection = () => (
    <section
      ref={aboutRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 max-w-7xl mx-auto bg-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">About Coiisy</h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Coiisy is a next-generation communication platform designed for modern teams.
          We combine powerful features with elegant simplicity to create the perfect
          environment for collaboration and productivity.
        </p>
      </motion.div>
    </section>
  );

  const FeaturesSection = () => (
    <section
      ref={featuresRef}
      className="min-h-screen py-24 px-4 md:px-8 max-w-7xl mx-auto bg-gray-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">Powerful Features</h2>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Everything you need to collaborate effectively with your team
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300 border border-gray-200"
          >
            <div className="bg-blue-50 rounded-xl p-4 inline-block mb-6">
              <div className="text-blue-600">{feature.icon}</div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
            <p className="text-gray-700 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );

  const PricingSection = () => (
    <section
      ref={pricingRef}
      className="min-h-screen py-24 px-4 md:px-8 max-w-7xl mx-auto bg-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">Simple Pricing</h2>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Choose the perfect plan for your team
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`
              relative bg-white rounded-2xl p-8 border border-gray-200
              ${plan.recommended ? 'ring-2 ring-blue-500 scale-105' : ''}
              hover:shadow-lg transition-all duration-300
            `}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Recommended
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
            <div className="text-4xl font-bold mb-6 text-gray-900">
              {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
              {typeof plan.price === 'number' &&
                <span className="text-lg text-gray-500">/mo</span>
              }
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={handleGetStarted}
              className={`
                w-full py-3 rounded-xl font-semibold transition-all duration-300
                ${plan.recommended
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}
              `}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );

  const TestimonialsSection = () => (
    <section
      ref={testimonialsRef}
      className="min-h-screen py-24 px-4 md:px-8 max-w-7xl mx-auto bg-gray-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">What Our Users Say</h2>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Hear from our satisfied users
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 border border-gray-200"
          >
            <p className="text-lg text-gray-700 mb-4">"{testimonial.feedback}"</p>
            <h4 className="text-xl font-semibold text-gray-900">{testimonial.name}</h4>
            <p className="text-gray-500">{testimonial.position}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );

  const handleGetStarted = () => {
    const sessionId = uuidv4();
    navigate(`/${sessionId}`);
  };



  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <SectionSeparator />
        <AboutSection />
        <SectionSeparator />
        <FeaturesSection />
        <SectionSeparator />
        <PricingSection />
        <SectionSeparator />
        <TestimonialsSection />
      </main>

      <FooterSection />
    </div>
  );
};

export default ChatLandingPage;