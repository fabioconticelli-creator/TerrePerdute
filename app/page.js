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

// ── PLAYER SHEET ──
const STATS_LIST=[['FOR','str'],['DES','dex'],['COS','con'],['INT','int'],['SAG','wis'],['CAR','cha']]
const ITEM_TYPES=['Arma','Arma magica','Armatura','Consumabile','Vari']
const STATUS_COLORS={'visitato':'#2ecc71','noto':'#3498db','sconosciuto':'#8a7fa0','pericoloso':'#e74c3c'}

function ImgUploadChar({bucket,folder,currentPath,onUploaded,label}){
  const [uploading,setUploading]=useState(false)
  const ref=useRef()
  const url=getPublicUrl(bucket,currentPath)
  const handle=async(e)=>{
    const file=e.target.files[0]; if(!file) return
    setUploading(true)
    const path=await uploadImage(bucket,file,folder)
    setUploading(false)
    if(path) onUploaded(path)
  }
  return <div style={{marginBottom:14}}>
    <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim,marginBottom:6}}>{label}</label>
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      {url&&<img src={url} alt="" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',border:`2px solid ${C.red2}`}}/>}
      <button type="button" onClick={()=>ref.current.click()} style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:'9px 16px',fontSize:14,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>
        {uploading?'Caricamento...':url?'Cambia':'Carica immagine'}
      </button>
      <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={handle}/>
    </div>
  </div>
}

function PlayerSheet({playerName,playerColor,isOwner}){
  const [tab,setTab]=useState('scheda')
  const [char,setChar]=useState(null)
  const [inventory,setInventory]=useState([])
  const [companions,setCompanions]=useState([])
  const [notes,setNotes]=useState([])
  const [loading,setLoading]=useState(true)
  const [editMode,setEditMode]=useState(false)
  const [playerId,setPlayerId]=useState(null)
  const [expandedNote,setExpandedNote]=useState(null)

  const EC={name:'',class:'',race:'',level:1,background:'',hp:10,max_hp:10,ac:10,str:10,dex:10,con:10,int:10,wis:10,cha:10,attacks:'',spell_slots_total:'',spell_slots_used:'',gold:0,silver:0,copper:0,platinum:0,image_path:''}
  const [charForm,setCharForm]=useState(EC)

  const EI={name:'',type:'Vari',description:'',quantity:1}
  const [itemForm,setItemForm]=useState(EI)
  const [showItemModal,setShowItemModal]=useState(false)
  const [editingItem,setEditingItem]=useState(null)

  const ECP={name:'',type:'',hp:'',ac:'',notes:'',image_path:''}
  const [compForm,setCompForm]=useState(ECP)
  const [showCompModal,setShowCompModal]=useState(false)
  const [editingComp,setEditingComp]=useState(null)

  const EN={session_title:'',date:'',content:''}
  const [noteForm,setNoteForm]=useState(EN)
  const [showNoteModal,setShowNoteModal]=useState(false)
  const [editingNote,setEditingNote]=useState(null)

  const inp={width:'100%',boxSizing:'border-box',padding:'9px 12px',background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,fontSize:15,color:C.text,fontFamily:'inherit',outline:'none',marginTop:4}

  useEffect(()=>{
    // Find player user id from profiles
    supabase.from('profiles').select('id').eq('character_name',playerName.charAt(0).toUpperCase()+playerName.slice(1)).maybeSingle()
      .then(({data})=>{
        const pid=data?.id
        setPlayerId(pid)
        if(!pid){setLoading(false);return}
        Promise.all([
          supabase.from('player_characters').select('*').eq('player_id',pid).maybeSingle(),
          supabase.from('player_inventory').select('*').eq('player_id',pid),
          supabase.from('player_companions').select('*').eq('player_id',pid),
          supabase.from('player_session_notes').select('*').eq('player_id',pid).order('created_at',{ascending:false}),
        ]).then(([c,inv,comp,n])=>{
          if(c.data){setChar(c.data);setCharForm({...EC,...c.data})}
          setInventory(inv.data||[])
          setCompanions(comp.data||[])
          setNotes(n.data||[])
          setLoading(false)
        })
      })
  },[playerName])

  const saveChar=async()=>{
    if(!playerId) return
    if(char){
      const {data}=await supabase.from('player_characters').update(charForm).eq('id',char.id).select()
      if(data) setChar(data[0])
    } else {
      const {data}=await supabase.from('player_characters').insert([{...charForm,player_id:playerId}]).select()
      if(data) setChar(data[0])
    }
    setEditMode(false)
  }

  const handleHp=async(delta)=>{
    if(!char) return
    const newHp=Math.max(0,Math.min(char.max_hp,char.hp+delta))
    setChar(c=>({...c,hp:newHp}))
    await supabase.from('player_characters').update({hp:newHp}).eq('id',char.id)
  }

  const handleHpInput=async(val)=>{
    const v=parseInt(val)||0
    setChar(c=>({...c,hp:v}))
    if(char) await supabase.from('player_characters').update({hp:v}).eq('id',char.id)
  }

  const handleCoin=async(key,val)=>{
    const v=parseInt(val)||0
    setCharForm(f=>({...f,[key]:v}))
    setChar(c=>c?({...c,[key]:v}):null)
    if(char){
      await supabase.from('player_characters').update({[key]:v}).eq('id',char.id)
    } else if(playerId) {
      // Se non c'è ancora una scheda, la crea con solo le monete
      const {data}=await supabase.from('player_characters').insert([{...EC,[key]:v,player_id:playerId}]).select()
      if(data) setChar(data[0])
    }
  }

  const saveItem=async()=>{
    if(!itemForm.name||!playerId) return
    if(editingItem){
      const {data}=await supabase.from('player_inventory').update(itemForm).eq('id',editingItem.id).select()
      if(data) setInventory(inventory.map(i=>i.id===editingItem.id?data[0]:i))
    } else {
      const {data}=await supabase.from('player_inventory').insert([{...itemForm,player_id:playerId}]).select()
      if(data) setInventory([...inventory,data[0]])
    }
    setShowItemModal(false)
  }

  const saveComp=async()=>{
    if(!compForm.name||!playerId) return
    if(editingComp){
      const {data}=await supabase.from('player_companions').update(compForm).eq('id',editingComp.id).select()
      if(data) setCompanions(companions.map(c=>c.id===editingComp.id?data[0]:c))
    } else {
      const {data}=await supabase.from('player_companions').insert([{...compForm,player_id:playerId}]).select()
      if(data) setCompanions([...companions,data[0]])
    }
    setShowCompModal(false)
  }

  const saveNote=async()=>{
    if(!noteForm.session_title||!playerId) return
    if(editingNote){
      const {data}=await supabase.from('player_session_notes').update(noteForm).eq('id',editingNote.id).select()
      if(data) setNotes(notes.map(n=>n.id===editingNote.id?data[0]:n))
    } else {
      const {data}=await supabase.from('player_session_notes').insert([{...noteForm,player_id:playerId}]).select()
      if(data) setNotes([data[0],...notes])
    }
    setShowNoteModal(false)
  }

  if(loading) return <div style={{textAlign:'center',padding:'60px 20px',color:C.textMuted}}>Caricamento...</div>

  const hpPct=char&&char.max_hp>0?Math.max(0,Math.min(100,(char.hp/char.max_hp)*100)):0
  const hpColor=hpPct>60?C.green:hpPct>30?C.yellow:C.red2
  const imgUrl=char?getPublicUrl('character-images',char.image_path):null
  const slotsT=char?.spell_slots_total?char.spell_slots_total.split(',').map(s=>parseInt(s.trim())||0):[]
  const slotsU=char?.spell_slots_used?char.spell_slots_used.split(',').map(s=>parseInt(s.trim())||0):[]

  const tabs=['scheda','inventario','famigli','note sessione']

  return <div style={{maxWidth:560,margin:'0 auto'}}>
    {/* Header */}
    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
      {imgUrl
        ?<img src={imgUrl} alt="" style={{width:64,height:64,borderRadius:'50%',objectFit:'cover',border:`3px solid ${playerColor}`,flexShrink:0,boxShadow:`0 0 16px ${playerColor}66`}}/>
        :<div style={{width:64,height:64,borderRadius:'50%',background:playerColor+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:playerColor,border:`3px solid ${playerColor}`,flexShrink:0,fontFamily:"'Cinzel',serif"}}>{playerName[0].toUpperCase()}</div>
      }
      <div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text}}>{char?.name||playerName.charAt(0).toUpperCase()+playerName.slice(1)}</div>
        {char&&<div style={{fontSize:13,color:C.textDim,marginTop:3}}>{char.race} · {char.class} · Lv {char.level}</div>}
      </div>
    </div>

    {/* Tabs */}
    <div style={{display:'flex',gap:2,background:C.bg3,borderRadius:10,padding:3,marginBottom:16,overflowX:'auto',scrollbarWidth:'none'}}>
      {tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{fontSize:12,fontWeight:tab===t?600:400,padding:'7px 13px',borderRadius:8,border:'none',background:tab===t?C.red:'transparent',color:tab===t?'#fff':C.textDim,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,fontFamily:'inherit'}}>{t}</button>)}
    </div>

    {/* SCHEDA */}
    {tab==='scheda'&&<>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}>
        {isOwner&&(editMode
          ?<div style={{display:'flex',gap:8}}>
            <button onClick={()=>setEditMode(false)} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'7px 14px',fontSize:12,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>Annulla</button>
            <button onClick={saveChar} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
          </div>
          :<button onClick={()=>{setCharForm({...EC,...(char||{})});setEditMode(true)}} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'7px 14px',fontSize:12,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>Modifica</button>
        )}
      </div>

      {editMode?<Card>
        <ImgUploadChar bucket="character-images" folder="characters" currentPath={charForm.image_path} onUploaded={p=>setCharForm({...charForm,image_path:p})} label="Ritratto"/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,180px),1fr))',gap:'0 12px'}}>
          {[['Nome','name'],['Classe','class'],['Razza','race'],['Background','background'],['Livello','level'],['CA','ac'],['PF attuali','hp'],['PF massimi','max_hp']].map(([l,k])=>(
            <div key={k} style={{marginBottom:13}}>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>{l}</label>
              <input type={['level','ac','hp','max_hp'].includes(k)?'number':'text'} value={charForm[k]} onChange={e=>setCharForm({...charForm,[k]:e.target.value})} style={inp}/>
            </div>
          ))}
        </div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim,marginBottom:8,marginTop:4}}>Caratteristiche</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6,marginBottom:14}}>
          {STATS_LIST.map(([l,k])=>(
            <div key={k} style={{marginBottom:0}}>
              <label style={{display:'block',fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.textDim,textAlign:'center'}}>{l}</label>
              <input type="number" value={charForm[k]} onChange={e=>setCharForm({...charForm,[k]:e.target.value})} style={{...inp,textAlign:'center',padding:'6px 4px'}}/>
            </div>
          ))}
        </div>
        <div style={{marginBottom:13}}>
          <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Attacchi (Nome | Bonus | Danni)</label>
          <textarea value={charForm.attacks} onChange={e=>setCharForm({...charForm,attacks:e.target.value})} placeholder="Spada lunga | +5 | 1d8+3" style={{...inp,minHeight:80,resize:'vertical'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 12px'}}>
          <div style={{marginBottom:13}}>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Slot totali (es. 4,3,2)</label>
            <input value={charForm.spell_slots_total} onChange={e=>setCharForm({...charForm,spell_slots_total:e.target.value})} style={inp}/>
          </div>
          <div style={{marginBottom:13}}>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Slot usati (es. 2,1,0)</label>
            <input value={charForm.spell_slots_used} onChange={e=>setCharForm({...charForm,spell_slots_used:e.target.value})} style={inp}/>
          </div>
        </div>
      </Card>:char?<div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
          {[['CA',char.ac],['Livello',char.level],['Background',char.background]].map(([l,v])=>(
            <div key={l} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 8px',textAlign:'center'}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'.18em',textTransform:'uppercase',color:C.textDim}}>{l}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:l==='Background'?13:22,fontWeight:700,color:C.text,marginTop:l==='Background'?5:3}}>{v||'—'}</div>
            </div>
          ))}
        </div>

        {/* HP */}
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>Punti Ferita</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>handleHp(-1)} style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${C.red}`,background:'transparent',color:C.red,fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>−</button>
            <input type="number" value={char.hp} onChange={e=>handleHpInput(e.target.value)} style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:'6px 14px',minWidth:60,textAlign:'center',width:80,outline:'none'}}/>
            <div style={{fontSize:13,color:C.textDim}}>/ {char.max_hp}</div>
            <button onClick={()=>handleHp(1)} style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${C.green}`,background:'transparent',color:C.green,fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,marginLeft:'auto'}}>+</button>
          </div>
          <div style={{height:6,background:C.bg4,borderRadius:3,overflow:'hidden',marginTop:10}}>
            <div style={{height:'100%',width:`${hpPct}%`,background:hpColor,borderRadius:3,transition:'width .3s'}}/>
          </div>
        </Card>

        {/* Caratteristiche */}
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.red2,marginBottom:10}}>Caratteristiche</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
            {STATS_LIST.map(([l,k])=>(
              <div key={k} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:'10px 4px',textAlign:'center'}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:C.textDim}}>{l}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,margin:'3px 0'}}>{char[k]||10}</div>
                <div style={{fontSize:11,fontWeight:600,color:playerColor}}>{fmt(mod(char[k]||10))}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Attacchi */}
        {char.attacks&&<Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.red2,marginBottom:10}}>Attacchi</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:'6px 14px',alignItems:'center'}}>
            {['NOME','BONUS','DANNI'].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.textDim,letterSpacing:'.1em'}}>{h}</span>)}
            {char.attacks.split('\n').filter(Boolean).map((atk,i)=>{
              const [nome,bonus,danni]=atk.split('|').map(s=>s?.trim())
              return [
                <span key={`n${i}`} style={{fontWeight:600,color:C.text,fontSize:14}}>{nome}</span>,
                <span key={`b${i}`} style={{color:C.green,fontWeight:700,fontSize:14}}>{bonus}</span>,
                <span key={`d${i}`} style={{color:C.red2,fontSize:14}}>{danni}</span>
              ]
            })}
          </div>
        </Card>}

        {/* Slot */}
        {slotsT.length>0&&<Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.red2,marginBottom:10}}>Slot Incantesimo</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {slotsT.map((total,i)=>{
              const rem=total-(slotsU[i]||0)
              return <div key={i} style={{textAlign:'center',background:C.bg3,borderRadius:8,padding:'8px 12px',minWidth:52,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.textDim,marginBottom:6,letterSpacing:'.08em'}}>Lv {i+1}</div>
                <div style={{display:'flex',gap:3,justifyContent:'center',flexWrap:'wrap'}}>
                  {Array.from({length:total}).map((_,j)=><div key={j} style={{width:10,height:10,borderRadius:'50%',background:j<rem?playerColor:C.border}}/>)}
                </div>
                <div style={{fontSize:11,color:C.textDim,marginTop:6}}>{rem}/{total}</div>
              </div>
            })}
          </div>
        </Card>}

        {/* Monete */}
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.yellow,marginBottom:10}}>⚖ Monete</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {[['gold','MO','#d4af37'],['silver','MA','#95a5a6'],['copper','MR','#cd6133'],['platinum','MP',playerColor]].map(([k,l,col])=>(
              <div key={k} style={{textAlign:'center',background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 4px'}}>
                <div style={{fontSize:11,fontWeight:700,color:col,marginBottom:6}}>{l}</div>
                {isOwner
                  ?<input type="number" min="0" value={char[k]??0} onChange={e=>handleCoin(k,e.target.value)} style={{width:'100%',textAlign:'center',padding:'4px 2px',border:`1px solid ${col}44`,borderRadius:4,fontSize:16,fontWeight:700,color:col,background:C.bg,boxSizing:'border-box',fontFamily:"'Cinzel',serif",outline:'none'}}/>
                  :<div style={{fontSize:20,fontWeight:700,color:col}}>{char[k]??0}</div>
                }
              </div>
            ))}
          </div>
        </Card>
      </div>:<p style={{color:C.textMuted,fontStyle:'italic',textAlign:'center',padding:'40px 20px'}}>{isOwner?'Nessuna scheda. Clicca "Modifica" per iniziare.':'Scheda non ancora creata.'}</p>}
    </>}

    {/* INVENTARIO */}
    {tab==='inventario'&&<div>
      {/* Monete */}
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',color:C.yellow,marginBottom:10}}>⚖ Monete</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {[['gold','MO','#d4af37'],['silver','MA','#95a5a6'],['copper','MR','#cd6133'],['platinum','MP',playerColor]].map(([k,l,col])=>(
            <div key={k} style={{textAlign:'center',background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 4px'}}>
              <div style={{fontSize:11,fontWeight:700,color:col,marginBottom:6}}>{l}</div>
              {isOwner
                ?<input type="number" min="0" value={charForm[k]??0} onChange={e=>handleCoin(k,e.target.value)} style={{width:'100%',textAlign:'center',padding:'4px 2px',border:`1px solid ${col}44`,borderRadius:4,fontSize:16,fontWeight:700,color:col,background:C.bg,boxSizing:'border-box',fontFamily:"'Cinzel',serif",outline:'none'}}/>
                :<div style={{fontSize:20,fontWeight:700,color:col}}>{charForm[k]??0}</div>
              }
            </div>
          ))}
        </div>
      </Card>
      {isOwner&&<div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button onClick={()=>{setEditingItem(null);setItemForm(EI);setShowItemModal(true)}} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>+ Aggiungi</button>
      </div>}
      {inventory.length===0&&<p style={{color:C.textMuted,fontStyle:'italic',textAlign:'center',padding:'40px 20px'}}>Inventario vuoto...</p>}
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {inventory.map(item=>(
          <Card key={item.id}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
              <div style={{flex:1}}>
                <span style={{fontWeight:600,fontSize:15,color:C.text,fontFamily:"'Cinzel',serif"}}>{item.name}</span>
                {item.quantity>1&&<span style={{fontSize:13,color:C.textDim,marginLeft:8}}>×{item.quantity}</span>}
                <span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 7px',border:`1px solid ${C.border2}`,borderRadius:4,color:C.textDim,marginLeft:8}}>{item.type}</span>
              </div>
              {isOwner&&<div style={{display:'flex',gap:6,flexShrink:0}}>
                <button onClick={()=>{setEditingItem(item);setItemForm({name:item.name,type:item.type,description:item.description||'',quantity:item.quantity});setShowItemModal(true)}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,padding:4,color:C.textDim}}>✏️</button>
                <button onClick={async()=>{await supabase.from('player_inventory').delete().eq('id',item.id);setInventory(inventory.filter(i=>i.id!==item.id))}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,padding:4,color:C.textDim}}>🗑️</button>
              </div>}
            </div>
            {item.description&&<p style={{margin:'6px 0 0',fontSize:13,color:C.textDim}}>{item.description}</p>}
          </Card>
        ))}
      </div>
      {showItemModal&&<div onClick={()=>setShowItemModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:480,width:'92%',maxHeight:'88vh',overflowY:'auto'}}>
          <div style={{padding:'18px 20px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>{editingItem?'Modifica':'Nuovo Oggetto'}</span>
            <button onClick={()=>setShowItemModal(false)} style={{background:'none',border:'none',fontSize:20,color:C.textDim,cursor:'pointer'}}>✕</button>
          </div>
          <div style={{padding:'18px 20px'}}>
            {[['Nome','name'],['Quantità','quantity']].map(([l,k])=>(
              <div key={k} style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>{l}</label>
                <input type={k==='quantity'?'number':'text'} value={itemForm[k]} onChange={e=>setItemForm({...itemForm,[k]:e.target.value})} style={inp}/>
              </div>
            ))}
            <div style={{marginBottom:13}}>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Tipo</label>
              <select value={itemForm.type} onChange={e=>setItemForm({...itemForm,type:e.target.value})} style={{...inp,cursor:'pointer'}}>
                {ITEM_TYPES.map(t=><option key={t} style={{background:C.bg2}}>{t}</option>)}
              </select>
            </div>
            <div style={{marginBottom:13}}>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Descrizione</label>
              <textarea value={itemForm.description} onChange={e=>setItemForm({...itemForm,description:e.target.value})} style={{...inp,minHeight:70,resize:'vertical'}}/>
            </div>
          </div>
          <div style={{padding:'12px 20px 18px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:`1px solid ${C.border}`}}>
            <button onClick={()=>setShowItemModal(false)} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 16px',fontSize:13,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>Annulla</button>
            <button onClick={saveItem} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
          </div>
        </div>
      </div>}
    </div>}

    {/* FAMIGLI */}
    {tab==='famigli'&&<div>
      {isOwner&&<div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <button onClick={()=>{setEditingComp(null);setCompForm(ECP);setShowCompModal(true)}} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>+ Aggiungi</button>
      </div>}
      {companions.length===0&&<p style={{color:C.textMuted,fontStyle:'italic',textAlign:'center',padding:'40px 20px'}}>Nessun compagno...</p>}
      {companions.map(c=>{
        const cImg=getPublicUrl('character-images',c.image_path)
        return <Card key={c.id} style={{marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {cImg?<img src={cImg} alt={c.name} style={{width:44,height:44,borderRadius:'50%',objectFit:'cover',border:`2px solid ${C.border2}`,flexShrink:0}}/>
                :<div style={{width:44,height:44,borderRadius:'50%',background:C.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,border:`2px solid ${C.border}`}}>🐾</div>}
              <div>
                <div style={{fontWeight:700,color:C.text,fontFamily:"'Cinzel',serif"}}>{c.name}</div>
                <div style={{fontSize:13,color:C.textDim}}>{c.type}</div>
              </div>
            </div>
            {isOwner&&<div style={{display:'flex',gap:4}}>
              <button onClick={()=>{setEditingComp(c);setCompForm({name:c.name,type:c.type||'',hp:c.hp||'',ac:c.ac||'',notes:c.notes||'',image_path:c.image_path||''});setShowCompModal(true)}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,padding:4,color:C.textDim}}>✏️</button>
              <button onClick={async()=>{await supabase.from('player_companions').delete().eq('id',c.id);setCompanions(companions.filter(x=>x.id!==c.id))}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,padding:4,color:C.textDim}}>🗑️</button>
            </div>}
          </div>
          <div style={{display:'flex',gap:20,marginTop:8}}>
            {c.hp&&<span style={{fontSize:13,color:C.textDim}}><span style={{color:C.textMuted}}>PF </span>{c.hp}</span>}
            {c.ac&&<span style={{fontSize:13,color:C.textDim}}><span style={{color:C.textMuted}}>CA </span>{c.ac}</span>}
          </div>
          {c.notes&&<p style={{margin:'6px 0 0',fontSize:13,color:C.textDim}}>{c.notes}</p>}
        </Card>
      })}
      {showCompModal&&<div onClick={()=>setShowCompModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:480,width:'92%',maxHeight:'88vh',overflowY:'auto'}}>
          <div style={{padding:'18px 20px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>{editingComp?'Modifica':'Nuovo Compagno'}</span>
            <button onClick={()=>setShowCompModal(false)} style={{background:'none',border:'none',fontSize:20,color:C.textDim,cursor:'pointer'}}>✕</button>
          </div>
          <div style={{padding:'18px 20px'}}>
            <ImgUploadChar bucket="character-images" folder="companions" currentPath={compForm.image_path} onUploaded={p=>setCompForm({...compForm,image_path:p})} label="Foto"/>
            {[['Nome','name'],['Tipo','type'],['PF','hp'],['CA','ac']].map(([l,k])=>(
              <div key={k} style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>{l}</label>
                <input value={compForm[k]} onChange={e=>setCompForm({...compForm,[k]:e.target.value})} style={inp}/>
              </div>
            ))}
            <div style={{marginBottom:13}}>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Note</label>
              <textarea value={compForm.notes} onChange={e=>setCompForm({...compForm,notes:e.target.value})} style={{...inp,minHeight:70,resize:'vertical'}}/>
            </div>
          </div>
          <div style={{padding:'12px 20px 18px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:`1px solid ${C.border}`}}>
            <button onClick={()=>setShowCompModal(false)} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 16px',fontSize:13,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>Annulla</button>
            <button onClick={saveComp} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
          </div>
        </div>
      </div>}
    </div>}

    {/* NOTE SESSIONE */}
    {tab==='note sessione'&&<div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:C.red2}}>Diario di Sessione</span>
        {isOwner&&<button onClick={()=>{setEditingNote(null);setNoteForm(EN);setShowNoteModal(true)}} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'7px 16px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>+ Nuova</button>}
      </div>
      {notes.length===0&&<p style={{color:C.textMuted,fontStyle:'italic',textAlign:'center',padding:'40px 20px'}}>Il diario è vuoto...</p>}
      {notes.map(n=>(
        <Card key={n.id} style={{marginBottom:10,cursor:'pointer'}} onClick={()=>setExpandedNote(expandedNote===n.id?null:n.id)}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <span style={{fontWeight:700,fontSize:15,color:C.text,fontFamily:"'Cinzel',serif"}}>{n.session_title}</span>
              {n.date&&<span style={{fontSize:12,color:C.red2,marginLeft:8}}>{n.date}</span>}
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              {isOwner&&<>
                <button onClick={e=>{e.stopPropagation();setEditingNote(n);setNoteForm({session_title:n.session_title,date:n.date||'',content:n.content||''});setShowNoteModal(true)}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,padding:4,color:C.textDim}}>✏️</button>
                <button onClick={e=>{e.stopPropagation();supabase.from('player_session_notes').delete().eq('id',n.id);setNotes(notes.filter(x=>x.id!==n.id))}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,padding:4,color:C.textDim}}>🗑️</button>
              </>}
            </div>
          </div>
          {expandedNote===n.id&&<pre style={{margin:'10px 0 0',fontFamily:'inherit',fontSize:14,lineHeight:1.75,color:C.textDim,whiteSpace:'pre-wrap'}}>{n.content}</pre>}
        </Card>
      ))}
      {showNoteModal&&<div onClick={()=>setShowNoteModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:480,width:'92%',maxHeight:'88vh',overflowY:'auto'}}>
          <div style={{padding:'18px 20px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>{editingNote?'Modifica':'Nuova Nota'}</span>
            <button onClick={()=>setShowNoteModal(false)} style={{background:'none',border:'none',fontSize:20,color:C.textDim,cursor:'pointer'}}>✕</button>
          </div>
          <div style={{padding:'18px 20px'}}>
            {[['Titolo','session_title'],['Data','date']].map(([l,k])=>(
              <div key={k} style={{marginBottom:13}}>
                <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>{l}</label>
                <input value={noteForm[k]} onChange={e=>setNoteForm({...noteForm,[k]:e.target.value})} style={inp}/>
              </div>
            ))}
            <div style={{marginBottom:13}}>
              <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Note</label>
              <textarea value={noteForm.content} onChange={e=>setNoteForm({...noteForm,content:e.target.value})} style={{...inp,minHeight:160,resize:'vertical'}}/>
            </div>
          </div>
          <div style={{padding:'12px 20px 18px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:`1px solid ${C.border}`}}>
            <button onClick={()=>setShowNoteModal(false)} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 16px',fontSize:13,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>Annulla</button>
            <button onClick={saveNote} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
          </div>
        </div>
      </div>}
    </div>}
  </div>
}

// ── MAP SECTION ──
function MapSection({isDM}){
  const [pins,setPins]=useState([])
  const [mapUrl,setMapUrl]=useState(null)
  const [selected,setSelected]=useState(null)
  const [showPinModal,setShowPinModal]=useState(false)
  const [editingPin,setEditingPin]=useState(null)
  const [pendingPos,setPendingPos]=useState(null)
  const [uploading,setUploading]=useState(false)
  const [loading,setLoading]=useState(true)
  const imgRef=useRef()
  const fileRef=useRef()

  const PF={name:'',description:'',status:'sconosciuto'}
  const [pinForm,setPinForm]=useState(PF)

  const inp={width:'100%',boxSizing:'border-box',padding:'9px 12px',background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,fontSize:15,color:C.text,fontFamily:'inherit',outline:'none',marginTop:4}

  useEffect(()=>{
    supabase.from('map_pins').select('*').then(({data})=>setPins(data||[]))
    supabase.from('map_config').select('map_path').eq('id',1).maybeSingle().then(({data})=>{
      if(data?.map_path) setMapUrl(getPublicUrl('map-images',data.map_path))
      setLoading(false)
    })
  },[])

  const uploadMap=async(e)=>{
    const file=e.target.files[0]; if(!file) return
    setUploading(true)
    const ext=file.name.split('.').pop()
    const path=`maps/map_${Date.now()}.${ext}`
    const {error}=await supabase.storage.from('map-images').upload(path,file)
    if(error){alert('Errore upload: '+error.message);setUploading(false);return}
    await supabase.from('map_config').upsert({id:1,map_path:path,updated_at:new Date().toISOString()})
    setMapUrl(getPublicUrl('map-images',path))
    setUploading(false)
  }

  const handleMapClick=e=>{
    if(!isDM) return
    const rect=e.currentTarget.getBoundingClientRect()
    const x=Math.round(((e.clientX-rect.left)/rect.width)*100)
    const y=Math.round(((e.clientY-rect.top)/rect.height)*100)
    setPendingPos({x_percent:x,y_percent:y})
    setEditingPin(null)
    setPinForm(PF)
    setShowPinModal(true)
  }

  const savePin=async()=>{
    if(!pinForm.name) return
    if(editingPin){
      const {data}=await supabase.from('map_pins').update(pinForm).eq('id',editingPin.id).select()
      if(data) setPins(pins.map(p=>p.id===editingPin.id?data[0]:p))
    } else if(pendingPos){
      const {data}=await supabase.from('map_pins').insert([{...pinForm,...pendingPos}]).select()
      if(data) setPins([...pins,data[0]])
    }
    setShowPinModal(false); setPendingPos(null); setEditingPin(null)
  }

  const removePin=async(id)=>{
    await supabase.from('map_pins').delete().eq('id',id)
    setPins(pins.filter(p=>p.id!==id)); setSelected(null)
  }

  const pinColor=s=>({'visitato':'#2ecc71','noto':'#3498db','pericoloso':'#e74c3c'}[s]||C.textDim)

  if(loading) return <div style={{textAlign:'center',padding:'60px 20px',color:C.textMuted}}>Caricamento...</div>

  return <div>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
      <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:C.red2}}>Mappa</span>
      {isDM&&<div style={{display:'flex',gap:8}}>
        <button onClick={()=>fileRef.current.click()} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'6px 14px',fontSize:12,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>
          {uploading?'Caricamento...':'⬆ Carica mappa'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadMap}/>
      </div>}
    </div>

    {isDM&&mapUrl&&<p style={{fontSize:12,color:C.textMuted,marginBottom:10}}>Clicca sulla mappa per aggiungere un luogo.</p>}

    <div style={{position:'relative',background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',cursor:isDM?'crosshair':'default',minHeight:300}}>
      {mapUrl
        ?<div onClick={handleMapClick} ref={imgRef} style={{position:'relative'}}>
          <img src={mapUrl} alt="Mappa" style={{width:'100%',height:'auto',display:'block',userSelect:'none',pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0}}>
            {pins.map(pin=>(
              <div key={pin.id} onClick={e=>{e.stopPropagation();setSelected(pin)}}
                style={{position:'absolute',left:`${pin.x_percent}%`,top:`${pin.y_percent}%`,transform:'translate(-50%,-50%)',cursor:'pointer',zIndex:10}}>
                <div style={{width:14,height:14,borderRadius:'50%',background:pinColor(pin.status),border:'2px solid rgba(10,10,15,.8)',boxShadow:`0 0 8px ${pinColor(pin.status)}`}}/>
              </div>
            ))}
          </div>
        </div>
        :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:12}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:'.15em',textTransform:'uppercase',color:C.textMuted}}>Nessuna mappa caricata</div>
          {isDM&&<button onClick={()=>fileRef.current.click()} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>⬆ Carica mappa</button>}
        </div>
      }
    </div>

    {/* Pin detail */}
    {selected&&<div onClick={()=>setSelected(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(3px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,borderRadius:'16px 16px 0 0',border:`1px solid ${C.border2}`,width:'100%',maxWidth:520,padding:'20px 20px 32px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.red2}}>{selected.name}</span>
          <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',fontSize:22,color:C.textDim,cursor:'pointer'}}>✕</button>
        </div>
        <span style={{fontSize:10,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 8px',border:`1px solid ${pinColor(selected.status)}55`,borderRadius:4,color:pinColor(selected.status)}}>{selected.status}</span>
        {selected.description&&<p style={{fontSize:14,color:C.textDim,lineHeight:1.7,marginTop:10}}>{selected.description}</p>}
        {isDM&&<div style={{display:'flex',gap:8,marginTop:14}}>
          <button onClick={()=>{setEditingPin(selected);setPinForm({name:selected.name,description:selected.description||'',status:selected.status});setShowPinModal(true);setSelected(null)}} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 14px',fontSize:13,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>✏️ Modifica</button>
          <button onClick={()=>removePin(selected.id)} style={{background:C.redDim+'33',border:`1px solid ${C.redDim}`,borderRadius:8,padding:'8px 14px',fontSize:13,cursor:'pointer',color:C.red2,fontFamily:'inherit'}}>🗑️ Elimina</button>
        </div>}
      </div>
    </div>}

    {/* Pin modal */}
    {showPinModal&&<div onClick={()=>setShowPinModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:440,width:'92%'}}>
        <div style={{padding:'18px 20px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>{editingPin?'Modifica luogo':'Nuovo luogo'}</span>
          <button onClick={()=>setShowPinModal(false)} style={{background:'none',border:'none',fontSize:20,color:C.textDim,cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding:'18px 20px'}}>
          <div style={{marginBottom:13}}>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Nome</label>
            <input value={pinForm.name} onChange={e=>setPinForm({...pinForm,name:e.target.value})} style={inp}/>
          </div>
          <div style={{marginBottom:13}}>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Stato</label>
            <select value={pinForm.status} onChange={e=>setPinForm({...pinForm,status:e.target.value})} style={{...inp,cursor:'pointer'}}>
              {['visitato','noto','sconosciuto','pericoloso'].map(s=><option key={s} style={{background:C.bg2}}>{s}</option>)}
            </select>
          </div>
          <div style={{marginBottom:13}}>
            <label style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:C.textDim}}>Descrizione</label>
            <textarea value={pinForm.description} onChange={e=>setPinForm({...pinForm,description:e.target.value})} style={{...inp,minHeight:80,resize:'vertical'}}/>
          </div>
        </div>
        <div style={{padding:'12px 20px 18px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>setShowPinModal(false)} style={{background:'transparent',border:`1px solid ${C.border2}`,borderRadius:8,padding:'8px 16px',fontSize:13,cursor:'pointer',color:C.textDim,fontFamily:'inherit'}}>Annulla</button>
          <button onClick={savePin} style={{background:C.red,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Salva</button>
        </div>
      </div>
    </div>}
  </div>
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
  const [view,setView]=useState('npc')
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

      case 'mappa': return <MapSection isDM={isDM} key="mappa"/>

      default:{
        const playerName = view
        if(playerName==='minerva'||playerName==='talia'){
          const charNameMatch = profile?.character_name?.toLowerCase()===playerName
          const emailMatch = user?.email?.toLowerCase().includes(playerName)
          if(!isDM && !charNameMatch && !emailMatch)
            return<Empty msg="Accesso non autorizzato"/>
          const playerProfile = [{name:'Minerva',color:'#fb923c'},{name:'Talia',color:'#c084fc'}].find(p=>p.name.toLowerCase()===playerName)
          return <PlayerSheet playerName={playerName} playerColor={playerProfile?.color||C.red2} isOwner={isDM || charNameMatch || emailMatch}/>
        }
        return<Empty msg="Sezione non trovata"/>
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
          {[{name:'Minerva',color:'#fb923c'},{name:'Talia',color:'#c084fc'}].map(p=>(
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
