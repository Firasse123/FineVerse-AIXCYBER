import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [kycData, setKycData] = useState({});
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to AIxCyber!',
      description: 'Let\'s set up your profile and get you started with personalized recommendations.'
    },
    {
      id: 'kyc',
      title: 'Know Your Customer (KYC)',
      description: 'Answer a few questions to help us provide you with appropriate investment recommendations.'
    },
    {
      id: 'complete',
      title: 'Setup Complete!',
      description: 'You\'re all set! Let\'s start your financial journey.'
    }
  ];

  const kycQuestions = {
    basic: [
      {
        id: 'investmentExperience',
        question: 'What is your investment experience?',
        type: 'radio',
        options: [
          { value: 'beginner', label: 'Beginner (0-2 years)', description: 'New to investing' },
          { value: 'intermediate', label: 'Intermediate (2-5 years)', description: 'Some experience with basic investments' },
          { value: 'advanced', label: 'Advanced (5+ years)', description: 'Experienced with various investment types' }
        ],
        required: true
      },
      {
        id: 'investmentGoals',
        question: 'What are your primary investment goals?',
        type: 'radio',
        options: [
          { value: 'preservation', label: 'Capital Preservation', description: 'Protect your money from inflation' },
          { value: 'income', label: 'Regular Income', description: 'Generate steady income from investments' },
          { value: 'growth', label: 'Long-term Growth', description: 'Build wealth over time' },
          { value: 'speculation', label: 'Speculation', description: 'High-risk, high-reward opportunities' }
        ],
        required: true
      },
      {
        id: 'investmentHorizon',
        question: 'What is your investment time horizon?',
        type: 'radio',
        options: [
          { value: 'short', label: 'Short-term (1-3 years)', description: 'Planning to use money soon' },
          { value: 'medium', label: 'Medium-term (3-10 years)', description: 'Moderate time frame' },
          { value: 'long', label: 'Long-term (10+ years)', description: 'Planning for retirement or distant future' }
        ],
        required: true
      }
    ],
    riskAssessment: [
      {
        id: 'riskTolerance',
        question: 'How comfortable are you with investment risk?',
        type: 'scale',
        min: 1,
        max: 10,
        labels: {
          1: 'Very Conservative',
          5: 'Moderate',
          10: 'Very Aggressive'
        },
        description: 'Rate your comfort level with potential losses',
        required: true
      },
      {
        id: 'lossTolerance',
        question: 'What is the maximum percentage loss you could tolerate?',
        type: 'scale',
        min: 1,
        max: 10,
        labels: {
          1: '0-5%',
          3: '10-15%',
          5: '20-25%',
          7: '30-40%',
          10: '50%+'
        },
        description: 'How much loss could you handle without panic selling?',
        required: true
      }
    ],
    personal: [
      {
        id: 'age',
        question: 'What is your age?',
        type: 'number',
        min: 18,
        max: 100,
        required: true
      },
      {
        id: 'annualIncome',
        question: 'What is your annual income range?',
        type: 'radio',
        options: [
          { value: 'under_25k', label: 'Under $25,000' },
          { value: '25k_50k', label: '$25,000 - $50,000' },
          { value: '50k_100k', label: '$50,000 - $100,000' },
          { value: '100k_250k', label: '$100,000 - $250,000' },
          { value: 'over_250k', label: 'Over $250,000' }
        ],
        required: true
      },
      {
        id: 'netWorth',
        question: 'What is your approximate net worth?',
        type: 'radio',
        options: [
          { value: 'under_50k', label: 'Under $50,000' },
          { value: '50k_100k', label: '$50,000 - $100,000' },
          { value: '100k_500k', label: '$100,000 - $500,000' },
          { value: '500k_1m', label: '$500,000 - $1,000,000' },
          { value: 'over_1m', label: 'Over $1,000,000' }
        ],
        required: true
      }
    ],
    compliance: [
      {
        id: 'regulatoryCompliance',
        question: 'Do you agree to comply with all applicable financial regulations?',
        type: 'checkbox',
        description: 'This includes understanding that this is a simulation and not real money',
        required: true
      }
    ]
  };

  const handleInputChange = (questionId, value) => {
    setKycData(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user answers
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const validateKYC = () => {
    const newErrors = {};
    const allQuestions = [
      ...kycQuestions.basic,
      ...kycQuestions.riskAssessment,
      ...kycQuestions.personal,
      ...kycQuestions.compliance
    ];

    allQuestions.forEach(question => {
      if (question.required && !kycData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitKYC = async () => {
    if (!validateKYC()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(kycData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit KYC');
      }

      const result = await response.json();
      toast.success(`KYC completed! Your risk profile: ${result.riskProfile}`);
      
      // Move to completion step
      setCurrentStep(2);
    } catch (error) {
      toast.error('Failed to submit KYC questionnaire');
      console.error('KYC submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      submitKYC();
    } else if (currentStep === 2) {
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all hover:border-primary-500/50 ${
                  kycData[question.id] === option.value
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-border bg-dark-surface'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={kycData[question.id] === option.value}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-dark-text">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-dark-text-muted">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-dark-text-muted">
              <span>{question.labels[question.min]}</span>
              <span>{question.labels[question.max]}</span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: question.max - question.min + 1 }, (_, i) => {
                const value = question.min + i;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInputChange(question.id, value)}
                    className={`w-10 h-10 rounded-full border transition-all ${
                      kycData[question.id] === value
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-dark-border bg-dark-surface text-dark-text hover:border-primary-500/50'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {kycData[question.id] && (
              <div className="text-center text-sm text-primary-500">
                Selected: {kycData[question.id]} - {question.labels[kycData[question.id]]}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            min={question.min}
            max={question.max}
            value={kycData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, parseInt(e.target.value))}
            className="input w-full"
            placeholder={`Enter your age (${question.min}-${question.max})`}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={kycData[question.id] || false}
              onChange={(e) => handleInputChange(question.id, e.target.checked)}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-medium text-dark-text">{question.question}</div>
              {question.description && (
                <div className="text-sm text-dark-text-muted mt-1">{question.description}</div>
              )}
            </div>
          </label>
        );

      default:
        return null;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-4xl">🚀</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient-primary mb-4">
                {steps[0].title}
              </h2>
              <p className="text-dark-text-muted text-lg">
                {steps[0].description}
              </p>
            </div>
            <div className="bg-dark-surface p-6 rounded-lg">
              <h3 className="font-semibold text-dark-text mb-3">What you'll get:</h3>
              <ul className="space-y-2 text-sm text-dark-text-muted">
                <li>• Personalized investment recommendations</li>
                <li>• Risk-appropriate portfolio suggestions</li>
                <li>• Educational content tailored to your level</li>
                <li>• AI-powered market insights</li>
              </ul>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gradient-primary mb-2">
                {steps[1].title}
              </h2>
              <p className="text-dark-text-muted">
                {steps[1].description}
              </p>
            </div>

            <div className="space-y-8">
              {/* Basic Questions */}
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Investment Experience</h3>
                <div className="space-y-6">
                  {kycQuestions.basic.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-dark-text mb-3">
                        {question.question}
                        {question.required && <span className="text-error ml-1">*</span>}
                      </label>
                      {renderQuestion(question)}
                      {errors[question.id] && (
                        <p className="mt-2 text-sm text-error">{errors[question.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Risk Assessment</h3>
                <div className="space-y-6">
                  {kycQuestions.riskAssessment.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-dark-text mb-3">
                        {question.question}
                        {question.required && <span className="text-error ml-1">*</span>}
                      </label>
                      {question.description && (
                        <p className="text-sm text-dark-text-muted mb-3">{question.description}</p>
                      )}
                      {renderQuestion(question)}
                      {errors[question.id] && (
                        <p className="mt-2 text-sm text-error">{errors[question.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Personal Information</h3>
                <div className="space-y-6">
                  {kycQuestions.personal.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-dark-text mb-3">
                        {question.question}
                        {question.required && <span className="text-error ml-1">*</span>}
                      </label>
                      {renderQuestion(question)}
                      {errors[question.id] && (
                        <p className="mt-2 text-sm text-error">{errors[question.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Compliance</h3>
                <div className="space-y-6">
                  {kycQuestions.compliance.map((question) => (
                    <div key={question.id}>
                      {renderQuestion(question)}
                      {errors[question.id] && (
                        <p className="mt-2 text-sm text-error">{errors[question.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-accent rounded-full flex items-center justify-center">
              <span className="text-4xl">✅</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gradient-accent mb-4">
                {steps[2].title}
              </h2>
              <p className="text-dark-text-muted text-lg">
                {steps[2].description}
              </p>
            </div>
            <div className="bg-dark-surface p-6 rounded-lg">
              <h3 className="font-semibold text-dark-text mb-3">You're ready to:</h3>
              <ul className="space-y-2 text-sm text-dark-text-muted">
                <li>• Start trading with virtual money</li>
                <li>• Receive AI-powered recommendations</li>
                <li>• Learn about financial markets</li>
                <li>• Compete on the leaderboard</li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-text-muted">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-dark-text-muted">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-dark-surface rounded-full h-2">
            <motion.div
              className="bg-gradient-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-secondary"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="spinner w-4 h-4 mr-2"></div>
                Processing...
              </div>
            ) : currentStep === 2 ? (
              'Start Trading!'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
