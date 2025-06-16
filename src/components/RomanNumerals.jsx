import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Calculator, RefreshCw } from 'lucide-react';

const RomanNumerals = () => {
  const [inputNumber, setInputNumber] = useState('');
  const [result, setResult] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [breakdown, setBreakdown] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [romanResult, setRomanResult] = useState('');
  const [animatingNumbers, setAnimatingNumbers] = useState([]);
  const [showRomanResult, setShowRomanResult] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [breakdownStates, setBreakdownStates] = useState([]);
  const [showRomanBreakdown, setShowRomanBreakdown] = useState(false);
  const [romanConvertedStates, setRomanConvertedStates] = useState([]);
  const [hideInputAndEquals, setHideInputAndEquals] = useState(false);
  const [dropPhase, setDropPhase] = useState(false);
  const [showRomanConversion, setShowRomanConversion] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [fadeOutInput, setFadeOutInput] = useState(false);

  const romanNumerals = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];

  const breakDownNumber = (num) => {
    const breakdown = [];
    let remaining = num;
    for (const pair of romanNumerals) {
      while (remaining >= pair.value) {
        breakdown.push(pair.value);
        remaining -= pair.value;
      }
    }
    return breakdown;
  };

  const getRomanNumeral = (num) => {
    for (const pair of romanNumerals) {
      if (pair.value === num) {
        return pair.numeral;
      }
    }
    return '';
  };

  const convertToRoman = (num) => {
    let romanNum = '';
    let remaining = num;
    
    for (const pair of romanNumerals) {
      while (remaining >= pair.value) {
        romanNum += pair.numeral;
        remaining -= pair.value;
      }
    }
    
    return romanNum;
  };

  useEffect(() => {
    if (animationPhase === 'showBreakdown' && breakdown.length > 0 && currentStep < breakdown.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (animationPhase === 'showBreakdown' && currentStep === breakdown.length && !hideInputAndEquals) {
      // After all numbers are shown, fade out input and equals
      const timer = setTimeout(() => {
        setHideInputAndEquals(true);
      }, 800);
      return () => clearTimeout(timer);
    } else if (animationPhase === 'showBreakdown' && currentStep === breakdown.length && hideInputAndEquals && romanConvertedStates.includes(false)) {
      // Animate conversion one by one
      const nextToConvert = romanConvertedStates.findIndex(v => !v);
      if (nextToConvert !== -1) {
        const timer = setTimeout(() => {
          setRomanConvertedStates(prev => {
            const newStates = [...prev];
            newStates[nextToConvert] = true;
            return newStates;
          });
        }, 600);
        return () => clearTimeout(timer);
      }
    } else if (animationPhase === 'showBreakdown' && currentStep === breakdown.length && hideInputAndEquals && romanConvertedStates.every(v => v) && !showRomanResult) {
      // After all conversions, show final result immediately
      setShowRomanResult(true);
      setIsAnimating(false);
      return;
    }
  }, [animationPhase, breakdown, currentStep, hideInputAndEquals, romanConvertedStates, showRomanResult]);

  useEffect(() => {
    if (animationPhase === 'showNumber' && result && !dropPhase) {
      const timer = setTimeout(() => {
        setDropPhase(true);
      }, 1400);
      return () => clearTimeout(timer);
    } else if (animationPhase === 'showNumber' && dropPhase) {
      // Start breakdown at the same time as the input number drops
      setShowBreakdown(true);
      setTimeout(() => {
        setFadeOutInput(true); // Start fading out input number after breakdown appears
        setTimeout(() => {
          setAnimationPhase('showBreakdown');
          setIsAnimating(true);
          setTimeout(() => {
            setShowRomanConversion(true);
          }, 900);
        }, 700);
      }, 700);
    }
  }, [animationPhase, result, dropPhase]);

  useEffect(() => {
    if (showRomanConversion && romanConvertedStates.includes(false)) {
      const nextToConvert = romanConvertedStates.findIndex(v => !v);
      if (nextToConvert !== -1) {
        const timer = setTimeout(() => {
          setRomanConvertedStates(prev => {
            const newStates = [...prev];
            newStates[nextToConvert] = true;
            return newStates;
          });
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [showRomanConversion, romanConvertedStates]);

  const handleConvert = (e) => {
    e.preventDefault();
    const num = parseInt(inputNumber);
    if (isNaN(num) || num < 1 || num > 4000) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    const numberBreakdown = breakDownNumber(num);
    setBreakdown(numberBreakdown);
    setResult(num.toString());
    setIsAnimating(false);
    setCurrentStep(0);
    setRomanResult('');
    setAnimatingNumbers([]);
    setShowRomanResult(false);
    setAnimationPhase('showNumber');
    setBreakdownStates(Array(numberBreakdown.length).fill('number'));
    setShowRomanBreakdown(false);
    setRomanConvertedStates(Array(numberBreakdown.length).fill(false));
    setHideInputAndEquals(false);
    setDropPhase(false);
    setShowRomanConversion(false);
    setShowBreakdown(false);
    setFadeOutInput(false);
  };

  const handleInputChange = (e) => {
    setInputNumber(e.target.value);
    setShowWarning(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConvert(event);
    }
  };

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 4000) + 1;
    setInputNumber(randomNum.toString());
    setShowWarning(false);
  };

  return (
    <div className="bg-gray-100 p-4 pt-2 min-h-screen">
      <Card className="w-full max-w-2xl mx-auto shadow-md bg-white" style={{ borderRadius: '16px' }}>
        <CardHeader className="bg-white text-black" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold" style={{ color: '#008543' }}>Roman Numeral Conversion</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <form onSubmit={handleConvert} className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={inputNumber}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter a number (1-4000)"
                className={`flex-grow text-lg text-black ${showWarning ? 'border-red-500' : ''}`}
                style={{ borderColor: '#008543', color: 'black' }}
              />
              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  style={{
                    backgroundColor: '#008543',
                    color: 'white',
                    border: '2px solid #008543',
                    fontWeight: 600,
                    padding: '0 16px',
                    height: '40px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: 'none'
                  }}
                >
                  Convert
                </Button>
                <Button
                  type="button"
                  onClick={generateRandomNumber}
                  style={{
                    backgroundColor: '#008543',
                    color: 'white',
                    border: '2px solid #008543',
                    fontWeight: 600,
                    padding: '0 16px',
                    height: '40px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: 'none'
                  }}
                >
                  <RefreshCw style={{ color: 'white', marginRight: '0.5rem', height: '1.25rem', width: '1.25rem' }} />
                  Random
                </Button>
              </div>
            </div>
            {showWarning && (
              <p className="text-sm text-red-500">Please enter a valid number between 1 and 4000.</p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start bg-green1000">
          <div className="w-full space-y-4">
            <div className="bg-green1000 p-4 rounded-lg">
              <div className="bg-green1000 p-3 rounded-md">
                <div className="text-center">
                  {/* Animation box with green outline */}
                  <div style={{ border: '2px solid rgba(0,133,69,0.18)', borderRadius: '16px', padding: '24px', minHeight: '110px', width: '100%', background: 'white', boxSizing: 'border-box', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="flex flex-col w-full h-24 relative">
                      {/* Default message when no conversion is active */}
                      {!result && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg text-gray-600 text-center">Enter a number to see its Roman numeral equivalent!</span>
                        </div>
                      )}
                      {/* Input number at the top */}
                      {animationPhase === 'showNumber' && result && (
                        <span
                          className={`text-5xl font-bold text-black transition-all duration-500 absolute left-1/2 -translate-x-1/2`}
                          style={{
                            top: 0,
                            transition: 'transform 0.5s, opacity 0.5s',
                            transform: dropPhase ? 'translate(-50%, 1.5rem)' : 'translate(-50%, 0)',
                            opacity: fadeOutInput ? 0 : dropPhase ? 0.8 : 1,
                          }}
                        >
                          {result}
                        </span>
                      )}
                      {/* Breakdown appears centered */}
                      {showBreakdown && result && (
                        <div
                          className="flex items-center justify-center w-full h-full"
                          style={{
                            gap: showRomanResult ? '0' : '0.75em',
                            transition: 'gap 1.6s cubic-bezier(0.77,0,0.18,1)',
                          }}
                        >
                          {breakdown.map((num, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-center transition-all duration-[2500ms] ${fadeOutInput ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'}`}
                              style={{
                                transitionProperty: 'opacity,transform,width,min-width,max-width',
                                transitionDuration: '2.5s,2.5s,1.6s,1.6s,1.6s',
                                transitionTimingFunction: 'cubic-bezier(0.86,0,0.07,1),cubic-bezier(0.86,0,0.07,1),cubic-bezier(0.77,0,0.18,1),cubic-bezier(0.77,0,0.18,1),cubic-bezier(0.77,0,0.18,1)',
                                transitionDelay: romanConvertedStates[index] ? `${0.1 * index}s` : '0s',
                                width: showRomanResult ? 'auto' : '6rem',
                                minWidth: showRomanResult ? 'auto' : '6rem',
                                maxWidth: showRomanResult ? 'auto' : '6rem',
                                overflow: 'hidden',
                                padding: 0,
                                margin: 0
                              }}
                            >
                              {/* Roman numeral conversion animation, one by one */}
                              <span className={`text-5xl font-bold text-black transition-all duration-[1200ms] w-full text-center ${romanConvertedStates[index] ? 'opacity-0 -translate-y-4 absolute' : 'opacity-100 translate-y-0 relative'}`}>{num}</span>
                              <span className={`text-5xl font-bold text-black transition-all duration-[1200ms] w-full text-center ${romanConvertedStates[index] ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute'}`}>{getRomanNumeral(num)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RomanNumerals;