import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const sectionVariants = {
  offscreen: {
    y: 80,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 1,
    },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-off-white text-slate-900 font-sans antialiased min-h-screen w-screen m-0 p-0 overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
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
            <a className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/">
              Find Notes
            </a>
            <a className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/">
              Upload
            </a>
            <a className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="bg-primary text-white text-sm font-bold h-10 px-5 rounded-lg hover:opacity-90 transition-opacity">
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1200px] mx-auto px-6">
        {/* Hero Section */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="py-20 md:py-32 grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-primary mb-8">
              Find Your Perfect Notes with AI Power
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Stop scrolling through endless folders. Our AI matches you with study materials that fit your course syllabus and learning style perfectly.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button className="bg-primary text-white font-bold h-14 px-8 rounded-xl hover:bg-slate-800 transition-colors" onClick={() => navigate('/signup')}>
                Start Finding Notes
              </button>
              <button className="bg-white border-2 border-slate-200 text-primary font-bold h-14 px-8 rounded-xl hover:bg-slate-50 transition-colors">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div
                  className="size-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden bg-cover"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrou12oZ2T_fXsQZHddU8JFMt0pVU9_Hrd4kYKyOkxyxZmnRHwlxJCT0CcQ1GMJ6kMolD3vCzWQlO9MUVz5yit7uJEstIpoQH1PExUTHwSAcGwh_hEM0KzH8fedj_OgvHXsyfE5uxLsqNHwSqrvyVu45MnN-bCOEavlEVu3SR8DR09Bi3vZYJuVvcrUFo89njqSmfdY6a94Si1O6Cq2l1JCMGX8QZRjaAlULuI2O076dLAPF_Ak1jSuG2SHFdZGP0W_J8zbpUkZhCB')",
                  }}
                />
                <div
                  className="size-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden bg-cover"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4NxipVwO1iOaTvAhkXSX3pANdn2Ehq2_IEoAJBQl4ET7Q4ycmGsHM5EK0hOjetilO3k6Dx75_J_-cMEFLQtxf97Xs-odoIDtsB98GQ54Jdyc_vfqLXzGDp8OdgeHzEGBOCLWsPFQS_rWERoa_stGYcdLjhdBwXdpvbg0PzqhPV1qM-aqQUpUUGZVX-l0leJmk0NCFuaMgCU-ZxzXfSTMzpZsnekTYaFb0GFA-j9ns3g9FI9BuKjbDmG-r0J1c0rM7ctvKU27kN5mf')",
                  }}
                />
                <div
                  className="size-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden bg-cover"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD2U_g1GDQHCbAnKGRiKb1tTld-5TysnYZQdwVuCAwz6KXKCTy5rYfIUA4W1UdmGX8j5nsKToGe8brdmo4fIyvzKlc0iIFIZXGcoSomigLFbjpJkE8LVTeXUPhZRH2Pd9XOULW_703mV9GEW-yKR6NnQC8T1BoOAEqvTmRRLvf6DNMc9k38gsRSbiyuuEKKrERgnXcZdsBeoCopOetkHeYjTnqN1Ts_gSeIu9Pyq5leSH_hUFnRlTTMMjf7TFf_M_ZcbWsHuxe_tDho')",
                  }}
                />
              </div>
              <p className="text-sm text-slate-500 font-medium">Join 25,000+ students sharing their best work</p>
            </div>
          </div>

          <div className="relative group hidden lg:block">
            <motion.div
              className="bg-white rounded-2xl border border-slate-100 floating-ui-shadow p-8 relative z-10"
              whileHover={{ rotate: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <span className="text-slate-400 text-sm font-medium">AI is finding notes for you...</span>
              </div>
              <div className="p-6 rounded-xl border border-slate-100 bg-white mb-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">Biology 101</span>
                  <span className="text-slate-300 text-xs">PDF • 12mb</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Cellular Respiration Notes</h3>
                <p className="text-xs text-slate-400">Key Diagrams • Handwritten Conversion</p>
              </div>
              <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-1 rounded bg-purple-50 text-purple-600 text-[10px] font-bold uppercase">History</span>
                  <span className="text-slate-300 text-xs">DOCX • 5mb</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Renaissance Art Review</h3>
                <p className="text-xs text-slate-400">Summary Sheet • Exam Focused</p>
              </div>
            </motion.div>
            <div className="absolute -top-10 -right-10 size-64 bg-blue-100/50 blur-[80px] rounded-full -z-10" />
            <div className="absolute -bottom-10 -left-10 size-64 bg-slate-200/50 blur-[80px] rounded-full -z-10" />
          </div>
        </motion.section>

        {/* Trusted Institutions */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="py-20 border-t border-slate-100"
        >
          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] text-center mb-12">
            Trusted by students at leading institutions
          </h4>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-40 grayscale">
            <div
              className="h-8 w-32 bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7oAUyfa7rKZlnV-XGCM_ApWB1V7rbI6Wsq16ck09YdBN__6ytdfbA9QBffxzmRZ8HnuHpGM0XjH-J2mLAqJ-xnf4m6vKS-o9BN0gEmmliKW7RNdFNC2Gxh5fPhwTieL_Xe-M-5pwghxRf5fOO1RO8lCjYIAMzUmkEvrfumEmtnY6AKl0c5qSiiU7JbR0T8pOoQaw8o6sJzhQwwMiRUwhsON7svNExi15wJVGqqgBkc_HFFRlnIZ-pJUsm3a9e2jbR6_KHwuYpzoc6')",
              }}
            />
            <div
              className="h-8 w-32 bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCYobvfoaddJ0-e7VSJGhdh5OaagkSYRofq0vq9JRQCvwnSV2_D8Seco16fwJMDBHL3rnhtNxrUEM5mN2yQNJLfpaRVj2t9SwA-1Vz98w_tyfiIAzVNSSZXcH_SfbfJAcdBa5Iiu91OwtsDBz4qQbQuMNigMAERK0JNvHlnij7513OJ0973mkZTT7ICjljEk_EfEyad1hIswIAr4m2oijgmgVmhA44QGWbYqkkdTr8ohTD5V1VN6oU5W5kTyZBqEv8Jr52iRGJtMzl_')",
              }}
            />
            <div
              className="h-8 w-32 bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6YR-39fTtajaO2fi4pwDsnm77E42oMD4f0tMXRdb22rPWbfgj5MzXxOgr0C1rn_Zzvj6mP7ghVFbyL40f1Uexx0R2UCZA9VihAhBNYHPEUr2_8SeZiEXRNzgaRVUnFZ0RejXrJq3HTGPW7Bs04qeleZltvfma6eNUQvQ8MkX82JkOaAPV_o3fuuMOea4kGyQjhNbhIrZrhR_SDaWJ0qX1T7B0tJHomb2p3BYAK_AuLl1xqRmPDKm2N01kcWa_kR-h1La375cUXyNf')",
              }}
            />
            <div
              className="h-8 w-32 bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBLRhIogEWSCPc_W3pHbxoGA8LEeenK06rH9Flk7DlFavaUq-oaT3yfjGElLowliWAS_YlKt4xs0VSMwKalps-Ozfr04kSywYO-VqNCWlzUx45uPBB5ZAUCWDSo2LLyOjTKTEUmMGV66uIZVMbuR4ZO9zFg2kJk7N3Q3DGibRRU2ndW5lYhX6Vc28pqkna3NGB9ftUyXywAc-3VNZ-P8K6sHCqbWXQFNuJngFoKQPmbInUAyJG_eyE8OZCN9f8yK-3reLI9EjU_3ccU')",
              }}
            />
            <div
              className="h-8 w-32 bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDy3UCIsiq4cXo7IFGPRWXJo1EyL3MB-1FsiEuGKeNfve9UomRNfEtNO0QTt-OcfXPY0Gpa5Z5QqJw2Q4CW_obn7OAxB8qSE-K5zocN0sETDtQ0PuNzFQpIx8-wWngXDguIUqnAjiEuFfpfIDPDi-aISOl5IWmKAG_AjSZD0ElQdRo_v0rVgWnhP-t2RyGGq_RpBDIgn_SYMpASsiAa8v5DSS3IXmQsxGqMAh_lakwN5iF-tBdOcSBr-jk5Wk9s7a6U_-N2Ny_kY35')",
              }}
            />
          </div>
        </motion.section>

        {/* Smart-Scan Preview */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="py-24 border-t border-slate-100"
        >
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-100 bg-white mb-4 shadow-sm hover:shadow-md transition-shadow">
                    <div
                      className="w-full h-full bg-center bg-no-repeat bg-cover opacity-80"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKUY-rSNt-ZlxdHsSXazcsyyE3se4ZPbc0rTwDSwUCy0OBKB1WOxc55kop9QWwrDCMTbVKyP0r78UrgoPTQT0kKtwjK2uVQ8yUUaLwZGwp6yf_qU_KMuf2PmJuNUaqGgMiHoMkmlxW3NqaGQ-wUR-MDQP8DEdQmgmlx51KeFDZrB30-9A3hYa0RxN0jX81oTu86n6g0DOc7mzYRnOFUjYQZ1OOIG0xmBBYJ-69cPU-qJpdiwNfFpX4F8BPVFL_dHwpv9yYnu3WTyZm')",
                      }}
                    />
                  </div>
                  <p className="font-bold text-slate-800">Raw Input</p>
                  <p className="text-sm text-slate-400">Handwritten Ink</p>
                </div>
                <div className="group mt-12">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-blue-100 bg-white shadow-xl shadow-blue-500/5 mb-4 hover:shadow-2xl transition-shadow flex items-center justify-center p-6">
                    <div className="w-full h-full border-2 border-dashed border-slate-100 rounded-lg flex flex-col gap-3 p-4">
                      <div className="h-3 w-3/4 bg-slate-50 rounded" />
                      <div className="h-3 w-full bg-slate-50 rounded" />
                      <div className="h-3 w-5/6 bg-slate-50 rounded" />
                      <div className="mt-4 h-20 w-full bg-blue-50/50 rounded border border-blue-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-500">analytics</span>
                      </div>
                      <div className="h-3 w-full bg-slate-50 rounded" />
                    </div>
                  </div>
                  <p className="font-bold text-blue-600">Smart Output</p>
                  <p className="text-sm text-slate-400">Searchable PDF</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-blue-500 font-bold text-sm tracking-widest uppercase mb-4 block">AI Optimization</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-primary leading-tight mb-8">Smart-Scan Preview</h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Say goodbye to messy handwriting. Our proprietary AI transforms your raw ink notes into searchable, organized, and beautifully formatted PDFs in seconds.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-blue-600 font-bold">check</span>
                  </div>
                  <span className="font-medium text-slate-700">OCR-powered text recognition</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-blue-600 font-bold">check</span>
                  </div>
                  <span className="font-medium text-slate-700">Automatic diagram cleaning</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-blue-600 font-bold">check</span>
                  </div>
                  <span className="font-medium text-slate-700">Instant format normalization</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Study Circles */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="py-24 border-t border-slate-100"
        >
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-blue-500 font-bold text-sm tracking-widest uppercase mb-4 block">Collaboration</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">Study Circles</h2>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Don't study alone. Join live collaborative rooms where students from your courses share real-time insights and materials.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
                <div className="flex -space-x-2">
                  <div
                    className="size-9 rounded-full border-2 border-white bg-slate-100 overflow-hidden bg-cover"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrou12oZ2T_fXsQZHddU8JFMt0pVU9_Hrd4kYKyOkxyxZmnRHwlxJCT0CcQ1GMJ6kMolD3vCzWQlO9MUVz5yit7uJEstIpoQH1PExUTHwSAcGwh_hEM0KzH8fedj_OgvHXsyfE5uxLsqNHwSqrvyVu45MnN-bCOEavlEVu3SR8DR09Bi3vZYJuVvcrUFo89njqSmfdY6a94Si1O6Cq2l1JCMGX8QZRjaAlULuI2O076dLAPF_Ak1jSuG2SHFdZGP0W_J8zbpUkZhCB')",
                    }}
                  />
                  <div
                    className="size-9 rounded-full border-2 border-white bg-slate-100 overflow-hidden bg-cover"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4NxipVwO1iOaTvAhkXSX3pANdn2Ehq2_IEoAJBQl4ET7Q4ycmGsHM5EK0hOjetilO3k6Dx75_J_-cMEFLQtxf97Xs-odoIDtsB98GQ54Jdyc_vfqLXzGDp8OdgeHzEGBOCLWsPFQS_rWERoa_stGYcdLjhdBwXdpvbg0PzqhPV1qM-aqQUpUUGZVX-l0leJmk0NCFuaMgCU-ZxzXfSTMzpZsnekTYaFb0GFA-j9ns3g9FI9BuKjbDmG-r0J1c0rM7ctvKU27kN5mf')",
                    }}
                  />
                  <div className="size-9 rounded-full border-2 border-white bg-primary text-[10px] font-bold flex items-center justify-center text-white">
                    +11
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">
                Organic Chemistry II
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">Final Exam Prep & Reaction Mechanisms discussion.</p>
              <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-primary hover:text-white transition-all">
                Join Circle
              </button>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
                <div className="flex -space-x-2">
                  <div
                    className="size-9 rounded-full border-2 border-white bg-slate-100 overflow-hidden bg-cover"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDl-DD3aGLmPkMPU_bJ2ZXlCQCOZRMNH2XihMLwxj17qIoZ-Qdq72aGUoX9LFix4Mzi_HolzEyRY5lHJaY3KnPwxMVXpxTtK2mGldJjKClPH7MpN4cX8l-SU2cSORMrrJCV-n0rQVcF0LAQdFuAB2uTh5JDgzS8pFby89IbZlPBoqupEdWRoFwPg_WiuVZkBqwvjCFp2MC-H4LP1ctsJuDDbZ2khMK6jOLGMTJqPCoa8IiUZn9XkO5xLLRHf0FNBpEoqqUKY3GUrreS')",
                    }}
                  />
                  <div
                    className="size-9 rounded-full border-2 border-white bg-slate-100 overflow-hidden bg-cover"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB82cLONzCs-i17y1zzwUAbKy8MJBeNgqZyZ0pwybNGGKd9BBtxnflcjFnEWXeaxf2AcCKQMObZ5hHXW3jo96DSCE1zOR_kYQ2JD0OAderdH3dGqLEIqI2AyF3yBOEFMez7dcyqtjHgzXUxEwsyDxGkCwQ2d9mdxoAdzB5GV7-MGN114HgcgLYOFu0A09iI63Z78ykc2fZfH6EHw-gh0QY3SUITy7Fr4oRosf-UkgiRrS67VNZpqMo8nCCjvdJ2RYi6-nvoH2nnzcjS')",
                    }}
                  />
                  <div className="size-9 rounded-full border-2 border-white bg-primary text-[10px] font-bold flex items-center justify-center text-white">
                    +24
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">
                Macroeconomics 101
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">Weekly review: Supply & Demand Equilibrium charts.</p>
              <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-primary hover:text-white transition-all">
                Join Circle
              </button>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  Idle
                </div>
                <div className="flex -space-x-2">
                  <div
                    className="size-9 rounded-full border-2 border-white bg-slate-100 overflow-hidden bg-cover"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD3UgfMw8bJtgY_mZJH7kQ9MJFWR39_OeesEr_FE_34dXPU1wkh7XpHy5foy5d8F_K5mzlDmMgjAIa33-q3VCsYV2sD2IVXkGDvH1rWvoeBLj4q0hrtF9fWQAmOCEw4a8FVgWw54ANaJZI3akYvYzlgMTfUxNLUKD9hD1xNsVpjmYg3bmjRy7Wt74smWPwjWjuMnzy8VvAvoXLG6jtCcWRDoWNcpy2r57Of2Bv5hwkboKJlT4jKC1N3gd1P6WLgSvgROPJz0g_hKCCP')",
                    }}
                  />
                  <div className="size-9 rounded-full border-2 border-white bg-primary text-[10px] font-bold flex items-center justify-center text-white">
                    +5
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">Applied Physics</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">Quantum mechanics and particle physics notes sharing.</p>
              <button className="w-full py-3.5 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-primary hover:text-white transition-all">
                Join Circle
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Choose NotesFinder */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          className="py-24 border-t border-slate-100"
        >
          <div className="text-center mb-16">
            <span className="text-blue-500 font-bold text-sm tracking-widest uppercase mb-4 block">Why Choose NotesFinder</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">Everything You Need for Academic Success</h2>
            <p className="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed">
              Built specifically for students by students, NotesFinder combines cutting-edge AI technology with proven study methods to deliver unparalleled academic support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined text-blue-600 text-2xl">verified</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Quality & Credibility</h3>
              <p className="text-slate-600 leading-relaxed">
                Student ratings, study time estimates, difficulty levels, and verified university tags ensure you get only the best materials.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">filter_list</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Smart Filtering</h3>
              <p className="text-slate-600 leading-relaxed">
                Filter by branch, semester, subject, exam board, and study phase (internals, externals, last-minute prep).
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-purple-50 flex items-center justify-center mb-6 group-hover:bg-purple-100 transition-colors">
                <span className="material-symbols-outlined text-purple-600 text-2xl">psychology</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">AI-Powered Learning</h3>
              <p className="text-slate-600 leading-relaxed">
                Auto-summaries, key definitions, flashcards, and PYQ analysis to accelerate your understanding.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-orange-50 flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                <span className="material-symbols-outlined text-orange-600 text-2xl">play_circle</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">YouTube Integration</h3>
              <p className="text-slate-600 leading-relaxed">
                Curated playlists, most-watched videos, and creator ratings mapped to your syllabus topics.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                <span className="material-symbols-outlined text-red-600 text-2xl">quiz</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Complete Exam Prep</h3>
              <p className="text-slate-600 leading-relaxed">
                Last 10 years PYQs, internal assessments, marking schemes, and model answers for comprehensive preparation.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                <span className="material-symbols-outlined text-teal-600 text-2xl">timeline</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Study Flow Tools</h3>
              <p className="text-slate-600 leading-relaxed">
                Chapter progress tracking, exam countdown, study planner, revision streaks, and Pomodoro timer.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                <span className="material-symbols-outlined text-indigo-600 text-2xl">groups</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Peer Community</h3>
              <p className="text-slate-600 leading-relaxed">
                Study circles, doubt-solving forums, note discussions, and collaborative learning spaces.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-6 group-hover:bg-cyan-100 transition-colors">
                <span className="material-symbols-outlined text-cyan-600 text-2xl">cloud_sync</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Cloud Sync & Offline</h3>
              <p className="text-slate-600 leading-relaxed">
                Access your materials anywhere with cloud sync, offline mode, and cross-device synchronization.
              </p>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="size-12 rounded-xl bg-rose-50 flex items-center justify-center mb-6 group-hover:bg-rose-100 transition-colors">
                <span className="material-symbols-outlined text-rose-600 text-2xl">school</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">University Focused</h3>
              <p className="text-slate-600 leading-relaxed">
                Tailored for Indian universities with regional language support, autonomous colleges, and exam patterns.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Study Success Stats */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="py-24 bg-slate-50"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">500K+</div>
              <div className="text-slate-600 font-medium">Students</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">1M+</div>
              <div className="text-slate-600 font-medium">Notes Shared</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">50+</div>
              <div className="text-slate-600 font-medium">Universities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">95%</div>
              <div className="text-slate-600 font-medium">Satisfaction</div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="py-24 mb-24 rounded-[2.5rem] bg-primary relative overflow-hidden flex flex-col items-center text-center px-6 shadow-2xl shadow-primary/20"
        >
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-[600px] bg-white/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 size-[400px] bg-blue-400/10 blur-[100px] rounded-full" />
          <h2 className="text-white text-4xl md:text-6xl font-extrabold mb-8 relative z-10 leading-tight">
            Ready to Revolutionize Your Studies?
          </h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-12 relative z-10 font-medium">
            Join over 500,000 students already using NotesFinder to simplify their academic journey and achieve better grades.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 relative z-10 w-full sm:w-auto">
            <button className="bg-white text-primary px-10 h-16 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
              Start Learning Free
            </button>
            <button className="bg-primary border-2 border-white/20 text-white px-10 h-16 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors">
              Explore Features
            </button>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-slate-200 py-20 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="size-7 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xl font-bold text-primary">NotesFinder</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">
              The premium destination for students to share, find, and master their course materials with AI-powered tools.
            </p>
            <div className="flex gap-4">
              <a className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all" href="/">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </a>
              <a className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all" href="/">
                <span className="material-symbols-outlined text-[20px]">public</span>
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-primary mb-6">Product</h5>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="/">Search</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">Study Circles</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">AI Scan</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">Marketplace</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-primary mb-6">Company</h5>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="/">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">Blog</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-primary mb-6">Support</h5>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="/">Help Center</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">Guidelines</a></li>
              <li><a className="hover:text-primary transition-colors" href="/">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-slate-400 gap-4">
          <p>© 2024 NotesFinder Inc. Built for students, by students.</p>
          <div className="flex gap-8">
            <a className="hover:text-primary" href="/">Status</a>
            <a className="hover:text-primary" href="/">Cookie Policy</a>
            <a className="hover:text-primary" href="/">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
