import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const NOTE_PREFERENCES = [
    'Handwritten Notes',
    'Short Summary Notes',
    'Exam-Focused Notes',
    'Detailed Concept Notes',
    'Previous Year Question Papers',
    'Important Questions',
    'Lab Manuals',
    'Quick Revision Sheets',
];

const SEMESTER_OPTIONS = Array.from({ length: 6 }, (_, i) => `Sem ${i + 1}`);

const FIELD_OPTIONS = [
    'Computer Science',
    'IT',
    'AIDS',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics',
    'Commerce',
    'Arts',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];

// ─── Animation Variants ───────────────────────────────────────────────────────
const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.8, delay: 0.15 } },
};

const leftVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.1 } },
};

// ─── Shared Navbar ─────────────────────────────────────────────────────────────
const Navbar = ({ navigate }) => (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 flex h-16 items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="size-8 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                            clipRule="evenodd"
                            d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                            fill="currentColor"
                            fillRule="evenodd"
                        />
                    </svg>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-primary">NotesFinder</h2>
            </div>
            <nav className="hidden md:flex items-center gap-10">
                <a className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="#">Find Notes</a>
                <a className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="#">Upload</a>
                <a className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="#">Pricing</a>
            </nav>
            <button className="bg-primary text-white text-sm font-bold h-10 px-5 rounded-lg hover:opacity-90 transition-opacity">
                Get Started Free
            </button>
        </div>
    </header>
);

// ─── Select Field ─────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options, placeholder }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all
        appearance-none cursor-pointer hover:border-slate-300"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
        >
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

// ─── Pill Tag ─────────────────────────────────────────────────────────────────
const PillTag = ({ label, selected, onClick }) => (
    <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        animate={selected ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.2 }}
        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all select-none cursor-pointer
      ${selected
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
            }`}
    >
        {label}
    </motion.button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const QuestionnairePage = ({ updateProfile }) => {
    const navigate = useNavigate();
    const [semester, setSemester] = useState('');
    const [educationField, setEducationField] = useState('');
    const [educationYear, setEducationYear] = useState('');
    const [selectedPrefs, setSelectedPrefs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const togglePref = (pref) => {
        setSelectedPrefs(prev =>
            prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
        );
    };

    const validate = () => {
        const newErrors = {};
        if (!semester) newErrors.semester = 'Please select a semester';
        if (!educationField) newErrors.educationField = 'Please select your field';
        if (!educationYear) newErrors.educationYear = 'Please select your year';
        if (selectedPrefs.length === 0) newErrors.prefs = 'Please select at least one preference';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/save-user-profile`, {
                semester,
                education_field: educationField,
                education_year: educationYear,
                notes_preference: selectedPrefs,
            });
        } catch (err) {
            // Log but don't block — navigation always proceeds
            console.warn('Could not save profile to Supabase:', err.message);
        } finally {
            // Always update app state and navigate
            if (updateProfile) {
                updateProfile({
                    semester,
                    education_field: educationField,
                    education_year: educationYear,
                    notes_preference: selectedPrefs,
                    branch: educationField,
                    year: educationYear,
                });
            }
            setSubmitted(true);
            setLoading(false);
            setTimeout(() => navigate('/notes'), 600);
        }
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="bg-off-white text-slate-900 font-sans antialiased min-h-screen w-screen m-0 p-0 overflow-x-hidden"
        >
            <Navbar navigate={navigate} />

            <main className="w-full max-w-[1200px] mx-auto px-6 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-10rem)]">

                    {/* ─── Left: Text Section ─────────────────────────────────────── */}
                    <motion.div variants={leftVariants} initial="hidden" animate="visible" className="text-left">
                        <span className="text-blue-500 font-bold text-sm tracking-widest uppercase mb-4 block">
                            AI Personalization
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-primary mb-6">
                            Personalize Your Notes Experience
                        </h1>
                        <p className="text-slate-500 text-lg max-w-md leading-relaxed mb-10">
                            Tell us about your academic background and what you're looking for. Our AI will find the perfect notes for you.
                        </p>

                        {/* Feature pills */}
                        <div className="flex flex-col gap-4">
                            {[
                                { icon: '🎯', text: 'Matched to your exact syllabus' },
                                { icon: '⚡', text: 'Instant AI-powered recommendations' },
                                { icon: '📚', text: 'Curated by top-performing students' },
                            ].map(({ icon, text }) => (
                                <div key={text} className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shrink-0">
                                        {icon}
                                    </div>
                                    <span className="font-medium text-slate-700">{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ─── Right: Questionnaire Card ──────────────────────────────── */}
                    <motion.div variants={cardVariants} initial="hidden" animate="visible">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8 md:p-10 flex flex-col gap-6"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-primary mb-1">Your Academic Profile</h2>
                                <p className="text-sm text-slate-400">Fill in the details below to get personalized notes</p>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Semester */}
                            <SelectField
                                label="Current Semester"
                                value={semester}
                                onChange={setSemester}
                                options={SEMESTER_OPTIONS}
                                placeholder="Select semester..."
                            />
                            {errors.semester && <p className="text-red-500 text-xs -mt-4">{errors.semester}</p>}

                            {/* Education Field */}
                            <SelectField
                                label="Education Field"
                                value={educationField}
                                onChange={setEducationField}
                                options={FIELD_OPTIONS}
                                placeholder="Select your field..."
                            />
                            {errors.educationField && <p className="text-red-500 text-xs -mt-4">{errors.educationField}</p>}

                            {/* Education Year */}
                            <SelectField
                                label="Education Year"
                                value={educationYear}
                                onChange={setEducationYear}
                                options={YEAR_OPTIONS}
                                placeholder="Select your year..."
                            />
                            {errors.educationYear && <p className="text-red-500 text-xs -mt-4">{errors.educationYear}</p>}

                            {/* Notes Preferences */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-semibold text-slate-700">
                                    What are you looking for?
                                    <span className="text-slate-400 font-normal ml-1">(select all that apply)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {NOTE_PREFERENCES.map(pref => (
                                        <PillTag
                                            key={pref}
                                            label={pref}
                                            selected={selectedPrefs.includes(pref)}
                                            onClick={() => togglePref(pref)}
                                        />
                                    ))}
                                </div>
                                {errors.prefs && <p className="text-red-500 text-xs">{errors.prefs}</p>}
                            </div>

                            {errors.submit && (
                                <p className="text-red-500 text-sm text-center">{errors.submit}</p>
                            )}

                            <div className="h-px bg-slate-100" />

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading || submitted}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base
                  hover:bg-slate-800 transition-colors shadow-lg shadow-primary/20
                  disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2"
                                        >
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Saving...
                                        </motion.span>
                                    ) : submitted ? (
                                        <motion.span
                                            key="done"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            ✓ Saved! Redirecting...
                                        </motion.span>
                                    ) : (
                                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            Save &amp; Continue →
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </main>
        </motion.div>
    );
};

export default QuestionnairePage;
