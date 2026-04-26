'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
function getPublicUrl(bucket, path){ if(!path) return null; return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}` }
async function uploadImage(bucket, file, folder){ const ext=file.name.split('.').pop(); const path=`${folder}/${Date.now()}.${ext}`; const {error}=await supabase.storage.from(bucket).upload(path,file); if(error) return null; return path }

const C = {
  bg:'#0e0b14',bg2:'#13101a',bg3:'#1a1624',bg4:'#201c2e',
  border:'#2a2040',border2:'#332848',
  red:'#c0392b',red2:'#e74c3c',redDim:'#7a1a1a',
  text:'#e8e0f0',textDim:'#8a7fa0',textMuted:'#4a4060',
  green:'#22c55e',yellow:'#eab308',
}

const mod = v => Math.floor(((v||10)-10)/2)
const fmt = v => (v>=0?'+':'')+v

const tagColor = t => ({
  Alleato:{border:'#166534',color:'#4ade80'},
  Neutrale:{border:'#713f12',color:'#fbbf24'},
  Nemico:{border:'#7f1d1d',color:'#f87171'},
  Sconosciuto:{border:'#1e3a5f',color:'#60a5fa'},
  vivo:{border:'#166534',color:'#4ade80'},
  morto:{border:'#7f1d1d',color:'#f87171'},
}[t]||{border:C.border2,color:C.textDim})

function Tag({t}){
  const s=tagColor(t)
  return <span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 8px',border:`1px solid ${s.border}`,borderRadius:5,color:s.color}}>{t}</span>
}

function Card({children,style={}}){
  return <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,...style}}>{children}</div>
}

function Btn({children,onClick,primary=false,style={}}){
  return <button onClick={onClick} style={{fontFamily:'inherit',fontSize:12,fontWeight:600,padding:'7px 14px',borderRadius:8,border:primary?'none':`1px solid ${C.border2}`,background:primary?C.red:'transparent',color:primary?'#fff':C.textDim,cursor:'pointer',...style}}>{children}</button>
}

// ── MODAL ──
function Modal({title,onClose,onSave,children}){
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:500,width:'92%',maxHeight:'88vh',overflowY:'auto',boxShadow:'0 0 40px rgba(192,57,43,.12)'}}>
        <div style={{padding:'18px 20px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,color:C.textDim,cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding:'18px 20px'}}>{children}</div>
        <div style={{padding:'12px 20px 18px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:`1px solid ${C.border}`}}>
          <Btn onClick={onClose}>Annulla</Btn>
          <Btn onClick={onSave} primary>Salva</Btn>
        </div>
      </div>
    </div>
  )
}

function FormField({label,id,value,onChange,textarea=false,select=null,placeholder=''}){
  const inp={width:'100%',background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:'inherit',fontSize:14,padding:'8px 12px',outline:'none',marginTop:4}
  return (
    <div style={{marginBottom:13}}>
      <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>{label}</label>
      {select
        ? <select value={value} onChange={e=>onChange(e.target.value)} style={{...inp,cursor:'pointer'}}>
            {select.map(o=><option key={o} value={o} style={{background:C.bg2}}>{o||'—'}</option>)}
          </select>
        : textarea
          ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...inp,minHeight:80,resize:'vertical'}}/>
          : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inp}/>
      }
    </div>
  )
}

// ── NPC PANEL ──
function NpcPanel({npc,onClose}){
  if(!npc) return null
  return (
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.7)',backdropFilter:'blur(4px)'}}/>
      <div style={{position:'relative',background:C.bg2,borderRadius:'20px 20px 0 0',border:`1px solid ${C.border2}`,width:'100%',maxWidth:640,maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 20px 12px'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.red2}}>{npc.name}</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,color:C.textDim,cursor:'pointer'}}>✕</button>
        </div>
        <div style={{textAlign:'center',padding:'0 0 14px',color:C.redDim,fontSize:12}}>✦</div>
        <div style={{padding:'0 20px 16px'}}>
          {npc.img_url
            ? <img src={npc.img_url} alt={npc.name} style={{width:'100%',borderRadius:12,border:`1px solid ${C.border2}`,maxHeight:340,objectFit:'cover',display:'block'}}/>
            : <div style={{width:'100%',height:200,background:C.bg3,borderRadius:12,border:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:56}}>{npc.icon||'👤'}</div>
          }
        </div>
        <div style={{padding:'0 20px 32px'}}>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
            {npc.attitude&&<Tag t={npc.attitude}/>}
            {npc.stato&&<Tag t={npc.stato}/>}
          </div>
          {npc.role&&<div style={{fontSize:13,color:C.textDim,marginBottom:6,fontStyle:'italic'}}>{npc.role}</div>}
          {npc.primo_incontro&&<div style={{fontSize:13,marginBottom:14}}><strong>Primo incontro:</strong> <span style={{color:C.red2}}>{npc.primo_incontro}</span></div>}
          {npc.description&&<div style={{fontSize:15,color:C.text,lineHeight:1.75}}>{npc.description}</div>}
        </div>
      </div>
    </div>
  )
}

// ── CHAR SHEET ──
const ABILITA=[
  {n:'Acrobazia',s:'dex'},{n:'Addestrare animali',s:'wis'},{n:'Arcano',s:'int'},
  {n:'Atletica',s:'str'},{n:'Furtività',s:'dex'},{n:'Indagare',s:'int'},
  {n:'Inganno',s:'cha'},{n:'Intimidire',s:'cha'},{n:'Intuizione',s:'wis'},
  {n:'Medicina',s:'wis'},{n:'Natura',s:'int'},{n:'Percezione',s:'wis'},
  {n:'Performance',s:'cha'},{n:'Persuasione',s:'cha'},{n:'Rapidità di mano',s:'dex'},
  {n:'Religione',s:'int'},{n:'Sopravvivenza',s:'wis'},{n:'Storia',s:'int'},
]

function CharSheet({char,isDM,onEdit,onHpChange}){
  const [tab,setTab]=useState('scheda')
  const tabs=['scheda','incantesimi','inventario','famigli','note session']
  const pct=char.hp_max>0?Math.max(0,Math.min(100,(char.hp/char.hp_max)*100)):0
  const hpCol=pct>60?C.green:pct>25?C.yellow:C.red2
  const color=char.color||'#c084fc'

  return (
    <div style={{maxWidth:520,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
        <div style={{width:72,height:72,borderRadius:'50%',border:`3px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,background:C.bg3,flexShrink:0}}>{char.icon||'🛡️'}</div>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text}}>{char.name}</div>
          <div style={{fontSize:13,color:C.textDim,marginTop:3}}>{char.class} {char.race} · Lv {char.level||1}</div>
        </div>
      </div>

      <div style={{display:'flex',gap:2,background:C.bg3,borderRadius:10,padding:3,marginBottom:16,overflowX:'auto'}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{fontSize:12,fontWeight:tab===t?600:400,padding:'7px 13px',borderRadius:8,border:'none',background:tab===t?C.red:'transparent',color:tab===t?'#fff':C.textDim,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,fontFamily:'inherit'}}>
            {t}
          </button>
        ))}
      </div>

      {tab==='scheda'&&<>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
          {[['CA',char.ac||0],['Livello',char.level||1],['Background',char.background||'—']].map(([l,v])=>(
            <div key={l} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 8px',textAlign:'center'}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',color:C.textDim}}>{l}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:l==='Background'?13:22,fontWeight:700,color:C.text,marginTop:l==='Background'?5:3}}>{v}</div>
            </div>
          ))}
        </div>

        <Card style={{marginBottom:12}}>
          <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>Punti Ferita</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>onHpChange(char.id,-1)} style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${C.red}`,background:'transparent',color:C.red,fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>−</button>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:'6px 14px',minWidth:60,textAlign:'center'}}>{char.hp}</div>
            <div style={{fontSize:13,color:C.textDim}}>/ {char.hp_max}</div>
            <button onClick={()=>onHpChange(char.id,1)} style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${C.green}`,background:'transparent',color:C.green,fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,marginLeft:'auto'}}>+</button>
          </div>
          <div style={{height:6,background:C.bg4,borderRadius:3,overflow:'hidden',marginTop:10}}>
            <div style={{height:'100%',width:`${pct}%`,background:hpCol,borderRadius:3,transition:'width .3s'}}/>
          </div>
        </Card>

        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.red2,marginBottom:10}}>Caratteristiche</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
            {[['STR','str'],['DEX','dex'],['CON','con'],['INT','int'],['WIS','wis'],['CHA','cha']].map(([l,k])=>(
              <div key={k} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 4px',textAlign:'center'}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.textDim}}>{l}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,margin:'3px 0'}}>{char[k]||10}</div>
                <div style={{fontSize:11,fontWeight:600,color:color}}>{fmt(mod(char[k]||10))}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.red2,marginBottom:10,display:'flex',justifyContent:'space-between'}}>
            <span>Abilità</span>
            <span style={{fontWeight:400,color:C.textMuted}}>comp +{Math.ceil((char.level||1)/4)+1}</span>
          </div>
          {ABILITA.map(a=>(
            <div key={a.n} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 2px'}}>
              <div style={{width:14,height:14,borderRadius:'50%',border:`2px solid ${C.border2}`,flexShrink:0}}/>
              <div style={{fontSize:13,fontWeight:600,color:C.text,width:30}}>{fmt(mod(char[a.s]||10))}</div>
              <div style={{fontSize:13,color:C.textDim,flex:1}}>{a.n}</div>
            </div>
          ))}
        </Card>
      </>}

      {tab!=='scheda'&&(
        <Card>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.red2,marginBottom:10}}>
            {tab==='note session'?'Note Sessione':tab.charAt(0).toUpperCase()+tab.slice(1)}
          </div>
          <div style={{fontSize:14,color:C.textDim,lineHeight:1.75,whiteSpace:'pre-wrap'}}>
            {char[tab==='note session'?'note':tab==='inventario'?'inventario':tab==='incantesimi'?'incantesimi':'famigli']||'Nessun contenuto.'}
          </div>
        </Card>
      )}

      {isDM&&(
        <div style={{display:'flex',justifyContent:'center',marginTop:12}}>
          <Btn onClick={onEdit}>✏ Modifica personaggio</Btn>
        </div>
      )}
    </div>
  )
}

// ── NPC SECTION ──
const ATTITUDE_COLORS = { Alleato:'#2ecc71', Neutrale:'#8a7fa0', Nemico:'#e74c3c', Sconosciuto:'#c084fc' }
const VITALITY_COLORS = { vivo:'#2ecc71', morto:'#e74c3c', sconosciuto:'#8a7fa0' }

function ImgUpload({ bucket, folder, currentPath, onUploaded }){
  const [uploading, setUploading]=useState(false)
  const ref=useRef()
  const url=getPublicUrl(bucket, currentPath)
  const handle=async(e)=>{
    const file=e.target.files[0]; if(!file) return
    setUploading(true)
    const path=await uploadImage(bucket, file, folder)
    setUploading(false)
    if(path) onUploaded(path)
  }
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim,marginBottom:6}}>Ritratto</label>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {url&&<img src={url} alt="" style={{width:56,height:56,borderRadius:8,objectFit:'cover',border:`2px solid ${C.red2}`}}/>}
        <button type="button" onClick={()=>ref.current.click()} style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:'9px 16px',fontSize:14,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>
          {uploading?'Caricamento...':url?'Cambia':'Carica immagine'}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={handle}/>
      </div>
    </div>
  )
}

function NPCCard({ npc, onSelect }){
  const img=getPublicUrl('npc-images', npc.image_path)
  const ac=ATTITUDE_COLORS[npc.attitude]||C.textDim
  const vc=VITALITY_COLORS[npc.vitality]||C.textDim
  return (
    <div onClick={()=>onSelect(npc)} style={{display:'flex',alignItems:'center',gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 14px',cursor:'pointer',transition:'border-color .18s'}}
      onMouseEnter={e=>e.currentTarget.style.borderColor=C.border2}
      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
      <div style={{width:48,height:48,borderRadius:'50%',border:`2px solid ${ac}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:C.bg3,flexShrink:0,overflow:'hidden'}}>
        {img?<img src={img} alt={npc.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:
          <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,color:ac}}>{npc.name[0]}</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{npc.name}</div>
        <div style={{fontSize:12,color:C.textDim,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{npc.role}</div>
        <div style={{display:'flex',gap:5,marginTop:5,flexWrap:'wrap'}}>
          <span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 7px',border:`1px solid ${ac}55`,borderRadius:4,color:ac}}>{npc.attitude}</span>
          <span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 7px',border:`1px solid ${vc}55`,borderRadius:4,color:vc}}>{npc.vitality||'vivo'}</span>
          {npc.faction&&<span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 7px',border:`1px solid #d4af3755`,borderRadius:4,color:'#d4af37'}}>{npc.faction}</span>}
        </div>
      </div>
    </div>
  )
}

function NPCSection({ isDM }){
  const [npcs,setNpcs]=useState([])
  const [selected,setSelected]=useState(null)
  const [showModal,setShowModal]=useState(false)
  const [editing,setEditing]=useState(null)
  const [search,setSearch]=useState('')
  const [filterAtt,setFilterAtt]=useState('')
  const [loading,setLoading]=useState(true)
  const emptyForm={name:'',role:'',attitude:'Neutrale',description:'',notes_dm:'',image_path:'',vitality:'vivo',first_location:'',current_location:'',faction:''}
  const [form,setForm]=useState(emptyForm)

  useEffect(()=>{
    supabase.from('npcs').select('*').order('name').then(({data})=>{setNpcs(data||[]);setLoading(false)})
  },[])

  const openAdd=()=>{setEditing(null);setForm(emptyForm);setShowModal(true)}
  const openEdit=(e,npc)=>{e&&e.stopPropagation();setEditing(npc);setForm({name:npc.name,role:npc.role||'',attitude:npc.attitude,description:npc.description||'',notes_dm:npc.notes_dm||'',image_path:npc.image_path||'',vitality:npc.vitality||'vivo',first_location:npc.first_location||'',current_location:npc.current_location||'',faction:npc.faction||''});setShowModal(true)}

  const save=async()=>{
    if(!form.name) return
    if(editing){
      const {data}=await supabase.from('npcs').update(form).eq('id',editing.id).select()
      if(data){setNpcs(npcs.map(n=>n.id===editing.id?data[0]:n));if(selected?.id===editing.id)setSelected(data[0])}
    } else {
      const {data}=await supabase.from('npcs').insert([form]).select()
      if(data) setNpcs([...npcs,data[0]].sort((a,b)=>a.name.localeCompare(b.name)))
    }
    setShowModal(false)
  }

  const remove=async(id)=>{await supabase.from('npcs').delete().eq('id',id);setNpcs(npcs.filter(n=>n.id!==id));setSelected(null)}

  const filtered=npcs.filter(n=>(!search||n.name.toLowerCase().includes(search.toLowerCase())||(n.role||'').toLowerCase().includes(search.toLowerCase()))&&(!filterAtt||n.attitude===filterAtt))

  // Group by faction
  const groups={}
  filtered.forEach(n=>{const k=n.faction||'— Nessuna fazione —';if(!groups[k])groups[k]=[];groups[k].push(n)})
  const groupKeys=Object.keys(groups).sort((a,b)=>a==='— Nessuna fazione —'?1:b==='— Nessuna fazione —'?-1:a.localeCompare(b))

  const inp={width:'100%',boxSizing:'border-box',padding:'9px 12px',background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,fontSize:15,color:C.text,fontFamily:'inherit',outline:'none',marginTop:4}
  const sel={...inp,cursor:'pointer'}

  if(loading) return <div style={{textAlign:'center',padding:'60px 20px',color:C.textMuted}}>Caricamento...</div>

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,gap:8}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:C.red2,letterSpacing:'.08em'}}>NPC</span>
        {isDM&&<button onClick={openAdd} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>+ Aggiungi</button>}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <input placeholder="Cerca..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:160,...inp,marginTop:0}}/>
        <select value={filterAtt} onChange={e=>setFilterAtt(e.target.value)} style={{...sel,marginTop:0,minWidth:130,width:'auto'}}>
          <option value="">Tutti</option>
          {Object.keys(ATTITUDE_COLORS).map(a=><option key={a}>{a}</option>)}
        </select>
      </div>
      <p style={{fontSize:12,color:C.textMuted,marginBottom:14}}>{filtered.length} personaggi</p>

      {groupKeys.map(faction=>(
        <div key={faction} style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:faction==='— Nessuna fazione —'?C.textMuted:'#d4af37',fontFamily:"'Cinzel',serif"}}>{faction}</span>
            <span style={{fontSize:11,color:C.textMuted}}>({groups[faction].length})</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {groups[faction].map(n=><NPCCard key={n.id} npc={n} onSelect={setSelected}/>)}
          </div>
        </div>
      ))}

      {/* NPC Detail Panel */}
      {selected&&(()=>{
        const img=getPublicUrl('npc-images',selected.image_path)
        const ac=ATTITUDE_COLORS[selected.attitude]||C.textDim
        const vc=VITALITY_COLORS[selected.vitality]||C.textDim
        return (
          <div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}>
            <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,borderRadius:'20px 20px 0 0',border:`1px solid ${C.border2}`,width:'100%',maxWidth:640,maxHeight:'92vh',overflowY:'auto'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 20px 12px'}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.red2}}>{selected.name}</span>
                <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',fontSize:22,color:C.textDim,cursor:'pointer'}}>✕</button>
              </div>
              <div style={{textAlign:'center',paddingBottom:14,color:C.redDim,fontSize:12}}>✦</div>
              {img&&<div style={{padding:'0 20px 16px'}}>
                <img src={img} alt={selected.name} style={{width:'100%',borderRadius:12,border:`1px solid ${C.border2}`,maxHeight:340,objectFit:'cover',display:'block'}}/>
              </div>}
              <div style={{padding:'0 20px 32px'}}>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                  <span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 8px',border:`1px solid ${ac}55`,borderRadius:4,color:ac}}>{selected.attitude}</span>
                  <span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 8px',border:`1px solid ${vc}55`,borderRadius:4,color:vc}}>{selected.vitality||'vivo'}</span>
                  {selected.faction&&<span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 8px',border:`1px solid #d4af3755`,borderRadius:4,color:'#d4af37'}}>{selected.faction}</span>}
                </div>
                {selected.role&&<div style={{fontSize:13,color:C.textDim,marginBottom:8,fontStyle:'italic'}}>{selected.role}</div>}
                {(selected.first_location||selected.current_location)&&<div style={{display:'flex',gap:16,marginBottom:12,flexWrap:'wrap'}}>
                  {selected.first_location&&<div style={{fontSize:13,color:C.textDim}}><strong style={{color:C.text}}>Primo incontro: </strong>{selected.first_location}</div>}
                  {selected.current_location&&<div style={{fontSize:13,color:C.textDim}}><strong style={{color:C.text}}>Posizione: </strong>{selected.current_location}</div>}
                </div>}
                {selected.description&&<div style={{fontSize:15,color:C.text,lineHeight:1.75}}>{selected.description}</div>}
                {isDM&&selected.notes_dm&&<div style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:'12px 14px',marginTop:16}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.red2,marginBottom:6}}>Note DM (segrete)</div>
                  <div style={{fontSize:14,color:C.textDim}}>{selected.notes_dm}</div>
                </div>}
                {isDM&&<div style={{display:'flex',gap:8,marginTop:16}}>
                  <button onClick={()=>openEdit(null,selected)} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 16px',fontSize:13,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>✏️ Modifica</button>
                  <button onClick={()=>remove(selected.id)} style={{background:C.redDim+'33',border:`1px solid ${C.redDim}`,borderRadius:8,padding:'8px 16px',fontSize:13,cursor:'pointer',color:C.red2,fontFamily:'inherit'}}>🗑️ Elimina</button>
                </div>}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Add/Edit Modal */}
      {showModal&&(
        <div onClick={()=>setShowModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:500,width:'92%',maxHeight:'88vh',overflowY:'auto'}}>
            <div style={{padding:'18px 20px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>{editing?'Modifica':'Nuovo Personaggio'}</span>
              <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',fontSize:20,color:C.textDim,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'18px 20px'}}>
              <ImgUpload bucket="npc-images" folder="npcs" currentPath={form.image_path} onUploaded={p=>setForm({...form,image_path:p})}/>
              {[['Nome','name','text'],['Ruolo','role','text'],['Luogo primo incontro','first_location','text'],['Posizione attuale','current_location','text'],['Fazione','faction','text']].map(([l,k])=>(
                <div key={k} style={{marginBottom:13}}>
                  <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>{l}</label>
                  <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={inp}/>
                </div>
              ))}
              <div style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Attitudine</label>
                <select value={form.attitude} onChange={e=>setForm({...form,attitude:e.target.value})} style={sel}>
                  {Object.keys(ATTITUDE_COLORS).map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
              <div style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Stato</label>
                <select value={form.vitality} onChange={e=>setForm({...form,vitality:e.target.value})} style={sel}>
                  <option value="vivo">Vivo</option>
                  <option value="morto">Morto</option>
                  <option value="sconosciuto">Sconosciuto</option>
                </select>
              </div>
              <div style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Descrizione</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...inp,minHeight:90,resize:'vertical'}}/>
              </div>
              {isDM&&<div style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Note DM (segrete)</label>
                <textarea value={form.notes_dm} onChange={e=>setForm({...form,notes_dm:e.target.value})} style={{...inp,minHeight:80,resize:'vertical'}}/>
              </div>}
            </div>
            <div style={{padding:'12px 20px 18px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:`1px solid ${C.border}`}}>
              <button onClick={()=>setShowModal(false)} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 16px',fontSize:13,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>Annulla</button>
              <button onClick={save} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN APP ──
export default function App(){
  const [user,setUser]=useState(null)
  const [profile,setProfile]=useState(null)
  const [view,setView]=useState('mondo')
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [loading,setLoading]=useState(true)
  const router=useRouter()

  // Data
  const [sessions,setSessions]=useState([])
  const [npcs,setNpcs]=useState([])
  const [factions,setFactions]=useState([])
  const [locations,setLocations]=useState([])
  const [timeline,setTimeline]=useState([])
  const [arcane,setArcane]=useState([])
  const [tome,setTome]=useState([])
  const [characters,setCharacters]=useState([])

  // UI
  const [npcOpen,setNpcOpen]=useState(null)
  const [modal,setModal]=useState(null)
  const [modalVals,setModalVals]=useState({})
  const [saving,setSaving]=useState(false)

  const isDM = profile?.role==='dm' || user?.email==='master@email.com'

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(!session){router.push('/login');return}
      setUser(session.user)
      loadProfile(session.user.id)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(!session){router.push('/login')}
    })
    return ()=>subscription.unsubscribe()
  },[])

  const loadProfile=async(uid)=>{
    const {data, error}=await supabase.from('profiles').select('*').eq('id',uid).maybeSingle()
    console.log('Profile loaded:', data, 'Error:', error)
    setProfile(data)
    setLoading(false)
    loadAll()
  }

  const loadAll=useCallback(async()=>{
    const [s,n,f,l,t,a,c,tm]=await Promise.all([
      supabase.from('sessions').select('*').order('created_at'),
      supabase.from('npcs').select('*').order('name'),
      supabase.from('factions').select('*').order('name'),
      supabase.from('locations').select('*').order('name'),
      supabase.from('timeline').select('*').order('created_at'),
      supabase.from('arcane').select('*').order('name'),
      supabase.from('characters').select('*').order('name'),
      supabase.from('tome').select('*').order('created_at'),
    ])
    setSessions(s.data||[])
    setNpcs(n.data||[])
    setFactions(f.data||[])
    setLocations(l.data||[])
    setTimeline(t.data||[])
    setArcane(a.data||[])
    setCharacters(c.data||[])
    setTome(tm.data||[])
  },[])

  const logout=async()=>{
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nav=(v)=>{setView(v);setSidebarOpen(false)}

  // HP update
  const handleHpChange=async(charId,delta)=>{
    const char=characters.find(c=>c.id===charId)
    if(!char)return
    const newHp=Math.max(0,Math.min(char.hp_max||999,char.hp+delta))
    setCharacters(prev=>prev.map(c=>c.id===charId?{...c,hp:newHp}:c))
    await supabase.from('characters').update({hp:newHp}).eq('id',charId)
  }

  // MODAL SAVE
  const openModal=(table,item=null)=>{
    setModal({table,id:item?.id||null})
    setModalVals(item||{})
  }

  const saveModal=async()=>{
    setSaving(true)
    const {table,id}=modal
    const vals={...modalVals}

    // Numeric fields
    const nums=['level','hp','hp_max','ac','str','dex','con','int','wis','cha','influence']
    nums.forEach(k=>{if(vals[k]!==undefined)vals[k]=parseInt(vals[k])||0})
    if(vals.locked!==undefined)vals.locked=vals.locked==='true'||vals.locked===true

    if(id){
      await supabase.from(table).update(vals).eq('id',id)
    } else {
      if(table==='characters'){
        const {data:{user:u}}=await supabase.auth.getUser()
        vals.user_id=u.id
      }
      await supabase.from(table).insert(vals)
    }
    await loadAll()
    setModal(null)
    setSaving(false)
  }

  const deleteItem=async(table,id)=>{
    if(!confirm('Eliminare?'))return
    await supabase.from(table).delete().eq('id',id)
    await loadAll()
  }

  const EditBtns=({table,item})=>isDM?(
    <div style={{display:'flex',gap:6,marginTop:10,paddingTop:9,borderTop:`1px solid ${C.border}`}}>
      <Btn onClick={()=>openModal(table,item)}>✏ Modifica</Btn>
      <Btn onClick={()=>deleteItem(table,item.id)}>✕</Btn>
    </div>
  ):null

  const Empty=({msg})=>(
    <div style={{textAlign:'center',padding:'60px 20px'}}>
      <div style={{fontSize:40,opacity:.3,marginBottom:12}}>📜</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:C.textMuted}}>{msg}</div>
    </div>
  )

  // ── RENDER CONTENT ──
  const renderContent=()=>{
    switch(view){
      case 'sessioni':
        if(!sessions.length)return<Empty msg="Nessuna sessione ancora"/>
        return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
          {sessions.map(s=>(
            <div key={s.id} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:C.redDim,borderRadius:'12px 0 0 12px'}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:'.2em',textTransform:'uppercase',color:C.redDim}}>Sessione {s.num}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,margin:'5px 0 7px'}}>{s.title}</div>
              <div style={{fontSize:13,color:C.textDim,lineHeight:1.55,fontStyle:'italic'}}>{s.excerpt}</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>{s.date}</div>
              <EditBtns table="sessions" item={s}/>
            </div>
          ))}
        </div>

      case 'npc': return <NPCSection isDM={isDM} key="npc"/>

      case 'fazioni':
        if(!factions.length)return<Empty msg="Nessuna fazione ancora"/>
        return <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {factions.map(f=>(
            <div key={f.id} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,display:'flex',gap:12}}>
              <div style={{width:44,height:44,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{f.icon||'⚔️'}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{f.name}</div>
                <div style={{fontSize:12,color:C.textDim,fontStyle:'italic',margin:'3px 0 7px',lineHeight:1.5}}>{f.description}</div>
                <div style={{height:3,background:C.bg3,borderRadius:2,overflow:'hidden',marginTop:6}}>
                  <div style={{height:'100%',width:`${f.influence||0}%`,background:`linear-gradient(90deg,${C.redDim},${C.red2})`}}/>
                </div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>Influenza: {f.influence||0}%</div>
                <EditBtns table="factions" item={f}/>
              </div>
            </div>
          ))}
        </div>

      case 'mondo':
        if(!locations.length)return<Empty msg="Nessun luogo ancora"/>
        return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
          {locations.map(w=>(
            <div key={w.id} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
              <div style={{height:76,background:C.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,borderBottom:`1px solid ${C.border}`}}>{w.icon||'🌍'}</div>
              <div style={{padding:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:600,color:C.text}}>{w.name}</div>
                <div style={{fontSize:11,color:C.textDim,fontStyle:'italic',marginTop:3,lineHeight:1.4}}>{w.description}</div>
                <EditBtns table="locations" item={w}/>
              </div>
            </div>
          ))}
        </div>

      case 'cronologia':
        if(!timeline.length)return<Empty msg="Nessun evento ancora"/>
        return <div style={{position:'relative',paddingLeft:26}}>
          <div style={{position:'absolute',left:5,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${C.redDim},transparent)`}}/>
          {timeline.map(t=>(
            <div key={t.id} style={{position:'relative',paddingLeft:16,paddingBottom:20}}>
              <div style={{position:'absolute',left:-21,top:5,width:8,height:8,border:`1px solid ${C.redDim}`,background:C.bg,transform:'rotate(45deg)'}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:'.15em',textTransform:'uppercase',color:C.redDim,marginBottom:3}}>{t.date}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{t.title}</div>
              <div style={{fontSize:13,color:C.textDim,fontStyle:'italic',lineHeight:1.55}}>{t.description}</div>
              <EditBtns table="timeline" item={t}/>
            </div>
          ))}
        </div>

      case 'arcano':
        if(!arcane.length)return<Empty msg="Nessun elemento arcano ancora"/>
        return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
          {arcane.map(a=>(
            <div key={a.id} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:8}}>{a.icon||'✨'}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{a.name}</div>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:'.15em',textTransform:'uppercase',color:C.redDim,marginBottom:7}}>{a.school}</div>
              <div style={{fontSize:12,color:C.textDim,fontStyle:'italic',lineHeight:1.5}}>{a.description}</div>
              <EditBtns table="arcane" item={a}/>
            </div>
          ))}
        </div>

      case 'party':
        if(!characters.length)return<Empty msg="Nessun personaggio"/>
        return <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {characters.map(p=>(
            <div key={p.id} onClick={()=>nav(p.name.toLowerCase())} style={{display:'flex',alignItems:'center',gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 14px',cursor:'pointer'}}>
              <div style={{width:44,height:44,borderRadius:'50%',border:`2px solid ${p.color||'#c084fc'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:C.bg3,flexShrink:0}}>{p.icon||'🛡️'}</div>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{p.name}</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:2}}>{p.class} {p.race}</div>
              </div>
              <div style={{marginLeft:'auto',fontSize:12,fontWeight:600,color:p.color||'#c084fc'}}>HP {p.hp}/{p.hp_max}</div>
            </div>
          ))}
        </div>

      case 'tomo':
        if(!isDM)return<Empty msg="Accesso riservato al DM"/>
        return <div>
          <div style={{textAlign:'center',padding:'16px 0 24px'}}>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,fontWeight:700,color:C.red2,textShadow:`0 0 24px rgba(192,57,43,.4)`}}>Tomo Segreto</div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:'.2em',textTransform:'uppercase',color:C.textMuted,marginTop:4}}>Solo DM</div>
          </div>
          {!tome.length?<Empty msg="Nessun segreto ancora"/>:tome.map(t=>(
            <div key={t.id} style={{background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.redDim}`,borderRadius:12,padding:'14px 16px',marginBottom:10}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text,marginBottom:7}}>{t.title}</div>
              {t.locked
                ?<><div style={{fontSize:13,color:C.textDim,fontStyle:'italic'}}>[SIGILLATO]</div><span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:C.redDim,border:`1px solid ${C.redDim}`,borderRadius:5,padding:'2px 8px',marginTop:7}}>🔒 Bloccato</span></>
                :<div style={{fontSize:13,color:C.textDim,fontStyle:'italic',lineHeight:1.65}}>{t.content}</div>
              }
              <EditBtns table="tome" item={t}/>
            </div>
          ))}
        </div>

      default:{
        // Character view (minerva, talia, ecc.)
        const char=characters.find(c=>c.name.toLowerCase()===view)
        if(!char)return<Empty msg="Personaggio non trovato"/>
        // Players can only see their own character
        if(!isDM && profile?.character_name?.toLowerCase()!==view)
          return<Empty msg="Accesso non autorizzato"/>
        return <CharSheet char={char} isDM={isDM} onEdit={()=>openModal('characters',char)} onHpChange={handleHpChange}/>
      }
    }
  }

  const TITLES={sessioni:'Sessioni',npc:'NPC',mappa:'Mappa',fazioni:'Fazioni',mondo:'Fogli del Mondo',cronologia:'Cronologia',arcano:'Compendio Arcano',party:'Party',tomo:'Tomo Segreto'}

  // Modal fields per tabella
  const FIELDS={
    sessions:[
      {id:'num',l:'Numero',ph:'es. I'},{id:'title',l:'Titolo',ph:'Titolo...'},{id:'date',l:'Data',ph:'es. 1 Gen 2025'},{id:'excerpt',l:'Riassunto',ph:'Cosa è successo...',ta:true},{id:'content',l:'Contenuto completo',ph:'...',ta:true}
    ],
    npcs:[
      {id:'name',l:'Nome',ph:'Nome'},{id:'role',l:'Ruolo',ph:'es. Mercante'},{id:'icon',l:'Icona',ph:'👤'},{id:'description',l:'Descrizione',ph:'Chi è?',ta:true},{id:'notes_dm',l:'Note DM (segrete)',ph:'Segreti...',ta:true},{id:'primo_incontro',l:'Primo incontro',ph:'es. Aldermoor'},{id:'img_url',l:'URL Immagine',ph:'https://...'},{id:'attitude',l:'Attitudine',sel:['Sconosciuto','Alleato','Neutrale','Nemico']},{id:'stato',l:'Stato',sel:['vivo','morto','']}
    ],
    factions:[
      {id:'name',l:'Nome',ph:'Nome'},{id:'icon',l:'Icona',ph:'⚔️'},{id:'description',l:'Descrizione',ph:'...',ta:true},{id:'influence',l:'Influenza %',ph:'0-100'}
    ],
    locations:[
      {id:'name',l:'Nome',ph:'Nome'},{id:'icon',l:'Icona',ph:'🏰'},{id:'description',l:'Descrizione',ph:'...',ta:true}
    ],
    timeline:[
      {id:'date',l:'Data',ph:'Anno 1, Giorno X'},{id:'title',l:'Titolo',ph:'Evento...'},{id:'description',l:'Descrizione',ph:'Cosa accadde...',ta:true}
    ],
    arcane:[
      {id:'name',l:'Nome',ph:'Nome'},{id:'icon',l:'Icona',ph:'✨'},{id:'school',l:'Scuola',ph:'Proibito'},{id:'description',l:'Descrizione',ph:'...',ta:true}
    ],
    characters:[
      {id:'name',l:'Nome',ph:'Nome'},{id:'class',l:'Classe',ph:'Guerriero'},{id:'race',l:'Razza',ph:'Umano'},{id:'icon',l:'Icona',ph:'🛡️'},{id:'color',l:'Colore',ph:'#c084fc'},{id:'ac',l:'CA',ph:'15'},{id:'level',l:'Livello',ph:'1'},{id:'background',l:'Background',ph:'Soldato'},{id:'hp',l:'HP Attuali',ph:'0'},{id:'hp_max',l:'HP Massimi',ph:'10'},{id:'str',l:'Forza',ph:'10'},{id:'dex',l:'Destrezza',ph:'10'},{id:'con',l:'Costituzione',ph:'10'},{id:'int',l:'Intelligenza',ph:'10'},{id:'wis',l:'Saggezza',ph:'10'},{id:'cha',l:'Carisma',ph:'10'},{id:'note',l:'Note',ph:'...',ta:true},{id:'inventario',l:'Inventario',ph:'...',ta:true},{id:'incantesimi',l:'Incantesimi',ph:'...',ta:true},{id:'famigli',l:'Famigli',ph:'...',ta:true}
    ],
    tome:[
      {id:'title',l:'Titolo',ph:'Segreto...'},{id:'content',l:'Contenuto',ph:'...',ta:true},{id:'locked',l:'Bloccato?',sel:['false','true']}
    ],
  }

  if(loading)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:C.bg}}>
      <div style={{fontFamily:"'Cinzel',serif",color:C.red2,fontSize:16,letterSpacing:'.1em'}}>Caricamento...</div>
    </div>
  )

  const navItems=[
    {v:'npc',icon:'👤',l:'NPC'},
    {v:'mappa',icon:'🗺️',l:'Mappa'},
    {v:'fazioni',icon:'⚔️',l:'Fazioni'},
    {v:'cronologia',icon:'⏳',l:'Cronologia'},
  ]

  const playerColors={'minerva':'#c084fc','talia':'#fb923c'}

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:C.bg}}>

      {/* Overlay */}
      {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:49,backdropFilter:'blur(3px)'}}/>}

      {/* SIDEBAR */}
      <aside style={{width:260,background:C.panel||'#110e18',borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto',position:'fixed',top:0,left:0,bottom:0,zIndex:50,transform:sidebarOpen?'translateX(0)':'translateX(-100%)',transition:'transform .3s cubic-bezier(.4,0,.2,1)',boxShadow:sidebarOpen?'4px 0 24px rgba(0,0,0,.7)':'none'}}>
        <div style={{padding:'22px 18px 18px',borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:`radial-gradient(circle at 35% 35%,${C.red2},${C.redDim})`,boxShadow:`0 0 16px rgba(192,57,43,.4)`,flexShrink:0}}/>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:C.text}}>House Valerius</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{isDM?'DM · Dungeon Master':profile?.character_name||'Giocatore'}</div>
            </div>
          </div>
        </div>

        <div style={{padding:'14px 0 6px'}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:'.18em',textTransform:'uppercase',color:C.textMuted,padding:'0 18px 6px'}}>La Campagna</div>
          {navItems.map(({v,icon,l})=>(
            <div key={v} onClick={()=>nav(v)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 18px',cursor:'pointer',fontSize:13,fontWeight:view===v?500:400,color:view===v?C.red2:C.textDim,background:view===v?'rgba(192,57,43,.1)':'transparent',borderLeft:`2px solid ${view===v?C.red:'transparent'}`}}>
              <span style={{fontSize:14,width:18,textAlign:'center'}}>{icon}</span>{l}
            </div>
          ))}
          {isDM&&(
            <div onClick={()=>nav('tomo')} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 18px',cursor:'pointer',fontSize:13,color:view==='tomo'?C.red2:C.textDim,background:view==='tomo'?'rgba(192,57,43,.1)':'transparent',borderLeft:`2px solid ${view==='tomo'?C.red:'transparent'}`}}>
              <span style={{fontSize:14,width:18,textAlign:'center'}}>🔒</span>Tomo Segreto
            </div>
          )}
        </div>

        <div style={{height:1,background:C.border,margin:'6px 18px'}}/>
        <div style={{padding:'14px 0 6px'}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:'.18em',textTransform:'uppercase',color:C.textMuted,padding:'0 18px 6px'}}>La Compagnia</div>
          {[{name:'Minerva',color:'#c084fc'},{name:'Talia',color:'#fb923c'}].map(p=>(
            <div key={p.name} onClick={()=>nav(p.name.toLowerCase())} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 18px',cursor:'pointer',fontSize:13,color:view===p.name.toLowerCase()?C.red2:C.textDim,background:view===p.name.toLowerCase()?'rgba(192,57,43,.1)':'transparent',borderLeft:`2px solid ${view===p.name.toLowerCase()?C.red:'transparent'}`}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:p.color,flexShrink:0,display:'inline-block'}}/>
              {p.name}
            </div>
          ))}
        </div>

        <div style={{marginTop:'auto',padding:'14px 18px',borderTop:`1px solid ${C.border}`}}>
          <button onClick={logout} style={{width:'100%',padding:'8px',background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,color:C.textDim,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            Esci
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:`1px solid ${C.border}`,background:C.bg2,gap:10,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:'none',border:`1px solid ${C.border2}`,borderRadius:8,color:C.textDim,fontSize:16,width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>☰</button>
            <div style={{width:26,height:26,borderRadius:'50%',background:`radial-gradient(circle at 35% 35%,${C.red2},${C.redDim})`,boxShadow:`0 0 10px rgba(192,57,43,.4)`,flexShrink:0}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.red2,letterSpacing:'.06em'}}>{TITLES[view]||view.charAt(0).toUpperCase()+view.slice(1)}</span>
          </div>
          {isDM&&view!=='npc'&&(
            <button onClick={()=>openModal(
              view==='sessioni'?'sessions':
              view==='fazioni'?'factions':
              view==='mondo'?'locations':
              view==='cronologia'?'timeline':
              view==='arcano'?'arcane':
              view==='tomo'?'tome':'sessions'
            )} style={{fontSize:12,fontWeight:600,padding:'6px 14px',borderRadius:8,background:C.red,color:'#fff',border:'none',cursor:'pointer'}}>+ Aggiungi</button>
          )}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:20}}>
          {renderContent()}
        </div>
      </div>

      {/* NPC PANEL */}
      <NpcPanel npc={npcOpen} onClose={()=>setNpcOpen(null)}/>

      {/* MODAL */}
      {modal&&(
        <Modal title={modal.id?'Modifica':'Aggiungi'} onClose={()=>setModal(null)} onSave={saveModal}>
          {(FIELDS[modal.table]||[]).map(f=>(
            <FormField
              key={f.id}
              label={f.l}
              id={f.id}
              value={modalVals[f.id]||''}
              onChange={v=>setModalVals(prev=>({...prev,[f.id]:v}))}
              textarea={f.ta}
              select={f.sel}
              placeholder={f.ph}
            />
          ))}
          {saving&&<div style={{textAlign:'center',color:C.textDim,fontSize:12,marginTop:8}}>Salvataggio...</div>}
        </Modal>
      )}
    </div>
  )
}
