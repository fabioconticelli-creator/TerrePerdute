'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
 
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
 
  const login = async () => {
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('Credenziali non valide.'); setLoading(false) }
    else { router.push('/') }
  }
 
  const s = {
    wrap: { minHeight:'100vh', background:'#0e0b14', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', fontFamily:"'Inter',sans-serif" },
    box: { width:'100%', maxWidth:380, background:'#13101a', border:'1px solid #332848', borderRadius:16, padding:'2rem', boxShadow:'0 0 40px rgba(192,57,43,0.15)' },
    orb: { width:56, height:56, borderRadius:'50%', background:'radial-gradient(circle at 35% 35%,#e74c3c,#7a1a1a)', boxShadow:'0 0 24px rgba(192,57,43,0.5)', margin:'0 auto 16px' },
    title: { textAlign:'center', fontFamily:"'Cinzel Decorative',serif", color:'#e74c3c', fontSize:20, marginBottom:4, textShadow:'0 0 20px rgba(192,57,43,0.5)' },
    sub: { textAlign:'center', color:'#4a4060', fontSize:13, marginBottom:28 },
    label: { display:'block', fontSize:10, color:'#e74c3c', marginBottom:4, letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:700 },
    input: { width:'100%', boxSizing:'border-box', padding:'10px 12px', background:'#0e0b14', border:'1px solid #332848', borderRadius:8, fontSize:16, color:'#e8e0f0', fontFamily:'inherit', outline:'none', marginBottom:14 },
    btn: { width:'100%', padding:'12px', background:'#c0392b', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:"'Cinzel',serif", letterSpacing:'0.08em' },
    err: { color:'#e74c3c', fontSize:13, textAlign:'center', marginBottom:10 },
  }
 
  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.orb}/>
        <h1 style={s.title}>House Valerius</h1>
        <p style={s.sub}>Accedi per continuare la campagna</p>
        <label style={s.label}>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={s.input}/>
        <label style={s.label}>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={s.input}/>
        {error && <p style={s.err}>{error}</p>}
        <button onClick={login} disabled={loading} style={{...s.btn, opacity:loading?0.7:1}}>
          {loading ? 'Accesso...' : 'Entra'}
        </button>
      </div>
    </div>
  )
}
 
