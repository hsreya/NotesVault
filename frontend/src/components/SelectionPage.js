import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import './SelectionPage.css';

const containerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'white'
};

const canvasStyle = {
  width: 1280,
  height: 832,
  position: 'relative',
  background: 'white',
  overflow: 'hidden'
};

const branchOptions = [
  {
    label: 'Mechanical Engineering',
    match: 'Mechanical Engineering',
    style: {
      width: 439,
      height: 48,
      left: 108,
      top: 540,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'Electrical Engineering',
    match: 'Electrical Engineering',
    style: {
      width: 419,
      height: 96,
      left: 108,
      top: 430,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'Computer Science and Engineering',
    match: 'Computer Science and Engineering',
    style: {
      width: 650,
      height: 48,
      left: 109,
      top: 485,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'Computer Engineering',
    match: 'Computer Engineering',
    style: {
      width: 439,
      height: 48,
      left: 107,
      top: 375,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  }
];

const yearOptions = [
  {
    label: 'First Year ',
    match: 'First Year',
    style: {
      width: 461,
      height: 48,
      left: 109,
      top: 375,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'Forth Year',
    match: 'Forth Year',
    style: {
      width: 1003,
      height: 46,
      left: 108,
      top: 540,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'Second Year',
    match: 'Second Year',
    style: {
      width: 1003,
      height: 46,
      left: 108,
      top: 430,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'Third Year',
    match: 'Third Year',
    style: {
      width: 377,
      left: 109,
      top: 485,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  }
];

const semesterOptions = [
  {
    label: 'SEM I',
    match: 'SEM I',
    style: {
      width: 308,
      height: 48,
      left: 109,
      top: 375,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'SEM IV',
    match: 'SEM IV',
    style: {
      width: 1003,
      height: 46,
      left: 108,
      top: 540,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'SEM II',
    match: 'SEM II',
    style: {
      width: 1003,
      height: 46,
      left: 108,
      top: 430,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  },
  {
    label: 'SEM III',
    match: 'SEM III',
    style: {
      width: 127,
      height: 48,
      left: 109,
      top: 485,
      position: 'absolute',
      color: '#7A7A7A',
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: '400',
      wordWrap: 'break-word',
      cursor: 'pointer'
    }
  }
];

const filterOptions = (options, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) => option.match.toLowerCase().includes(normalized));
};

const SelectionPage = ({ updateInputs, inputs, initialStep = 'branch' }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialStep);
  const [branchInput, setBranchInput] = useState(inputs?.branch || '');
  const [yearInput, setYearInput] = useState(inputs?.year || '');
  const [semesterInput, setSemesterInput] = useState(inputs?.semester || '');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const visibleBranches = useMemo(
    () => filterOptions(branchOptions, branchInput),
    [branchInput]
  );
  const visibleYears = useMemo(() => filterOptions(yearOptions, yearInput), [yearInput]);
  const visibleSemesters = useMemo(
    () => filterOptions(semesterOptions, semesterInput),
    [semesterInput]
  );

  const transitionStep = (nextStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 180);
  };

  const handleBranchSelect = (branch) => {
    setBranchInput(branch);
    updateInputs('branch', branch);
    transitionStep('year');
  };

  const handleYearSelect = (year) => {
    setYearInput(year);
    updateInputs('year', year);
    transitionStep('semester');
  };

  const handleSemesterSelect = async (semester) => {
    setSemesterInput(semester);
    updateInputs('semester', semester);
    updateInputs('query', semester);
    try {
      await api.post('/api/save-inputs', {
        ...inputs,
        branch: branchInput,
        year: yearInput,
        semester,
        query: semester
      });
    } catch (err) {
      console.error('Error saving inputs');
    } finally {
      navigate('/notes');
    }
  };

  const handleNext = async () => {
    if (step === 'branch') {
      updateInputs('branch', branchInput);
      transitionStep('year');
      return;
    }

    if (step === 'year') {
      updateInputs('year', yearInput);
      transitionStep('semester');
      return;
    }

    updateInputs('semester', semesterInput);
    updateInputs('query', semesterInput);
    try {
      await api.post('/api/save-inputs', {
        ...inputs,
        branch: branchInput,
        year: yearInput,
        semester: semesterInput,
        query: semesterInput
      });
    } catch (err) {
      console.error('Error saving inputs');
    } finally {
      navigate('/notes');
    }
  };

  return (
    <div style={containerStyle}>
      {step === 'branch' && (
        <div style={canvasStyle} className={`selection-canvas ${isTransitioning ? 'selection-canvas--fade' : ''}`}>
          <div style={{width: 777, height: 75, left: 107, top: 172, position: 'absolute', color: '#444343', fontSize: 40, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Enter Your Current Education Feild</div>
          <input
            className="selection-input"
            aria-label="Enter Your Branch"
            placeholder="Enter your branch..."
            autoFocus
            value={branchInput}
            onChange={(event) => setBranchInput(event.target.value)}
            onFocus={() => updateInputs('branch', branchInput)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleNext();
            }}
            style={{
              width: 599,
              height: 88,
              left: 105,
              top: 244,
              position: 'absolute',
              color: branchInput ? 'black' : '#E2E2E2',
              fontSize: 64,
              fontFamily: 'Inter',
              fontWeight: '400',
              wordWrap: 'break-word'
            }}
          />
          <div style={{width: 1022, height: 0, left: 111, top: 327, position: 'absolute', outline: '1px #DCDCDC solid', outlineOffset: '-0.50px'}}></div>
          <div style={{width: 40, height: 40, left: 1070, top: 268, position: 'absolute', background: '#D9D9D9', borderRadius: 9999, cursor: 'pointer'}} onClick={handleNext} />
          <div className="selection-suggestions">
            {visibleBranches.map((option, index) => (
              <div key={`${option.label}-${index}`} style={option.style} onClick={() => handleBranchSelect(option.match)}>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'year' && (
        <div style={canvasStyle} className={`selection-canvas ${isTransitioning ? 'selection-canvas--fade' : ''}`}>
          <div style={{width: 878, height: 77, left: 107, top: 172, position: 'absolute', color: '#444343', fontSize: 40, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Enter your current Education year</div>
          <input
            className="selection-input"
            aria-label="Enter your year"
            placeholder="Enter your year..."
            autoFocus
            value={yearInput}
            onChange={(event) => setYearInput(event.target.value)}
            onFocus={() => updateInputs('year', yearInput)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleNext();
            }}
            style={{
              width: 599,
              height: 88,
              left: 105,
              top: 244,
              position: 'absolute',
              color: yearInput ? 'black' : '#E2E2E2',
              fontSize: 64,
              fontFamily: 'Inter',
              fontWeight: '400',
              wordWrap: 'break-word'
            }}
          />
          <div style={{width: 1022, height: 0, left: 112, top: 332, position: 'absolute', outline: '1px #DCDCDC solid', outlineOffset: '-0.50px'}}></div>
          <div style={{width: 40, height: 40, left: 1075, top: 268, position: 'absolute', background: '#D9D9D9', borderRadius: 9999, cursor: 'pointer'}} onClick={handleNext}></div>
          <div className="selection-suggestions">
            {visibleYears.map((option, index) => (
              <div key={`${option.label}-${index}`} style={option.style} onClick={() => handleYearSelect(option.match)}>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'semester' && (
        <div style={canvasStyle} className={`selection-canvas ${isTransitioning ? 'selection-canvas--fade' : ''}`}>
          <div style={{width: 878, height: 77, left: 107, top: 172, position: 'absolute', color: '#444343', fontSize: 40, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>Your current current semester?</div>
          <input
            className="selection-input"
            aria-label="Enter your sem"
            placeholder="Enter your semester..."
            autoFocus
            value={semesterInput}
            onChange={(event) => setSemesterInput(event.target.value)}
            onFocus={() => updateInputs('semester', semesterInput)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleNext();
            }}
            style={{
              width: 599,
              height: 88,
              left: 105,
              top: 244,
              position: 'absolute',
              color: semesterInput ? 'black' : '#E2E2E2',
              fontSize: 64,
              fontFamily: 'Inter',
              fontWeight: '400',
              wordWrap: 'break-word'
            }}
          />
          <div style={{width: 1022, height: 0, left: 112, top: 332, position: 'absolute', outline: '1px #DCDCDC solid', outlineOffset: '-0.50px'}}></div>
          <div style={{width: 40, height: 40, left: 1070, top: 268, position: 'absolute', background: '#D9D9D9', borderRadius: 9999, cursor: 'pointer'}} onClick={handleNext}></div>
          <div className="selection-suggestions">
            {visibleSemesters.map((option, index) => (
              <div key={`${option.label}-${index}`} style={option.style} onClick={() => handleSemesterSelect(option.match)}>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionPage;
