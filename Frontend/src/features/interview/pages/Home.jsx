import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview';
import { useNavigate } from 'react-router';

const Home = () => {

  const { loading, generateReport, reports } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const resumeInputRef = useRef();

  const navigate = useNavigate()

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0]
    const data = await generateReport({ jobDescription, selfDescription, resumeFile })
    navigate(`/interview/${data._id}`)
  }

  // Theme state
  const [isDark, setIsDark] = useState(true);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);


  // UI state
  const [dragOver, setDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  if (loading) {
    return (
      <main className='loading-screen'>
        <h1>Loading your interview plan...</h1>
      </main>
    )
  }



  // Limits
  const JOB_DESC_LIMIT = 8000;
  const SELF_DESC_LIMIT = 2000;

  // Handlers
  const handleJobDescChange = (e) => {
    if (e.target.value.length <= JOB_DESC_LIMIT) {
      setJobDescription(e.target.value);
    }
  };

  const handleSelfDescChange = (e) => {
    if (e.target.value.length <= SELF_DESC_LIMIT) {
      setSelfDescription(e.target.value);
    }
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.length > JOB_DESC_LIMIT) {
          setJobDescription(text.slice(0, JOB_DESC_LIMIT));
          showToast("Clipboard text pasted and truncated to 8000 characters.");
        } else {
          setJobDescription(text);
          showToast("Text pasted from clipboard!");
        }
      } else {
        showToast("Clipboard is empty.");
      }
    } catch (err) {
      // Fallback if clipboard API is blocked
      const fallbackText = "Software Engineer: Build high-performance scalable systems, manage frontend-backend integration, write tests, optimize DB queries.";
      setJobDescription(fallbackText);
      showToast("Clipboard access denied. Loaded fallback text.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        showToast("Error: Only PDF resumes are accepted.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("Error: File size exceeds the 5MB limit.");
        return;
      }
      setResumeFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB"
      });
      showToast("Resume uploaded successfully!");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        showToast("Error: Only PDF resumes are accepted.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("Error: File size exceeds the 5MB limit.");
        return;
      }
      setResumeFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB"
      });
      showToast("Resume dropped and loaded!");
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
    showToast("Resume removed.");
  };

  const handleGenerate = () => {
    if (!jobDescription.trim()) {
      showToast("Please provide a job description first.");
      return;
    }
    if (!resumeFile) {
      showToast("Please upload your resume first.");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast("Success! Mock Interview Report generated.");
    }, 2000);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  return (
    <div className={`home-theme-wrapper ${isDark ? 'dark' : 'light'}`}>
      <main className="home">

        {/* Toast Notification */}
        {toastMessage && (
          <div className="uploaded-file-row" style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            background: 'var(--bg-card)',
            boxShadow: 'var(--card-shadow), var(--glow-shadow)',
            border: '1px solid var(--color-primary)',
            minWidth: '280px',
            maxWidth: '400px'
          }}>
            <div className="file-info-left" style={{ gap: '0.5rem' }}>
              <div className="pdf-icon" style={{ color: 'var(--color-primary)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <div className="file-metadata">
                <p className="file-name" style={{ fontSize: '0.85rem' }}>{toastMessage}</p>
              </div>
            </div>
            <button className="remove-file-btn" onClick={() => setToastMessage("")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        <div className="home-content-container">

          {/* Top navigation with dropdown theme switcher */}
          <nav className="top-nav">
            <div className="theme-dropdown">
              <button
                className="theme-btn"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              >
                {isDark ? (
                  <>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3zm0-2a11 11 0 1 0 11 11A9.003 9.003 0 0 0 12 1z" />
                    </svg>
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0z" />
                    </svg>
                    <span>Light</span>
                  </>
                )}
                <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px' }}>
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>

              {themeDropdownOpen && (
                <div className="dropdown-menu">
                  <button
                    className={isDark ? "active" : ""}
                    onClick={() => { setIsDark(true); setThemeDropdownOpen(false); }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3z" />
                    </svg>
                    Dark
                  </button>
                  <button
                    className={!isDark ? "active" : ""}
                    onClick={() => { setIsDark(false); setThemeDropdownOpen(false); }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
                    </svg>
                    Light
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Header Row */}
          <header className="home-header">
            <div className="header-left">
              <h1>Generate <span className="gradient-text">Interview Report</span></h1>
              <p>
                Upload your resume, paste the job description and tell us about yourself.<br />
                Our AI will generate a personalized interview report for you.
              </p>
            </div>

            <div className="header-right">
              {/* Premium Floating Vector Illustration */}
              <svg className="floating-illustration" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Glowing ambient circle */}
                <circle cx="150" cy="120" r="80" fill="url(#violet-glow)" opacity="0.4" className="ai-glow" />

                {/* Tilted Floating Smartphone Mockup */}
                <g transform="translate(45, 65) rotate(-14)">
                  <rect x="-4" y="4" width="90" height="135" rx="14" fill="rgba(0,0,0,0.3)" filter="blur(6px)" />
                  <rect x="0" y="0" width="90" height="135" rx="14" fill="#1e1b4b" stroke="url(#border-grad)" strokeWidth="1.5" />
                  <rect x="3" y="3" width="84" height="129" rx="11" fill="#0b0d13" />
                  {/* Speaker and front camera */}
                  <rect x="38" y="7" width="14" height="3" rx="1.5" fill="#334155" />
                  {/* Glowing phone layout details */}
                  <rect x="10" y="22" width="70" height="42" rx="5" fill="#2d1b54" opacity="0.6" />
                  <rect x="18" y="30" width="54" height="5" rx="2.5" fill="url(#purple-grad)" />
                  <rect x="18" y="41" width="36" height="4" rx="2" fill="#6366f1" />
                  <rect x="18" y="49" width="46" height="4" rx="2" fill="#475569" />
                  {/* App circles */}
                  <circle cx="18" cy="85" r="7" fill="#4f46e5" />
                  <circle cx="37" cy="85" r="7" fill="#7c3aed" />
                  <circle cx="56" cy="85" r="7" fill="#ec4899" />
                </g>

                {/* Floating sheet of paper (with text lines) */}
                <g transform="translate(150, 25) rotate(8)">
                  <rect x="-4" y="4" width="105" height="130" rx="10" fill="rgba(0,0,0,0.25)" filter="blur(5px)" />
                  <rect x="0" y="0" width="105" height="130" rx="10" fill="#ffffff" />
                  {/* Paper Content */}
                  <rect x="12" y="14" width="35" height="8" rx="2" fill="#8b5cf6" />
                  <rect x="12" y="28" width="81" height="3.5" rx="1.7" fill="#e2e8f0" />
                  <rect x="12" y="39" width="81" height="3.5" rx="1.7" fill="#e2e8f0" />
                  <rect x="12" y="50" width="55" height="3.5" rx="1.7" fill="#e2e8f0" />
                  <rect x="12" y="61" width="81" height="3.5" rx="1.7" fill="#cbd5e1" />
                  <rect x="12" y="72" width="71" height="3.5" rx="1.7" fill="#cbd5e1" />
                  <rect x="12" y="83" width="81" height="3.5" rx="1.7" fill="#e2e8f0" />
                  <rect x="12" y="94" width="45" height="3.5" rx="1.7" fill="#cbd5e1" />
                  <circle cx="15" cy="107" r="2" fill="#8b5cf6" />
                  <rect x="22" y="105" width="60" height="3.5" rx="1.7" fill="#e2e8f0" />
                </g>

                {/* Glassmorphic Magnifying Glass */}
                <g transform="translate(105, 75) rotate(-22)">
                  <rect x="11" y="48" width="7" height="42" rx="3.5" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="0.8" />
                  <rect x="12" y="78" width="5" height="9" rx="1.5" fill="#8b5cf6" />
                  <circle cx="15" cy="27" r="24" fill="rgba(124, 58, 237, 0.08)" stroke="url(#metal-grad)" strokeWidth="3.5" />
                  <circle cx="15" cy="27" r="21" stroke="#ffffff" strokeWidth="0.8" opacity="0.25" />
                  <path d="M -1 13 A 21 21 0 0 1 25 39" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
                </g>

                {/* Cybernetic AI Microchip (Foreground) */}
                <g transform="translate(200, 110)">
                  {/* Pin extensions */}
                  <line x1="-12" y1="22" x2="12" y2="22" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
                  <line x1="22" y1="-12" x2="22" y2="12" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
                  <line x1="22" y1="32" x2="22" y2="58" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />
                  <line x1="32" y1="22" x2="58" y2="22" stroke="#6366f1" strokeWidth="1.5" opacity="0.5" />

                  {/* Outer Chip Frame */}
                  <rect x="0" y="0" width="44" height="44" rx="7" fill="#1b143c" stroke="#8b5cf6" strokeWidth="1.8" className="chip-glow" />
                  <rect x="4" y="4" width="36" height="36" rx="5" fill="#2e1a5a" />
                  <text x="22" y="26" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="0.05em">AI</text>
                  <circle cx="22" cy="31" r="2.2" fill="#10b981" />
                </g>

                <defs>
                  <radialGradient id="violet-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="50%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                  <linearGradient id="border-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </header>

          {/* Form Grid */}
          <div className="home-grid">

            {/* Left Column - Job Description Card */}
            <div className="column-left">
              <section className="form-card full-height">

                <div className="card-header-row">
                  <div className="header-info-group">
                    <div className="number-badge">1</div>
                    <div className="header-title-container">
                      <h2>Job Description</h2>
                      <p>Paste the full job description below</p>
                    </div>
                  </div>

                  <button className="paste-btn" onClick={handlePasteText}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Paste Text</span>
                  </button>
                </div>

                <div className="textarea-wrapper">
                  <textarea
                    id="jobDescription"
                    placeholder="Enter job description here...&#10;Tip: Include responsibilities, required skills, qualifications and other preferences."

                    onChange={(e) => {
                      setJobDescription(e.target.value)
                    }}
                  />
                  <span className="char-counter-absolute">
                    {jobDescription.length.toLocaleString()} / {JOB_DESC_LIMIT.toLocaleString()}
                  </span>
                </div>

              </section>
            </div>

            {/* Right Column - Resume & Self Description */}
            <div className="column-right">

              {/* Card 2: Resume */}
              <section className="form-card">
                <div className="card-header-row" style={{ marginBottom: '1rem' }}>
                  <div className="header-info-group">
                    <div className="number-badge">2</div>
                    <div className="header-title-container">
                      <h2>Resume</h2>
                      <p>Upload your resume (PDF only)</p>
                    </div>
                  </div>
                </div>

                {/* Drag-and-drop zone */}
                <div
                  className={`dropzone-container ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => resumeInputRef.current && resumeInputRef.current.click()}
                >
                  <input
                    hidden
                    type="file"
                    ref={resumeInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                  <div className="upload-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 12 15 15" />
                    </svg>
                  </div>
                  <p>Drag & drop your resume here</p>
                  <p className="or-divider">or</p>
                  <button className="browse-btn" onClick={(e) => {
                    e.stopPropagation();
                    resumeInputRef.current && resumeInputRef.current.click();
                  }}>
                    Browse File
                  </button>
                  <p className="max-size">Max file size: 5MB</p>
                </div>

                {/* Selected file visual row */}
                {resumeFile && (
                  <div className="uploaded-file-row">
                    <div className="file-info-left">
                      <div className="pdf-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 9H9v2h2v2h2v-2h2v-2h-2V9h-2v2zm1 4H9v-2h2V9h2v4h2v2h-4z" />
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z" fill="#ef4444" />
                        </svg>
                      </div>
                      <div className="file-metadata">
                        <p className="file-name">{resumeFile.name}</p>
                        <p className="file-size">{resumeFile.size}</p>
                      </div>
                    </div>

                    <div className="file-info-right">
                      <div className="success-tick">
                        <svg viewBox="0 0 24 24">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                      </div>
                      <button className="remove-file-btn" onClick={handleRemoveFile}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Card 3: Self Description */}
              <section className="form-card">
                <div className="card-header-row" style={{ marginBottom: '0.85rem' }}>
                  <div className="header-info-group">
                    <div className="number-badge">3</div>
                    <div className="header-title-container">
                      <h2>Self Description</h2>
                      <p>Tell us about yourself</p>
                    </div>
                  </div>
                  <span className="char-counter-title">
                    {selfDescription.length.toLocaleString()} / {SELF_DESC_LIMIT.toLocaleString()}
                  </span>
                </div>

                <div className="textarea-wrapper" style={{ minHeight: '120px' }}>
                  <textarea
                    id="selfDescription"
                    placeholder="Write about your experience, skills, strengths, achievements and career goals..."

                    onChange={(e) => {
                      setSelfDescription(e.target.value)
                    }}
                    style={{ minHeight: '110px' }}
                  />
                </div>
              </section>

            </div>

          </div>

          {/* Centralized Action Button */}
          <div className="generate-cta-container">
            <button
              className="generate-cta-btn"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="spinner" />
                  <span>Analyzing Data...</span>
                </>
              ) : (
                <>
                  <span>Generate Interview Report</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '2px' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Recent Report List*/}
          {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}




        </div>
      </main>
    </div>
  )
}

export default Home