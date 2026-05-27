import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { quizzes as quizzesApi, questions as questionsApi, results as resultsApi } from './api';

const theme = (dark) => ({
  bg: dark ? '#0f0f13' : '#f0f2f7',
  surface: dark ? '#1a1a24' : '#ffffff',
  surface2: dark ? '#13131c' : '#f8f8fc',
  border: dark ? '#2a2a3a' : '#e0e0ec',
  text: dark ? '#e2e2e8' : '#1a1a2e',
  muted: dark ? '#555' : '#999',
  accent: '#667eea',
  success: '#30c060',
  danger: '#e85d5d',
  warning: '#f0a030',
});

function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') await login({ username: form.username, password: form.password });
      else await register({ ...form, role });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '11px 14px', marginBottom: 12, border: '1px solid #2a2a3a', borderRadius: 9, fontSize: 14, boxSizing: 'border-box', background: '#13131c', color: '#ddd', fontFamily: 'inherit', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f13 0%, #1a1a2e 50%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🧠</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>QuizMaster</h1>
          <p style={{ margin: '6px 0 0', color: '#555', fontSize: 13 }}>Test your knowledge · Django · Express · React</p>
        </div>
        <div style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', background: '#13131c', borderRadius: 10, padding: 3, marginBottom: 18 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: mode === m ? '#667eea' : 'transparent', color: mode === m ? '#fff' : '#555', transition: 'all 0.2s' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
          {mode === 'register' && (
            <div style={{ display: 'flex', background: '#13131c', borderRadius: 10, padding: 3, marginBottom: 16 }}>
              {['student', 'instructor'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12, background: role === r ? (r === 'instructor' ? '#f0a030' : '#30c060') : 'transparent', color: role === r ? '#fff' : '#555', transition: 'all 0.2s' }}>
                  {r === 'student' ? '🎓 Student' : '👨‍🏫 Instructor'}
                </button>
              ))}
            </div>
          )}
          {error && <div style={{ background: '#e85d5d22', color: '#e85d5d', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handle}>
            {mode === 'register' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="First name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} style={inp} />
                <input placeholder="Last name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} style={inp} />
              </div>
            )}
            <input required placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={inp} />
            {mode === 'register' && <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inp} />}
            <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inp} />
            {mode === 'register' && <input required type="password" placeholder="Confirm password" value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} style={inp} />}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 0', background: loading ? '#3a3a4a' : '#667eea', color: '#fff', border: 'none', borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : `Register as ${role}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TakeQuiz({ quiz, onFinish, onBack, t }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit * 60);
  const [submitting, setSubmitting] = useState(false);
  const questions = quiz.questions || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeTaken = quiz.time_limit * 60 - timeLeft;
      const result = await quizzesApi.submit(quiz.id, { answers, time_taken: timeTaken });
      onFinish(result);
    } catch (err) { alert(err.message); setSubmitting(false); }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const q = questions[current];
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / questions.length) * 100);
  const timerColor = timeLeft < 60 ? t.danger : timeLeft < 180 ? t.warning : t.success;

  if (!q) return null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <button onClick={onBack} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.muted, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: t.muted }}>{quiz.title}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: timerColor, fontFamily: 'monospace' }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>
        <div style={{ fontSize: 13, color: t.muted }}>{answered}/{questions.length}</div>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: t.border, borderRadius: 10, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: t.accent, borderRadius: 10, transition: 'width 0.3s' }} />
      </div>

      {/* Question */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: '20px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: t.muted, marginBottom: 8 }}>Question {current + 1} of {questions.length}</div>
        <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: t.text, lineHeight: 1.5 }}>{q.text}</h2>
        {['A', 'B', 'C', 'D'].map(opt => {
          const val = q[`option_${opt.toLowerCase()}`];
          const selected = answers[q.id] === opt;
          return (
            <div key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 10, marginBottom: 8, cursor: 'pointer', border: `2px solid ${selected ? t.accent : t.border}`, background: selected ? `${t.accent}22` : t.surface2, transition: 'all 0.15s' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: selected ? t.accent : t.border, color: selected ? '#fff' : t.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{opt}</div>
              <span style={{ fontSize: 14, color: t.text, lineHeight: 1.4 }}>{val}</span>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
          style={{ flex: 1, padding: '12px 0', border: `1px solid ${t.border}`, background: 'transparent', color: t.muted, borderRadius: 9, cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: current === 0 ? 0.4 : 1 }}>
          ← Prev
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(current + 1)} style={{ flex: 1, padding: '12px 0', background: t.accent, color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Next →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} style={{ flex: 1, padding: '12px 0', background: t.success, color: '#fff', border: 'none', borderRadius: 9, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700 }}>
            {submitting ? 'Submitting...' : '✓ Submit'}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultScreen({ result, quiz, onRetry, onHome, t }) {
  const passed = result.passed;
  const color = passed ? t.success : t.danger;
  const mins = Math.floor(result.time_taken / 60);
  const secs = result.time_taken % 60;

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{passed ? '🎉' : '😔'}</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text, margin: '0 0 6px' }}>{passed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
      <p style={{ color: t.muted, fontSize: 13, marginBottom: 24 }}>{passed ? 'You passed the quiz!' : `You needed ${quiz?.pass_score || 70}% to pass.`}</p>
      <div style={{ background: t.surface, border: `2px solid ${color}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 800, color, marginBottom: 6 }}>{result.percentage}%</div>
        <div style={{ fontSize: 14, color: t.muted, marginBottom: 18 }}>{result.score} out of {result.total_questions} correct</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Score', value: `${result.score}/${result.total_questions}` },
            { label: 'Time', value: `${mins}m ${secs}s` },
            { label: 'Result', value: passed ? 'PASS' : 'FAIL', color },
          ].map(s => (
            <div key={s.label} style={{ background: t.surface2, borderRadius: 10, padding: '10px 16px', flex: 1, minWidth: 80 }}>
              <div style={{ fontSize: 11, color: t.muted }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color || t.text }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onHome} style={{ flex: 1, padding: '12px 0', border: `1px solid ${t.border}`, background: 'transparent', color: t.muted, borderRadius: 9, cursor: 'pointer', fontSize: 14 }}>← Home</button>
        <button onClick={onRetry} style={{ flex: 1, padding: '12px 0', background: t.accent, color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Try Again</button>
      </div>
    </div>
  );
}

function InstructorDashboard({ t }) {
  const [quizList, setQuizList] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', category: 'General', time_limit: 10, pass_score: 70 });
  const [newQ, setNewQ] = useState({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', order: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizzesApi.list().then(data => { setQuizList(Array.isArray(data) ? data : (data?.results || [])); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const createQuiz = async (e) => {
    e.preventDefault();
    try { const q = await quizzesApi.create(newQuiz); setQuizList([q, ...quizList]); setNewQuiz({ title: '', description: '', category: 'General', time_limit: 10, pass_score: 70 }); setShowCreate(false); }
    catch (err) { setError(err.message); }
  };

  const togglePublish = async (quiz) => {
    try { const u = await quizzesApi.update(quiz.id, { is_published: !quiz.is_published }); setQuizList(prev => prev.map(q => q.id === quiz.id ? { ...q, is_published: u.is_published } : q)); }
    catch (err) { setError(err.message); }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try { await quizzesApi.delete(id); setQuizList(prev => prev.filter(q => q.id !== id)); }
    catch (err) { setError(err.message); }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    try {
      const created = await questionsApi.create({ ...newQ, quiz: editingQuiz.id });
      setEditingQuiz(prev => ({ ...prev, questions: [...(prev.questions || []), created] }));
      setQuizList(prev => prev.map(q => q.id === editingQuiz.id ? { ...q, question_count: (q.question_count || 0) + 1 } : q));
      setNewQ({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', order: (editingQuiz.questions?.length || 0) + 2 });
    } catch (err) { setError(err.message); }
  };

  const deleteQuestion = async (qid) => {
    try { await questionsApi.delete(qid); setEditingQuiz(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== qid) })); }
    catch (err) { setError(err.message); }
  };

  const inp = { width: '100%', padding: '9px 12px', marginBottom: 10, border: `1px solid ${t.border}`, borderRadius: 7, fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', background: t.surface2, color: t.text };

  if (editingQuiz) return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16 }}>
      <button onClick={() => setEditingQuiz(null)} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.muted, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Back</button>
      <h2 style={{ color: t.text, margin: '0 0 4px', fontSize: 20 }}>{editingQuiz.title}</h2>
      <p style={{ color: t.muted, fontSize: 13, margin: '0 0 20px' }}>{editingQuiz.questions?.length || 0} questions</p>
      {error && <div style={{ background: '#e85d5d22', color: t.danger, padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}
      {(editingQuiz.questions || []).map((q, i) => (
        <div key={q.id} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: 14, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>Q{i + 1}. {q.text}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <span key={opt} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: q.correct_answer === opt ? `${t.success}22` : t.surface2, color: q.correct_answer === opt ? t.success : t.muted, border: `1px solid ${q.correct_answer === opt ? t.success : t.border}`, fontWeight: q.correct_answer === opt ? 700 : 400 }}>
                    {opt}: {q[`option_${opt.toLowerCase()}`]}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => deleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: t.danger, cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>×</button>
          </div>
        </div>
      ))}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, marginTop: 14 }}>
        <h4 style={{ margin: '0 0 12px', color: t.text, fontSize: 14 }}>Add New Question</h4>
        <form onSubmit={addQuestion}>
          <textarea required value={newQ.text} onChange={e => setNewQ({ ...newQ, text: e.target.value })} placeholder="Question text *" rows={2} style={{ ...inp, resize: 'vertical' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['a', 'b', 'c', 'd'].map(opt => (
              <input key={opt} required value={newQ[`option_${opt}`]} onChange={e => setNewQ({ ...newQ, [`option_${opt}`]: e.target.value })} placeholder={`Option ${opt.toUpperCase()} *`} style={{ ...inp, marginBottom: 0 }} />
            ))}
          </div>
          <div style={{ marginTop: 10, marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: t.muted, marginBottom: 6, display: 'block' }}>Correct Answer</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['A', 'B', 'C', 'D'].map(opt => (
                <button key={opt} type="button" onClick={() => setNewQ({ ...newQ, correct_answer: opt })}
                  style={{ flex: 1, padding: '8px 0', border: `2px solid ${newQ.correct_answer === opt ? t.success : t.border}`, borderRadius: 7, background: newQ.correct_answer === opt ? `${t.success}22` : 'transparent', color: newQ.correct_answer === opt ? t.success : t.muted, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" style={{ background: t.accent, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Add Question</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>My Quizzes</h2>
          <p style={{ margin: '3px 0 0', color: t.muted, fontSize: 13 }}>{quizList.length} quizzes created</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ background: t.accent, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ New Quiz</button>
      </div>

      {error && <div style={{ background: '#e85d5d22', color: t.danger, padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{error}</div>}

      {showCreate && (
        <form onSubmit={createQuiz} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, color: t.text }}>Create New Quiz</h3>
          <input required value={newQuiz.title} onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })} placeholder="Quiz title *" style={inp} />
          <textarea value={newQuiz.description} onChange={e => setNewQuiz({ ...newQuiz, description: e.target.value })} placeholder="Description" rows={2} style={{ ...inp, resize: 'vertical' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            <input value={newQuiz.category} onChange={e => setNewQuiz({ ...newQuiz, category: e.target.value })} placeholder="Category" style={{ ...inp, marginBottom: 0 }} />
            <input type="number" value={newQuiz.time_limit} onChange={e => setNewQuiz({ ...newQuiz, time_limit: parseInt(e.target.value) })} placeholder="Time (mins)" min={1} style={{ ...inp, marginBottom: 0 }} />
            <input type="number" value={newQuiz.pass_score} onChange={e => setNewQuiz({ ...newQuiz, pass_score: parseInt(e.target.value) })} placeholder="Pass %" min={1} max={100} style={{ ...inp, marginBottom: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ background: t.accent, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Create Quiz</button>
            <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'transparent', color: t.muted, border: `1px solid ${t.border}`, padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </form>
      )}

      {loading && <p style={{ color: t.muted, textAlign: 'center', padding: 40 }}>Loading quizzes...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {quizList.map(q => (
          <div key={q.id} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, background: `${t.accent}22`, color: t.accent, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{q.category}</span>
              <span style={{ fontSize: 11, background: q.is_published ? `${t.success}22` : `${t.muted}22`, color: q.is_published ? t.success : t.muted, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{q.is_published ? 'Live' : 'Draft'}</span>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: t.text }}>{q.title}</h3>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.muted, lineHeight: 1.4 }}>{q.description || 'No description'}</p>
            <div style={{ display: 'flex', gap: 10, fontSize: 12, color: t.muted, marginBottom: 12, flexWrap: 'wrap' }}>
              <span>📝 {q.question_count || 0} questions</span>
              <span>⏱ {q.time_limit}m</span>
              <span>✅ {q.pass_score}%</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setEditingQuiz(q)} style={{ flex: 1, padding: '8px 0', background: t.accent, color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</button>
              <button onClick={() => togglePublish(q)} style={{ flex: 1, padding: '8px 0', background: q.is_published ? `${t.warning}22` : `${t.success}22`, color: q.is_published ? t.warning : t.success, border: `1px solid ${q.is_published ? t.warning : t.success}`, borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{q.is_published ? 'Unpublish' : 'Publish'}</button>
              <button onClick={() => deleteQuiz(q.id)} style={{ padding: '8px 10px', background: `${t.danger}22`, color: t.danger, border: `1px solid ${t.danger}`, borderRadius: 7, cursor: 'pointer', fontSize: 12 }}>×</button>
            </div>
          </div>
        ))}
      </div>

      {!loading && quizList.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <h3 style={{ color: t.text, margin: '0 0 8px' }}>No quizzes yet</h3>
          <p style={{ color: t.muted, fontSize: 13 }}>Create your first quiz to get started!</p>
        </div>
      )}
    </div>
  );
}

function StudentDashboard({ t }) {
  const [quizList, setQuizList] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [view, setView] = useState('quizzes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([quizzesApi.list(), resultsApi.list()]).then(([qData, rData]) => {
      setQuizList(Array.isArray(qData) ? qData : (qData?.results || []));
      setMyResults(Array.isArray(rData) ? rData : (rData?.results || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (result) return <ResultScreen result={result} quiz={activeQuiz} onRetry={() => setResult(null)} onHome={() => { setResult(null); setActiveQuiz(null); }} t={t} />;
  if (activeQuiz) return <TakeQuiz quiz={activeQuiz} onFinish={(r) => { setResult(r); setMyResults(prev => [r, ...prev]); }} onBack={() => setActiveQuiz(null)} t={t} />;

  const attempted = myResults.length;
  const passed = myResults.filter(r => r.passed).length;
  const avgScore = myResults.length ? Math.round(myResults.reduce((a, r) => a + r.percentage, 0) / myResults.length) : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Available', value: quizList.length, color: t.accent },
          { label: 'Attempted', value: attempted, color: t.warning },
          { label: 'Passed', value: passed, color: t.success },
          { label: 'Avg Score', value: `${avgScore}%`, color: t.text },
        ].map(s => (
          <div key={s.label} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: t.muted, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: t.surface2, borderRadius: 10, padding: 3, marginBottom: 18 }}>
        {['quizzes', 'history'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: view === v ? t.accent : 'transparent', color: view === v ? '#fff' : t.muted, transition: 'all 0.2s' }}>
            {v === 'quizzes' ? '📚 Quizzes' : '📊 My Results'}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: t.muted, textAlign: 'center', padding: 40 }}>Loading...</p>}

      {view === 'quizzes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {quizList.map(q => (
            <div key={q.id} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 11, background: `${t.accent}22`, color: t.accent, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{q.category}</span>
              <h3 style={{ margin: '10px 0 6px', fontSize: 15, fontWeight: 700, color: t.text }}>{q.title}</h3>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: t.muted, lineHeight: 1.4 }}>{q.description || 'No description'}</p>
              <div style={{ display: 'flex', gap: 10, fontSize: 12, color: t.muted, marginBottom: 10, flexWrap: 'wrap' }}>
                <span>📝 {q.question_count} questions</span>
                <span>⏱ {q.time_limit} mins</span>
                <span>✅ {q.pass_score}%</span>
              </div>
              <div style={{ fontSize: 12, color: t.muted, marginBottom: 12 }}>By {q.created_by_name}</div>
              <button onClick={() => setActiveQuiz(q)} disabled={!q.question_count}
                style={{ width: '100%', padding: '11px 0', background: q.question_count ? t.accent : t.border, color: '#fff', border: 'none', borderRadius: 8, cursor: q.question_count ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600 }}>
                {q.question_count ? 'Start Quiz →' : 'No questions yet'}
              </button>
            </div>
          ))}
          {!loading && quizList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', gridColumn: '1/-1' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h3 style={{ color: t.text, margin: '0 0 8px' }}>No quizzes available</h3>
              <p style={{ color: t.muted, fontSize: 13 }}>Check back later!</p>
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div>
          {myResults.map(r => (
            <div key={r.id} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: r.passed ? `${t.success}22` : `${t.danger}22`, border: `2px solid ${r.passed ? t.success : t.danger}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: r.passed ? t.success : t.danger, flexShrink: 0 }}>
                {r.percentage}%
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.quiz_title}</div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{r.score}/{r.total_questions} correct · {new Date(r.completed_at).toLocaleDateString()}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: r.passed ? `${t.success}22` : `${t.danger}22`, color: r.passed ? t.success : t.danger, flexShrink: 0 }}>{r.passed ? 'PASS' : 'FAIL'}</span>
            </div>
          ))}
          {myResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <h3 style={{ color: t.text, margin: '0 0 8px' }}>No results yet</h3>
              <p style={{ color: t.muted, fontSize: 13 }}>Take a quiz to see your results!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const t = theme(isDark);
  const isInstructor = user?.role === 'instructor' || user?.is_staff;

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Segoe UI', sans-serif", transition: 'all 0.2s' }}>
      <nav style={{ height: 52, background: t.surface, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 18 }}>🧠</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: t.text }}>QuizMaster</span>
        <span style={{ fontSize: 10, background: `${t.accent}22`, color: t.accent, padding: '2px 7px', borderRadius: 20, fontWeight: 600, border: `1px solid ${t.accent}33`, whiteSpace: 'nowrap' }}>
          {isInstructor ? '👨‍🏫 Instructor' : '🎓 Student'}
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ background: isDark ? '#2a2a3a' : '#f0f0f8', border: `1px solid ${t.border}`, borderRadius: 20, padding: '2px 3px', display: 'flex', gap: 2 }}>
          {['Dark', 'Light'].map(th => (
            <button key={th} onClick={() => setIsDark(th === 'Dark')} style={{ padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: (isDark && th === 'Dark') || (!isDark && th === 'Light') ? t.accent : 'transparent', color: (isDark && th === 'Dark') || (!isDark && th === 'Light') ? '#fff' : t.muted, transition: 'all 0.2s' }}>{th}</button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: t.muted, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>👋 {user?.first_name || user?.username}</span>
        <button onClick={logout} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.muted, padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>Out</button>
      </nav>
      <div style={{ padding: '20px 0' }}>
        {isInstructor ? <InstructorDashboard t={t} /> : <StudentDashboard t={t} />}
      </div>
    </div>
  );
}

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#555', background: '#0f0f13' }}>Loading…</div>;
  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}