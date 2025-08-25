import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Calculator, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../orbit-glow-button/orbit-glow-button.css';

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
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [finalRomanNumeral, setFinalRomanNumeral] = useState('');
  const [hasUserTriggeredBreakdown, setHasUserTriggeredBreakdown] = useState(false);
  const [lastConvertedIndex, setLastConvertedIndex] = useState(null);
  const [showBreakdownAnimated, setShowBreakdownAnimated] = useState(false);
  const [breakdownAnimationTriggered, setBreakdownAnimationTriggered] = useState(false);
  const [hoveredNumber, setHoveredNumber] = useState(null);
  const [clickedNumber, setClickedNumber] = useState(null);
  const [conversionStage, setConversionStage] = useState('input'); // 'input', 'showNumber', 'breakdownArabic', 'breakdownRoman', 'final'
  const [isNavigating, setIsNavigating] = useState(false);

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

  // Handle clicking on a breakdown number
  const handleNumberClick = (index) => {
    setIsNavigating(false);
    
    // For mobile: handle subtractive notation explanation
    if (window.innerWidth < 640) {
      const num = breakdown[index];
      if (romanConvertedStates[index] && (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40)) {
        setClickedNumber(clickedNumber === index ? null : index);
        return; // Don't toggle conversion state on mobile for subtractive notation numbers
      }
    }
    
    setRomanConvertedStates(prev => {
      const newStates = [...prev];
      newStates[index] = !newStates[index]; // Toggle the state
      return newStates;
    });
    setLastConvertedIndex(index);
  };

  // Handle showing final result
  const handleShowFinalResult = () => {
    const finalResult = breakdown
      .map((num, index) => romanConvertedStates[index] ? getRomanNumeral(num) : '')
      .join('');
    setFinalRomanNumeral(finalResult);
    setShowFinalResult(true);
    setConversionStage('final');
  };

  // Check if all numbers are converted
  const allNumbersConverted = breakdown.length > 0 && romanConvertedStates.every(state => state);

  // Flexi instruction message logic
  let flexiMessage = '';
  if (result && !hasUserTriggeredBreakdown) {
    flexiMessage = `Click ${result} to break it into smaller sections!`;
  } else if (showBreakdown && hasUserTriggeredBreakdown && result && !showFinalResult && !allNumbersConverted) {
    flexiMessage = "Click each number to see its Roman numeral equivalent!";
  } else if (showBreakdown && hasUserTriggeredBreakdown && result && !showFinalResult && allNumbersConverted) {
    // Check if the breakdown contains any subtractive notation numbers
    const hasSubtractiveNotation = breakdown.some(num => [4, 9, 900, 400, 90, 40].includes(num));
    if (hasSubtractiveNotation) {
      // Get the specific subtractive notation numerals present in this breakdown
      const subtractiveNumerals = breakdown
        .filter(num => [4, 9, 900, 400, 90, 40].includes(num))
        .map(num => {
          if (num === 4) return 'IV';
          if (num === 9) return 'IX';
          if (num === 900) return 'CM';
          if (num === 400) return 'CD';
          if (num === 90) return 'XC';
          if (num === 40) return 'XL';
          return '';
        })
        .filter(roman => roman !== '');
      
      flexiMessage = `Hover over ${subtractiveNumerals.join(', ')} to learn about subtractive notation!`;
    } else {
      flexiMessage = "Great! Now click \"Show Final Result\" to see the full Roman numeral!";
    }
  } else if (showFinalResult) {
    flexiMessage = "Awesome job! You've completed the conversion!";
  }

  // Animation sequence for input number to breakdown
  useEffect(() => {
    if (isNavigating) {
      // Instantly show breakdown, skip all animation
      if (animationPhase === 'showNumber' && result && hasUserTriggeredBreakdown) {
        setDropPhase(true);
        setFadeOutInput(true);
        setShowBreakdown(true);
        setShowBreakdownAnimated(true);
        setConversionStage('breakdownArabic');
        setBreakdownAnimationTriggered(true);
      }
      return;
    }
    if (animationPhase === 'showNumber' && result && hasUserTriggeredBreakdown && !dropPhase) {
      const timer = setTimeout(() => {
        setDropPhase(true);
      }, 1400);
      return () => clearTimeout(timer);
    } else if (animationPhase === 'showNumber' && dropPhase && !fadeOutInput) {
      const timer = setTimeout(() => {
        setFadeOutInput(true);
        setTimeout(() => {
          setShowBreakdown(true);
          setShowBreakdownAnimated(true);
          setConversionStage('breakdownArabic'); // Update stage when breakdown appears
          setTimeout(() => {
            setBreakdownAnimationTriggered(true);
          }, 100);
        }, 700);
      }, 700);
        return () => clearTimeout(timer);
    }
  }, [animationPhase, result, hasUserTriggeredBreakdown, dropPhase, fadeOutInput, isNavigating]);

  const handleConvert = (e) => {
    e.preventDefault();
    const num = parseInt(inputNumber);
    if (isNaN(num) || num < 1 || num > 4000) {
      setShowWarning(true);
      return;
    }

    console.log('handleConvert called with number:', num);
    setShowWarning(false);
    setConversionStage('input'); // Reset to input stage
    const numberBreakdown = breakDownNumber(num);
    setBreakdown(numberBreakdown);
    setResult(num.toString());
    setIsAnimating(false);
    setCurrentStep(0);
    setRomanResult('');
    setAnimatingNumbers([]);
    setShowRomanResult(false);
    setAnimationPhase('idle');
    setBreakdownStates(Array(numberBreakdown.length).fill('number'));
    setShowRomanBreakdown(false);
    setRomanConvertedStates(Array(numberBreakdown.length).fill(false));
    setHideInputAndEquals(false);
    setDropPhase(false);
    setShowRomanConversion(false);
    setShowBreakdown(false);
    setHasUserTriggeredBreakdown(false);
    setFadeOutInput(false);
    setShowFinalResult(false);
    setFinalRomanNumeral('');
    setShowBreakdownAnimated(false);
    setBreakdownAnimationTriggered(false);
    setHoveredNumber(null);
    setClickedNumber(null);
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

  // Navigation functions for conversion stages
  const goBack = () => {
    setIsNavigating(true);
    console.log('=== BACK BUTTON CLICKED ===');
    console.log('Current stage:', conversionStage);
    
    if (conversionStage === 'final') {
      setConversionStage('breakdownRoman');
      setShowFinalResult(false);
      console.log('Going back to breakdownRoman stage');
    } else if (conversionStage === 'breakdownRoman') {
      setConversionStage('breakdownArabic');
      setRomanConvertedStates(Array(breakdown.length).fill(false));
      console.log('Going back to breakdownArabic stage');
    } else if (conversionStage === 'breakdownArabic') {
      setConversionStage('input');
      setShowBreakdown(false);
      setShowBreakdownAnimated(false);
      setBreakdownAnimationTriggered(false);
      setHasUserTriggeredBreakdown(false);
      setAnimationPhase('idle');
      setDropPhase(false);
      setFadeOutInput(false);
      console.log('Going back to input stage');
    }
  };

  const goForward = () => {
    setIsNavigating(true);
    console.log('=== FORWARD BUTTON CLICKED ===');
    console.log('Current stage:', conversionStage);
    
    if (conversionStage === 'input' && result) {
      setConversionStage('showNumber');
      setAnimationPhase('showNumber');
      setHasUserTriggeredBreakdown(true);
      console.log('Going forward to showNumber stage');
    } else if (conversionStage === 'showNumber') {
      setConversionStage('breakdownArabic');
      setDropPhase(true);
      setTimeout(() => {
        setFadeOutInput(true);
        setTimeout(() => {
          setShowBreakdown(true);
          setShowBreakdownAnimated(true);
          setTimeout(() => {
            setBreakdownAnimationTriggered(true);
          }, 100);
        }, 700);
      }, 700);
      console.log('Going forward to breakdownArabic stage');
    } else if (conversionStage === 'breakdownArabic') {
      // Convert all numbers to Roman numerals
      setRomanConvertedStates(Array(breakdown.length).fill(true));
      setConversionStage('breakdownRoman');
      console.log('Going forward to breakdownRoman stage');
    } else if (conversionStage === 'breakdownRoman') {
      setConversionStage('final');
      handleShowFinalResult();
      console.log('Going forward to final stage');
    }
  };

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 4000) + 1;
    setInputNumber(randomNum.toString());
    setShowWarning(false);
  };

  // Reset lastConvertedIndex when breakdown is reset
  useEffect(() => {
    if (!showBreakdown) setLastConvertedIndex(null);
  }, [showBreakdown]);

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
              <p className="text-sm text-black">Please enter a valid number between 1 and 4000.</p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start bg-green1000">
          <div className="w-full space-y-4" style={{ marginTop: '2rem' }}>
            <div className="bg-green1000 p-4 rounded-lg">
              <div className="bg-green1000 p-3 rounded-md" style={{ position: 'relative' }}>
                {/* Flexi image above the animation box, feet on top of the box */}
                <div style={{ position: 'relative', width: '100%', height: '60px' }}>
                  <img
                    src={`${import.meta.env.BASE_URL}Flexi_Present.png`}
                    alt="Flexi mascot"
                    style={{
                      position: 'absolute',
                      right: window.innerWidth < 640 ? '8px' : '16px',
                      bottom: '28px',
                      width: window.innerWidth < 640 ? '70px' : '90px',
                      height: 'auto',
                      zIndex: 2,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  />
                </div>
                  <div className="text-center">
                  {/* Animation box with green outline */}
                  <div style={{ position: 'relative', border: '2px solid rgba(0,133,69,0.18)', borderRadius: '16px', padding: '24px', minHeight: '110px', width: '100%', background: 'white', boxSizing: 'border-box', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-30px' }}>
                    {/* Navigation buttons positioned on left top side, in line with Flexi's feet */}
                    <div style={{ position: 'absolute', top: '160px', left: '8px', zIndex: 20 }}>
                      <div className="flex items-center space-x-1">
                        <Button
                          type="button"
                          onClick={goBack}
                          size="sm"
                          className="flex items-center space-x-1"
                          style={{
                            backgroundColor: '#008543',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.4rem',
                            minWidth: 'auto',
                            height: '32px',
                            width: '32px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderRadius: '6px',
                            opacity: 1,
                            cursor: conversionStage === 'input' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronLeft size={14} />
                        </Button>
                        <Button
                          type="button"
                          onClick={goForward}
                          size="sm"
                          className="flex items-center space-x-1"
                          style={{
                            backgroundColor: '#008543',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.4rem',
                            minWidth: 'auto',
                            height: '32px',
                            width: '32px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderRadius: '6px',
                            opacity: 1,
                            cursor: (conversionStage === 'input' && !result) || conversionStage === 'final' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col w-full h-24 relative">
                      {/* Default message when no conversion is active */}
                      {!result && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg text-gray-600 text-center">Enter a number to see its Roman numeral equivalent!</span>
                          </div>
                      )}
                      {/* Input number at the top */}
                      {animationPhase === 'idle' && result && !hasUserTriggeredBreakdown && (
                        <span
                          className={`text-5xl font-bold text-black transition-all duration-500 absolute left-1/2 -translate-x-1/2 cursor-pointer hover:scale-110`}
                          style={{
                            top: '50%',
                            transition: 'transform 0.5s, opacity 0.5s',
                            transform: dropPhase ? 'translate(-50%, calc(-50% + 1.5rem))' : 'translate(-50%, -50%)',
                            opacity: fadeOutInput ? 0 : dropPhase ? 0.8 : 1,
                            zIndex: 2,
                            textShadow: '0 0 2px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.4), 0 0 6px rgba(34, 197, 94, 0.3), 0 0 8px rgba(34, 197, 94, 0.2)'
                          }}
                          onClick={() => {
                            if (conversionStage === 'input') {
                              goForward();
                            }
                          }}
                          title="Click to break down the number"
                        >
                          {result}
                        </span>
                      )}
                      {/* After user triggers breakdown, continue as before */}
                      {animationPhase === 'showNumber' && result && hasUserTriggeredBreakdown && (
                        <span
                          className={`text-5xl font-bold text-black transition-all duration-500 absolute left-1/2 -translate-x-1/2`}
                          style={{
                            top: '50%',
                            transition: 'transform 0.5s, opacity 0.5s',
                            transform: dropPhase ? 'translate(-50%, calc(-50% + 1.5rem))' : 'translate(-50%, -50%)',
                            opacity: fadeOutInput ? 0 : dropPhase ? 0.8 : 1,
                            textShadow: '0 0 2px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.4), 0 0 6px rgba(34, 197, 94, 0.3), 0 0 8px rgba(34, 197, 94, 0.2)'
                          }}
                        >
                          {result}
                        </span>
                      )}
                      {/* Breakdown appears centered */}
                      {showBreakdownAnimated && hasUserTriggeredBreakdown && result && !showFinalResult && (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          {breakdown.length > 6 ? (
                            <>
                              {/* Balanced two-line layout for large breakdowns */}
                              {(() => {
                                const midPoint = Math.ceil(breakdown.length / 2);
                                const firstLine = breakdown.slice(0, midPoint);
                                const secondLine = breakdown.slice(midPoint);
                                return (
                                  <>
                                    {/* First line */}
                                    <div
                                      className="flex items-center justify-center w-full"
                                      style={{ 
                                        justifyContent: 'center',
                                        gap: '0.5em',
                                        marginBottom: '0.5em'
                                      }}
                                    >
                                      {firstLine.map((num, index) => {
                                        const originalIndex = index;
                                        const showSubtractiveMsg = romanConvertedStates[originalIndex] && (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) && (window.innerWidth < 640 ? clickedNumber === originalIndex : hoveredNumber === originalIndex);
                                        return (
                                          <div
                                            key={`first-${index}`}
                                            className={`flex flex-row items-center justify-center transition-all cursor-pointer hover:scale-110`}
                                            style={{
                                              width: '4rem',
                                              minWidth: '4rem',
                                              maxWidth: '4rem',
                                              overflow: 'visible',
                                              padding: 0,
                                              margin: 0,
                                              opacity: breakdownAnimationTriggered ? 1 : 0,
                                              transform: breakdownAnimationTriggered ? 'translateY(0)' : 'translateY(-2.5rem)',
                                              transition: isNavigating ? 'none' : 'opacity 1.2s cubic-bezier(0.77,0,0.18,1), transform 1.6s cubic-bezier(0.77,0,0.18,1)',
                                            }}
                                            onClick={() => handleNumberClick(originalIndex)}
                                            onMouseEnter={() => romanConvertedStates[originalIndex] && (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) && setHoveredNumber(originalIndex)}
                                            onMouseLeave={() => setHoveredNumber(null)}
                                          >
                                            <div style={{ width: '4rem', minWidth: '4rem', maxWidth: '4rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                              <span className={`text-3xl font-bold text-black ${isNavigating ? '' : 'transition-all duration-[1200ms]'} w-full text-center ${romanConvertedStates[originalIndex] ? 'opacity-0 -translate-y-4 absolute' : 'opacity-100 translate-y-0 relative'}`}>{num}</span>
                                              <span className={`text-3xl font-bold text-black ${isNavigating ? '' : 'transition-all duration-[1200ms]'} w-full text-center ${romanConvertedStates[originalIndex] ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute'}`} style={{
                                                textShadow: (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) ? '0 0 2px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.4), 0 0 6px rgba(34, 197, 94, 0.3), 0 0 8px rgba(34, 197, 94, 0.2)' : 'none'
                                              }}>{getRomanNumeral(num)}</span>
                                              {showSubtractiveMsg && (
                                                <span style={{
                                                  position: 'absolute',
                                                  left: index === Math.floor(breakdown.length / 2) ? '50%' : 
                                                        index < breakdown.length / 2 ? 'auto' : '80%',
                                                  right: index < breakdown.length / 2 ? '80%' : 'auto',
                                                  top: index === Math.floor(breakdown.length / 2) ? '-140%' : '50%',
                                                  transform: index === Math.floor(breakdown.length / 2) ? 'translateX(-50%)' : 'translateY(-50%)',
                                                  marginLeft: index === Math.floor(breakdown.length / 2) ? '0' : 
                                                             index < breakdown.length / 2 ? '0' : '5px',
                                                  marginRight: index < breakdown.length / 2 ? '0' : 
                                                              index < breakdown.length / 2 ? '5px' : '0',
                                                  background: 'white',
                                                  border: '1px solid #008543',
                                                  borderRadius: '8px',
                                                  padding: '3px 7px',
                                                  color: '#008543',
                                                  fontWeight: 400,
                                                  fontSize: '0.78rem',
                                                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                                  maxWidth: '220px',
                                                  minWidth: '180px',
                                                  wordBreak: 'break-word',
                                                  zIndex: 20,
                                                  textAlign: 'center',
                                                  lineHeight: 1.2,
                                                  transition: 'none',
                                                  opacity: 1,
                                                }}>
                                                  {num === 4 && 'IV represents 4. It uses subtractive notation (I before V).'}
                                                  {num === 9 && 'IX represents 9. It uses subtractive notation (I before X).'}
                                                  {num === 900 && 'CM represents 900. It uses subtractive notation (C before M).'}
                                                  {num === 400 && 'CD represents 400. It uses subtractive notation (C before D).'}
                                                  {num === 90 && 'XC represents 90. It uses subtractive notation (X before C).'}
                                                  {num === 40 && 'XL represents 40. It uses subtractive notation (X before L).'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {/* Second line */}
                                    <div
                                      className="flex items-center justify-center w-full"
                          style={{
                                        justifyContent: 'center',
                                        gap: breakdown.filter(num => num === 1).length > 2 ? '0.005em' : '0.5em'
                                      }}
                                    >
                                      {secondLine.map((num, index) => {
                                        const originalIndex = midPoint + index;
                                        const showSubtractiveMsg = romanConvertedStates[originalIndex] && (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) && (window.innerWidth < 640 ? clickedNumber === originalIndex : hoveredNumber === originalIndex);
                                        return (
                                          <div
                                            key={`second-${index}`}
                                            className={`flex flex-row items-center justify-center transition-all cursor-pointer hover:scale-110`}
                                            style={{
                                              width: '4rem',
                                              minWidth: '4rem',
                                              maxWidth: '4rem',
                                              overflow: 'visible',
                                              padding: 0,
                                              margin: 0,
                                              opacity: breakdownAnimationTriggered ? 1 : 0,
                                              transform: breakdownAnimationTriggered ? 'translateY(0)' : 'translateY(-2.5rem)',
                                              transition: isNavigating ? 'none' : 'opacity 1.2s cubic-bezier(0.77,0,0.18,1), transform 1.6s cubic-bezier(0.77,0,0.18,1)',
                          }}
                                            onClick={() => handleNumberClick(originalIndex)}
                                            onMouseEnter={() => romanConvertedStates[originalIndex] && (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) && setHoveredNumber(originalIndex)}
                                            onMouseLeave={() => setHoveredNumber(null)}
                                          >
                                            <div style={{ width: '4rem', minWidth: '4rem', maxWidth: '4rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                              <span className={`text-3xl font-bold text-black ${isNavigating ? '' : 'transition-all duration-[1200ms]'} w-full text-center ${romanConvertedStates[originalIndex] ? 'opacity-0 -translate-y-4 absolute' : 'opacity-100 translate-y-0 relative'}`}>{num}</span>
                                              <span className={`text-3xl font-bold text-black ${isNavigating ? '' : 'transition-all duration-[1200ms]'} w-full text-center ${romanConvertedStates[originalIndex] ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute'}`} style={{
                                                textShadow: (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) ? '0 0 2px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.4), 0 0 6px rgba(34, 197, 94, 0.3), 0 0 8px rgba(34, 197, 94, 0.2)' : 'none'
                                              }}>{getRomanNumeral(num)}</span>
                                              {showSubtractiveMsg && (
                                                <span style={{
                                                  position: 'absolute',
                                                  left: index === Math.floor(breakdown.length / 2) ? '50%' : 
                                                        index < breakdown.length / 2 ? 'auto' : '80%',
                                                  right: index < breakdown.length / 2 ? '80%' : 'auto',
                                                  top: index === Math.floor(breakdown.length / 2) ? '-140%' : '50%',
                                                  transform: index === Math.floor(breakdown.length / 2) ? 'translateX(-50%)' : 'translateY(-50%)',
                                                  marginLeft: index === Math.floor(breakdown.length / 2) ? '0' : 
                                                             index < breakdown.length / 2 ? '0' : '5px',
                                                  marginRight: index < breakdown.length / 2 ? '0' : 
                                                              index < breakdown.length / 2 ? '5px' : '0',
                                                  background: 'white',
                                                  border: '1px solid #008543',
                                                  borderRadius: '8px',
                                                  padding: '3px 7px',
                                                  color: '#008543',
                                                  fontWeight: 400,
                                                  fontSize: '0.78rem',
                                                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                                  maxWidth: '220px',
                                                  minWidth: '180px',
                                                  wordBreak: 'break-word',
                                                  zIndex: 20,
                                                  textAlign: 'center',
                                                  lineHeight: 1.2,
                                                  transition: 'none',
                                                  opacity: 1,
                                                }}>
                                                  {num === 4 && 'IV represents 4. It uses subtractive notation (I before V).'}
                                                  {num === 9 && 'IX represents 9. It uses subtractive notation (I before X).'}
                                                  {num === 900 && 'CM represents 900. It uses subtractive notation (C before M).'}
                                                  {num === 400 && 'CD represents 400. It uses subtractive notation (C before D).'}
                                                  {num === 90 && 'XC represents 90. It uses subtractive notation (X before C).'}
                                                  {num === 40 && 'XL represents 40. It uses subtractive notation (X before L).'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <div
                              className="flex items-center justify-center w-full h-full"
                              style={{
                                justifyContent: 'center',
                                gap: breakdown.filter(num => num === 1).length > 2 ? '0.005em' : 
                                     breakdown.length <= 3 && breakdown.some(num => num === 1000) ? '1.35em' :
                                     breakdown.filter(num => num === 1000).length > 1 ? '1.4em' :
                                     breakdown.length <= 3 ? '0.6em' : '0.5em',
                                flexWrap: 'wrap',
                                alignContent: 'center'
                              }}
                            >
                              {breakdown.map((num, index) => {
                                const showSubtractiveMsg = romanConvertedStates[index] && (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) && (window.innerWidth < 640 ? clickedNumber === index : hoveredNumber === index);
                                return (
                                  <div
                                    key={index}
                                    className={`flex flex-row items-center justify-center transition-all cursor-pointer hover:scale-110`}
                                    style={{
                                      width: '4rem',
                                      minWidth: '4rem',
                                      maxWidth: '4rem',
                                      overflow: 'visible',
                                      padding: 0,
                                      margin: 0,
                                      opacity: breakdownAnimationTriggered ? 1 : 0,
                                      transform: breakdownAnimationTriggered ? 'translateY(0)' : 'translateY(-2.5rem)',
                                      transition: isNavigating ? 'none' : 'opacity 1.2s cubic-bezier(0.77,0,0.18,1), transform 1.6s cubic-bezier(0.77,0,0.18,1)',
                                    }}
                                    onClick={() => handleNumberClick(index)}
                                    onMouseEnter={() => romanConvertedStates[index] && (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) && setHoveredNumber(index)}
                                    onMouseLeave={() => setHoveredNumber(null)}
                                  >
                                    <div style={{ width: '4rem', minWidth: '4rem', maxWidth: '4rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                      {/* Roman numeral conversion animation, triggered by click */}
                                      <span className={`text-3xl font-bold text-black ${isNavigating ? '' : 'transition-all duration-[1200ms]'} w-full text-center ${romanConvertedStates[index] ? 'opacity-0 -translate-y-4 absolute' : 'opacity-100 translate-y-0 relative'}`}>{num}</span>
                                      <span className={`text-3xl font-bold text-black ${isNavigating ? '' : 'transition-all duration-[1200ms]'} w-full text-center ${romanConvertedStates[index] ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute'}`} style={{
                                        textShadow: (num === 4 || num === 9 || num === 900 || num === 400 || num === 90 || num === 40) ? '0 0 2px rgba(34, 197, 94, 0.6), 0 0 4px rgba(34, 197, 94, 0.4), 0 0 6px rgba(34, 197, 94, 0.3), 0 0 8px rgba(34, 197, 94, 0.2)' : 'none'
                                      }}>{getRomanNumeral(num)}</span>
                                      {showSubtractiveMsg && (
                                        <span style={{
                                          position: 'absolute',
                                          left: index === Math.floor(breakdown.length / 2) ? '50%' : 
                                                        index < breakdown.length / 2 ? 'auto' : '80%',
                                          right: index < breakdown.length / 2 ? '80%' : 'auto',
                                          top: index === Math.floor(breakdown.length / 2) ? '-140%' : '50%',
                                          transform: index === Math.floor(breakdown.length / 2) ? 'translateX(-50%)' : 'translateY(-50%)',
                                          marginLeft: index === Math.floor(breakdown.length / 2) ? '0' : 
                                                             index < breakdown.length / 2 ? '0' : '5px',
                                          marginRight: index < breakdown.length / 2 ? '0' : 
                                                              index < breakdown.length / 2 ? '5px' : '0',
                                          background: 'white',
                                          border: '1px solid #008543',
                                          borderRadius: '8px',
                                          padding: '3px 7px',
                                          color: '#008543',
                                          fontWeight: 400,
                                          fontSize: '0.78rem',
                                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                          maxWidth: '220px',
                                          minWidth: '180px',
                                          wordBreak: 'break-word',
                                          zIndex: 20,
                                          textAlign: 'center',
                                          lineHeight: 1.2,
                                          transition: 'none',
                                          opacity: 1,
                                        }}>
                                          {num === 4 && 'IV represents 4. It uses subtractive notation (I before V).'}
                                          {num === 9 && 'IX represents 9. It uses subtractive notation (I before X).'}
                                          {num === 900 && 'CM represents 900. It uses subtractive notation (C before M).'}
                                          {num === 400 && 'CD represents 400. It uses subtractive notation (C before D).'}
                                          {num === 90 && 'XC represents 90. It uses subtractive notation (X before C).'}
                                          {num === 40 && 'XL represents 40. It uses subtractive notation (X before L).'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Final result display */}
                      {showFinalResult && (
                        <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
                          <span className="text-5xl font-bold text-black">{finalRomanNumeral}</span>
                        </div>
                      )}
                    </div> {/* .flex.flex-col.w-full.h-24.relative */}
                  </div> {/* animation box */}
                  
                  {/* Show Final Result button - positioned underneath the animation box */}
                  {showBreakdown && hasUserTriggeredBreakdown && result && !showFinalResult && allNumbersConverted && (
                    <div
                      className="glow-button simple-glow"
                      style={{ 
                        margin: window.innerWidth < 640 ? '24px auto 0 80px' : '24px auto 0 auto', 
                        width: 'fit-content', 
                        minWidth: window.innerWidth < 640 ? 180 : 140, 
                        height: 44, 
                        fontSize: 16, 
                        fontWeight: 600, 
                        padding: '0 18px', 
                        cursor: 'pointer' 
                      }}
                      onClick={handleShowFinalResult}
                      tabIndex={0}
                      role="button"
                      onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleShowFinalResult(); }}
                    >
                      Show Final Result
                    </div>
                  )}
                  
                  {/* Flexi speech bubble message */}
                  {flexiMessage && (
                    <div
                      style={{
                        position: 'absolute',
                        right: window.innerWidth < 640 ? '80px' : '120px',
                        top: window.innerWidth < 640 ? '-45px' : '-50px',
                        zIndex: 3,
                        maxWidth: window.innerWidth < 640 ? '200px' : (flexiMessage.startsWith('Great! Now click') ? '340px' : '260px'),
                      }}
                    >
                      <div style={{
                        background: 'white',
                        border: '2px solid #008543',
                        borderRadius: '16px',
                        padding: window.innerWidth < 640 ? '8px 12px' : '12px 18px',
                        color: '#008543',
                        fontWeight: 600,
                        fontSize: window.innerWidth < 640 ? '0.875rem' : '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        marginBottom: '8px',
                        position: 'relative',
                      }}>
                        {flexiMessage}
                      </div>
                    </div>
                  )}
                </div> {/* .text-center */}
              </div> {/* .bg-green1000.p-3.rounded-md */}
            </div> {/* .bg-green1000.p-4.rounded-lg */}
          </div> {/* .w-full.space-y-4 */}
        </CardFooter>
      </Card>
    </div>
  );
};

export default RomanNumerals;