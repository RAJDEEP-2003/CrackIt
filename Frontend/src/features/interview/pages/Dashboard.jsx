import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getAllInterviewReports } from '../services/interview.api'

const Dashboard = () => {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getAllInterviewReports()
                setReports(data.interviewReports || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    if (loading) {
        return (
            <div style={styles.fullPage}>
                <div style={styles.center}>
                    <h2 style={{ color: '#fff' }}>Loading dashboard...</h2>
                </div>
            </div>
        )
    }

    // Stats calculations
    const totalInterviews = reports.length
    const avgMatchScore = totalInterviews
        ? (reports.reduce((a, b) => a + b.matchScore, 0) / totalInterviews).toFixed(1)
        : 0
    const bestScore = totalInterviews ? Math.max(...reports.map(r => r.matchScore)) : 0
    const worstScore = totalInterviews ? Math.min(...reports.map(r => r.matchScore)) : 0

    // Most common skill gaps
    const skillGapMap = {}
    reports.forEach(r => {
        if (r.skillGaps) {
            r.skillGaps.forEach(gap => {
                skillGapMap[gap.skill] = (skillGapMap[gap.skill] || 0) + 1
            })
        }
    })
    const topSkillGaps = Object.entries(skillGapMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    return (
        <div style={styles.fullPage}>
            <div style={styles.container}>

               {/* Header */}
<div style={styles.header}>
    <div>
        <button
            style={styles.btnBack}
            onClick={() => navigate(-1)}>
            ← Back
        </button>
        <h1 style={styles.title}>📊 Dashboard</h1>
        <p style={styles.subtitle}>Your interview preparation overview</p>
    </div>
    <button style={styles.btnPrimary} onClick={() => navigate('/')}>
        + New Interview
    </button>
</div> 

                {totalInterviews === 0 ? (
                    <div style={styles.emptyState}>
                        <h2>No interviews yet</h2>
                        <p style={{ color: '#ffffff60', marginBottom: '24px' }}>Generate your first interview strategy to see stats here</p>
                        <button style={styles.btnPrimary} onClick={() => navigate('/')}>
                            Get Started
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <p style={styles.statLabel}>Total Interviews</p>
                                <p style={styles.statValue}>{totalInterviews}</p>
                            </div>
                            <div style={styles.statCard}>
                                <p style={styles.statLabel}>Avg Match Score</p>
                                <p style={{ ...styles.statValue, color: '#3b82f6' }}>{avgMatchScore}%</p>
                            </div>
                            <div style={styles.statCard}>
                                <p style={styles.statLabel}>Best Score</p>
                                <p style={{ ...styles.statValue, color: '#22c55e' }}>{bestScore}%</p>
                            </div>
                            <div style={styles.statCard}>
                                <p style={styles.statLabel}>Lowest Score</p>
                                <p style={{ ...styles.statValue, color: '#ef4444' }}>{worstScore}%</p>
                            </div>
                        </div>

                        {/* Two column layout */}
                        <div style={styles.twoCol}>

                            {/* Recent Reports */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Recent Interviews</h2>
                                <div style={styles.reportList}>
                                    {reports.slice(0, 5).map(report => (
                                        <div
                                            key={report._id}
                                            style={styles.reportItem}
                                            onClick={() => navigate(`/interview/${report._id}`)}
                                        >
                                            <div style={styles.reportInfo}>
                                                <p style={styles.reportTitle}>{report.title || 'Untitled Position'}</p>
                                                <p style={styles.reportDate}>
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div style={{
                                                ...styles.scorePill,
                                                background: report.matchScore >= 80 ? '#22c55e20' : report.matchScore >= 60 ? '#f59e0b20' : '#ef444420',
                                                color: report.matchScore >= 80 ? '#22c55e' : report.matchScore >= 60 ? '#f59e0b' : '#ef4444',
                                            }}>
                                                {report.matchScore}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Skill Gaps */}
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Top Skill Gaps</h2>
                                {topSkillGaps.length === 0 ? (
                                    <p style={{ color: '#ffffff60' }}>No skill gaps data yet</p>
                                ) : (
                                    <div>
                                        {topSkillGaps.map(([skill, count]) => (
                                            <div key={skill} style={styles.skillGapRow}>
                                                <span style={styles.skillName}>{skill}</span>
                                                <div style={styles.barContainer}>
                                                    <div style={{
                                                        ...styles.bar,
                                                        width: `${(count / totalInterviews) * 100}%`
                                                    }} />
                                                </div>
                                                <span style={styles.skillCount}>{count}x</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Score Distribution */}
                                <h2 style={{ ...styles.cardTitle, marginTop: '32px' }}>Score Distribution</h2>
                                <div style={styles.scoreDistRow}>
                                    <div style={styles.scoreDist}>
                                        <div style={{ ...styles.distBar, height: `${(reports.filter(r => r.matchScore >= 80).length / totalInterviews) * 100}px`, background: '#22c55e' }} />
                                        <p style={styles.distLabel}>High</p>
                                        <p style={styles.distCount}>{reports.filter(r => r.matchScore >= 80).length}</p>
                                    </div>
                                    <div style={styles.scoreDist}>
                                        <div style={{ ...styles.distBar, height: `${(reports.filter(r => r.matchScore >= 60 && r.matchScore < 80).length / totalInterviews) * 100}px`, background: '#f59e0b' }} />
                                        <p style={styles.distLabel}>Mid</p>
                                        <p style={styles.distCount}>{reports.filter(r => r.matchScore >= 60 && r.matchScore < 80).length}</p>
                                    </div>
                                    <div style={styles.scoreDist}>
                                        <div style={{ ...styles.distBar, height: `${(reports.filter(r => r.matchScore < 60).length / totalInterviews) * 100}px`, background: '#ef4444' }} />
                                        <p style={styles.distLabel}>Low</p>
                                        <p style={styles.distCount}>{reports.filter(r => r.matchScore < 60).length}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const styles = {
    fullPage: {
        minHeight: '100vh',
        background: '#0f1117',
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
    },
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px',
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
        alignItems: 'flex-start',
        marginBottom: '32px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0 0 4px 0',
    },
    subtitle: {
        color: '#ffffff60',
        margin: 0,
        fontSize: '14px',
    },
    btnPrimary: {
        background: '#3b82f6',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
    },
    statCard: {
        background: '#1a1f2e',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #ffffff10',
    },
    statLabel: {
        color: '#ffffff60',
        fontSize: '13px',
        margin: '0 0 8px 0',
    },
    statValue: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: 0,
        color: '#fff',
    },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
    },
    card: {
        background: '#1a1f2e',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #ffffff10',
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        margin: '0 0 20px 0',
        color: '#fff',
    },
    reportList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    reportItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        background: '#0f1117',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    reportInfo: {
        flex: 1,
    },
    reportTitle: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        fontWeight: '600',
    },
    reportDate: {
        margin: 0,
        fontSize: '12px',
        color: '#ffffff60',
    },
    btnBack: {
    background: 'none',
    border: '1px solid #ffffff30',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '8px',
    display: 'block',
},
    scorePill: {
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: 'bold',
        marginLeft: '12px',
    },
    skillGapRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    },
    skillName: {
        fontSize: '13px',
        color: '#ffffffcc',
        width: '140px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    barContainer: {
        flex: 1,
        height: '6px',
        background: '#ffffff15',
        borderRadius: '999px',
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        background: '#3b82f6',
        borderRadius: '999px',
        minWidth: '8px',
    },
    skillCount: {
        fontSize: '12px',
        color: '#ffffff60',
        width: '24px',
        textAlign: 'right',
    },
    scoreDistRow: {
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-end',
        height: '120px',
    },
    scoreDist: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        flex: 1,
    },
    distBar: {
        width: '40px',
        borderRadius: '4px 4px 0 0',
        minHeight: '4px',
        transition: 'height 0.3s',
    },
    distLabel: {
        fontSize: '12px',
        color: '#ffffff60',
        margin: 0,
    },
    distCount: {
        fontSize: '16px',
        fontWeight: 'bold',
        margin: 0,
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 24px',
    },
}

export default Dashboard