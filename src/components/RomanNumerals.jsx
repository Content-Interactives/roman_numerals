import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Calculator, Lightbulb, BookOpen, RefreshCw, Check, X } from 'lucide-react';

const romanNumerals = () => {
  const [inputNumber, setInputNumber] = useState('');
  const [convertedNumber, setConvertedNumber] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputs, setUserInputs] = useState([]);
  const [inputStatus, setInputStatus] = useState([]);
  const [stepCompleted, setStepCompleted] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);

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

  const convertToRoman = (num) => {
    let steps = [];
    let remaining = num;

    for (let i = 0; i < romanNumerals.length; i++) {
      while (remaining >= romanNumerals[i].value) {
        steps.push({
          main: `${remaining} - ${romanNumerals[i].value} = ${remaining - romanNumerals[i].value}`,
          answer: romanNumerals[i].numeral
        });
        remaining -= romanNumerals[i].value;
      }
    }

    return steps;
  };

  const handleConvert = () => {
    const num = parseInt(inputNumber);
    if (isNaN(num) || num < 1 || num > 4000) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    setIsCalculating(true);

    const steps = convertToRoman(num);
    setSteps(steps);
    setConvertedNumber(inputNumber);
    setCurrentStepIndex(0);
    setUserInputs(new Array(steps.length).fill(''));
    setInputStatus(new Array(steps.length).fill(null));
    setStepCompleted(new Array(steps.length).fill(false));
    setConversionComplete(false);

    setIsCalculating(false);
  };

  const handleInputChange = (e) => {
    setInputNumber(e.target.value);
    setShowWarning(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleConvert();
    }
  };

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 4000) + 1;
    setInputNumber(randomNum.toString());
    setShowWarning(false);
  };

  const handleStepInputChange = (e, index) => {
    const newUserInputs = [...userInputs];
    newUserInputs[index] = e.target.value.toUpperCase();
    setUserInputs(newUserInputs);
    
    const newInputStatus = [...inputStatus];
    newInputStatus[index] = null;
    setInputStatus(newInputStatus);
  };

  const checkStep = (index) => {
    const isCorrect = userInputs[index] === steps[index].answer;
    
    const newInputStatus = [...inputStatus];
    newInputStatus[index] = isCorrect ? 'correct' : 'incorrect';
    setInputStatus(newInputStatus);

    if (isCorrect) {
      const newStepCompleted = [...stepCompleted];
      newStepCompleted[index] = true;
      setStepCompleted(newStepCompleted);

      if (index < steps.length - 1) {
        setCurrentStepIndex(index + 1);
      } else {
        setConversionComplete(true);
      }
    }
  };

  const skipStep = (index) => {
    const newUserInputs = [...userInputs];
    newUserInputs[index] = steps[index].answer;
    setUserInputs(newUserInputs);

    const newInputStatus = [...inputStatus];
    newInputStatus[index] = 'correct';
    setInputStatus(newInputStatus);

    const newStepCompleted = [...stepCompleted];
    newStepCompleted[index] = true;
    setStepCompleted(newStepCompleted);

    if (index < steps.length - 1) {
      setCurrentStepIndex(index + 1);
    } else {
      setConversionComplete(true);
    }
  };

  const getInputClassName = (index) => {
    let baseClass = "w-20 text-sm px-1 text-left";
    switch (inputStatus[index]) {
      case 'correct':
        return `${baseClass} border-green-500 focus:border-green-500`;
      case 'incorrect':
        return `${baseClass} border-red-500 focus:border-red-500`;
      default:
        return `${baseClass} border-gray-300 focus:border-blue-500`;
    }
  };

  const getFinalResult = () => {
    return userInputs.join('');
  };

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <Card className="w-full max-w-2xl mx-auto shadow-md bg-white">
        <CardHeader className="bg-sky-100 text-sky-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">Roman Numerals Converter</CardTitle>
            <Calculator size={40} className="text-sky-600" />
          </div>
          <CardDescription className="text-sky-700 text-lg">Convert Numbers to Roman Numerals!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Alert className="bg-blue-50 border-blue-100">
            <Lightbulb className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-700">Roman Numerals Basics</AlertTitle>
            <AlertDescription className="text-blue-600">
              <p className="mb-4">
                Roman numerals represent numbers by combinations of letters from the Latin alphabet. When a smaller numeral is before a larger one, it means subtraction.
              </p>
              <div className="grid grid-cols-4 gap-2 my-4">
                <div>I = 1</div>
                <div>V = 5</div>
                <div>X = 10</div>
                <div>L = 50</div>
                <div>C = 100</div>
                <div>D = 500</div>
                <div>M = 1000</div>
              </div>
              <p className="mt-4"><strong>Examples:</strong> IV = 4 (5-1), XC = 90 (100-10), XCIX = 99 (100-10+10-1)</p>
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={inputNumber}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter a number (1-4000)"
                className={`flex-grow text-lg border-sky-200 focus:border-sky-400 ${showWarning ? 'border-red-500' : ''}`}
              />
              <Button onClick={generateRandomNumber} className="flex items-center bg-sky-500 hover:bg-sky-600 text-white h-10 whitespace-nowrap">
                <RefreshCw className="mr-2 h-4 w-4" />
                Random
              </Button>
            </div>
            {showWarning && (
              <p className="text-sm text-red-500">Please enter a valid number between 1 and 4000.</p>
            )}
            <Button 
              onClick={handleConvert} 
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-white text-xl py-6"
              disabled={isCalculating}
            >
              {isCalculating ? 'Converting...' : 'Convert to Roman Numeral'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start bg-gray-50">
          {steps.length > 0 && (
            <div className="w-full">
              <p className="font-semibold text-purple-600 mb-2">Conversion Steps:</p>
              {steps.map((step, index) => (
                <div key={index} className={`bg-purple-50 p-2 rounded mb-2 ${index > currentStepIndex ? 'hidden' : ''}`}>
                  <p>{step.main}</p>
                  {stepCompleted[index] ? (
                    <p className="text-green-600">Add: {step.answer}</p>
                  ) : (
                    index === currentStepIndex && (
                      <div className="flex items-center space-x-1 text-sm mt-2">
                        <Input
                          type="text"
                          value={userInputs[index]}
                          onChange={(e) => handleStepInputChange(e, index)}
                          placeholder="Enter Roman numeral"
                          className={getInputClassName(index)}
                        />
                        <Button onClick={() => checkStep(index)} className="bg-blue-400 hover:bg-blue-500 px-2 py-1 text-xs">
                          Check
                        </Button>
                        <Button onClick={() => skipStep(index)} className="bg-gray-400 hover:bg-gray-500 px-2 py-1 text-xs">
                          Skip
                        </Button>
                        {inputStatus[index] === 'correct' && <Check className="text-green-500 w-4 h-4" />}
                        {inputStatus[index] === 'incorrect' && <X className="text-red-500 w-4 h-4" />}
                      </div>
                    )
                  )}
                </div>
              ))}
              {conversionComplete && (
                <Alert className="mt-4 bg-emerald-50 border-emerald-200">
                  <AlertTitle className="text-emerald-700 text-xl">Conversion Complete!</AlertTitle>
                  <AlertDescription className="text-emerald-600 text-lg">
                    The number {convertedNumber} in Roman numerals is <span className="font-bold">{getFinalResult()}</span>.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
      <div className="mt-4 text-center text-gray-700">
        <p className="flex items-center justify-center">
          <BookOpen className="mr-2 text-gray-600" />
          Roman numerals are still used today in various contexts, including book chapters, clock faces, and movie sequel titles!
        </p>
      </div>
    </div>
  );
};

export default romanNumerals;