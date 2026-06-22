import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { evaluateMockAnswer } from '../services/interview.api'
import { useInterview } from '../hooks/useInterview'
import toast from 'react-hot-toast'

const TIMER_SECONDS = 120 // 2 minutes per question

const MockInterview = () => {
    const { interviewId } = useParams()
    const { report } = useInterview()
    const navigate = useNavigate()

    const allQuestions = report
        ? [
            ...report.technicalQuestions.map(q => ({ ...q, type: 'Technical' })),
            ...report.behavioralQuestions.map(q => ({ ...q, type: 'Behavioral' }))
          ]
        : []

    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState('')
    const [evaluation, setEvaluation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [finished, setFinished] = useState(false)
    const [scores, setScores] = useState([])
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
    const timerRef = useRef(null)

    const currentQuestion = allQuestions[currentIndex]

    // Start timer when question changes
    useEffect(() => {
        if (evaluation || finished) return

        setTimeLeft(TIMER_SECONDS)

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    toast.error("Time's up! Auto-submitting your answer.")
                    handleSubmitAnswer()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerRef.current)
    }, [currentIndex, evaluation])

    const handleSubmitAnswer = async () => {
        clearInterval(timerRef.current)
        const answer = userAnswer.trim() || "No answer provided"
        setLoading(true)
        try {
            const data = await evaluateMockAnswer({
                question: currentQuestion.question,
                userAnswer: answer,
                interviewReportId: interviewId
            })
            setEvaluation(data.evaluation)
            setScores(prev => [...prev, data.evaluation.score])
        } catch (err) {
            console.error(err)
            toast.error("Failed to evaluate answer. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        clearInterval(timerRef.current)
        if (currentIndex + 1 >= allQuestions.length) {
            setFinished(true)
        } else {
            setCurrentIndex(i => i + 1)
            setUserAnswer('')
            setEvaluation(null)
        }
    }

    const avgScore = scores.length
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0')
        const s = (secs % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    const timerColor = timeLeft <= 30 ? '#ef4444' : timeLeft <= 60 ? '#f59e0b' : '#22c55e'

    if (!report) {
        return (
            <div style={styles.fullPage}>
                <div style={styles.center}>
                    <h2>Loading interview...</h2>
                </div>
            </div>
        )
    }

    if (finished) {
        return (
            <div style={styles.fullPage}>
                <div style={styles.container}>
                    <div style={styles.card}>
                        <h1 style={styles.title}>🎉 Mock Interview Complete!</h1>
                        <p style={styles.sub}>You answered {scores.length} questions</p>
                        <div style={styles.scoreRing}>
                            <span style={styles.scoreNum}>{avgScore}</span>
                            <span style={styles.scoreDen}>/10</span>
                        </div>
                        <p style={styles.sub}>Average Score</p>
                        <div style={styles.btnRow}>
                            <button style={styles.btnSecondary} onClick={() => navigate(`/interview/${interviewId}`)}>
                                Back to Report
                            </button>
                            <button style={styles.btnPrimary} onClick={() => {
                                setCurrentIndex(0)
                                setUserAnswer('')
                                setEvaluation(null)
                                setScores([])
                                setFinished(false)
                            }}>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.fullPage}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={() => navigate(`/interview/${interviewId}`)}>
                        ← Back to Report
                    </button>
                    <span style={styles.progress}>
                        Question {currentIndex + 1} / {allQuestions.length}
                    </span>
                </div>

                {/* Progress Bar */}
                <div style={styles.progressBar}>
                    <div style={{
                        ...styles.progressFill,
                        width: `${((currentIndex + 1) / allQuestions.length) * 100}%`
                    }} />
                </div>

                {/* Question Card */}
                <div style={styles.card}>

                    {/* Type badge + Timer row */}
                    <div style={styles.badgeRow}>
                        <span style={{
                            ...styles.typeBadge,
                            background: currentQuestion.type === 'Technical' ? '#3b82f620' : '#8b5cf620',
                            color: currentQuestion.type === 'Technical' ? '#3b82f6' : '#8b5cf6',
                        }}>
                            {currentQuestion.type}
                        </span>

                        {/* Timer */}
                        {!evaluation && (
                            <div style={{ ...styles.timer, color: timerColor, borderColor: timerColor }}>
                                ⏱ {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    <h2 style={styles.question}>{currentQuestion.question}</h2>

                    {!evaluation && (
                        <>
                            <textarea
                                style={styles.textarea}
                                placeholder="Type your answer here..."
                                value={userAnswer}
                                onChange={e => setUserAnswer(e.target.value)}
                                rows={6}
                            />
                            <button
                                style={loading || !userAnswer.trim() ? styles.btnDisabled : styles.btnPrimary}
                                onClick={handleSubmitAnswer}
                                disabled={loading || !userAnswer.trim()}
                            >
                                {loading ? 'Evaluating...' : 'Submit Answer'}
                            </button>
                        </>
                    )}

                    {evaluation && (
                        <div style={styles.evalSection}>
                            <div style={styles.scoreRow}>
                                <div style={{
                                    ...styles.scoreBadge,
                                    background: evaluation.score >= 7 ? '#22c55e20' : evaluation.score >= 4 ? '#f59e0b20' : '#ef444420',
                                    color: evaluation.score >= 7 ? '#22c55e' : evaluation.score >= 4 ? '#f59e0b' : '#ef4444',
                                }}>
                                    {evaluation.score}/10
                                </div>
                                <p style={styles.feedback}>{evaluation.feedback}</p>
                            </div>

                            <div style={styles.evalBlock}>
                                <h4 style={{ color: '#22c55e', marginBottom: '8px' }}>✅ Strengths</h4>
                                <ul style={styles.list}>
                                    {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>

                            <div style={styles.evalBlock}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '8px' }}>⚡ Improvements</h4>
                                <ul style={styles.list}>
                                    {evaluation.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>

                            <div style={styles.evalBlock}>
                                <h4 style={{ color: '#3b82f6', marginBottom: '8px' }}>💡 Model Answer</h4>
                                <p style={styles.modelAnswer}>{evaluation.modelAnswer}</p>
                            </div>

                            <button style={styles.btnPrimary} onClick={handleNext}>
                                {currentIndex + 1 >= allQuestions.length ? 'Finish' : 'Next Question →'}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

const styles = {
    fullPage: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0f1117',
        overflowY: 'auto',
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
        zIndex: 9999,
    },
    container: {
        maxWidth: '760px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    backBtn: {
        background: 'none',
        border: '1px solid #ffffff30',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    progress: {
        color: '#ffffff80',
        fontSize: '14px',
    },
    progressBar: {
        height: '4px',
        background: '#ffffff20',
        borderRadius: '999px',
        marginBottom: '24px',
    },
    progressFill: {
        height: '100%',
        background: '#3b82f6',
        borderRadius: '999px',
        transition: 'width 0.3s ease',
    },
    card: {
        background: '#1a1f2e',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #ffffff10',
    },
    badgeRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    typeBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    timer: {
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '6px 14px',
        borderRadius: '8px',
        border: '2px solid',
        transition: 'color 0.3s, border-color 0.3s',
    },
    question: {
        fontSize: '20px',
        fontWeight: '600',
        lineHeight: '1.5',
        margin: '0 0 24px 0',
        color: '#fff',
    },
    textarea: {
        width: '100%',
        background: '#0f1117',
        border: '1px solid #ffffff20',
        borderRadius: '8px',
        color: '#fff',
        padding: '16px',
        fontSize: '15px',
        resize: 'vertical',
        marginBottom: '16px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        display: 'block',
    },
    btnPrimary: {
        background: '#3b82f6',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        marginTop: '8px',
        display: 'block',
    },
    btnSecondary: {
        background: 'transparent',
        color: '#fff',
        border: '1px solid #ffffff30',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1,
        marginRight: '8px',
    },
    btnDisabled: {
        background: '#ffffff20',
        color: '#ffffff50',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'not-allowed',
        width: '100%',
        marginTop: '8px',
        display: 'block',
    },
    evalSection: {
        marginTop: '8px',
    },
    scoreRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '24px',
    },
    scoreBadge: {
        fontSize: '24px',
        fontWeight: 'bold',
        padding: '12px 20px',
        borderRadius: '12px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    feedback: {
        color: '#ffffffcc',
        lineHeight: '1.6',
        fontSize: '15px',
        margin: 0,
    },
    evalBlock: {
        background: '#0f1117',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
    },
    list: {
        margin: 0,
        paddingLeft: '20px',
        color: '#ffffffcc',
        lineHeight: '1.8',
    },
    modelAnswer: {
        color: '#ffffffcc',
        lineHeight: '1.7',
        fontSize: '14px',
        margin: 0,
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '8px',
        textAlign: 'center',
    },
    sub: {
        color: '#ffffff80',
        textAlign: 'center',
        marginBottom: '24px',
    },
    scoreRing: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '4px',
        margin: '24px 0 8px',
    },
    scoreNum: {
        fontSize: '64px',
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    scoreDen: {
        fontSize: '24px',
        color: '#ffffff60',
    },
    btnRow: {
        display: 'flex',
        gap: '8px',
        marginTop: '24px',
    },
}

export default MockInterview