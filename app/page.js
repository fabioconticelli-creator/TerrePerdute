"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nrnikfajuzilnglvyezm.supabase.co";
const SUPABASE_KEY = "sb_publishable_AtRqw50X9ATc76oJdK1Y6g_zz93ugbc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DM_PIN = "1234";

const C = {
  bg:"#070b14", bg2:"#0b1120", bg3:"#101827", bg4:"#162030",
  panel:"#080e1a", border:"#1a2a42", border2:"#1e3250",
  text:"#e8e4d0", textDim:"#8a8070", textMuted:"#3a3828",
  green:"#22c55e", yellow:"#eab308",
  gold:"#d4a017", goldDim:"#7a5c00", goldGlow:"rgba(212,160,23,.35)",
};

const ABILITA = [
  {n:"Acrobazia",s:"des"},{n:"Addestrare animali",s:"sag"},{n:"Arcano",s:"int"},
  {n:"Atletica",s:"for"},{n:"Furtività",s:"des"},{n:"Indagare",s:"int"},
  {n:"Inganno",s:"car"},{n:"Intimidire",s:"car"},{n:"Intuizione",s:"sag"},
  {n:"Medicina",s:"sag"},{n:"Natura",s:"int"},{n:"Percezione",s:"sag"},
  {n:"Performance",s:"car"},{n:"Persuasione",s:"car"},{n:"Rapidità di mano",s:"des"},
  {n:"Religione",s:"int"},{n:"Sopravvivenza",s:"sag"},{n:"Storia",s:"int"},
];

const mod = v => Math.floor(((v||10)-10)/2);
const fmtMod = v => (v>=0?"+":"")+v;
const tagColor = t => ({
  Alleato:{border:"#1a4a2e",color:"#4ade80"},
  Neutrale:{border:"#4a3800",color:"#fbbf24"},
  Nemico:{border:"#4a1010",color:"#f87171"},
  Sconosciuto:{border:"#1a2a4a",color:"#60a5fa"},
  vivo:{border:"#1a4a2e",color:"#4ade80"},
  morto:{border:"#4a1010",color:"#f87171"},
}[t]||{border:C.border2,color:C.textDim});

function Tag({t}){
  const s=tagColor(t);
  return <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",padding:"2px 8px",border:`1px solid ${s.border}`,borderRadius:5,color:s.color}}>{t}</span>;
}

function Btn({children,onClick,style={},primary=false,disabled=false}){
  return <button onClick={onClick} disabled={disabled} style={{fontFamily:"inherit",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,border:primary?"none":`1px solid ${C.border2}`,background:primary?C.gold:"transparent",color:primary?"#0b1120":C.textDim,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,...style}}>{children}</button>;
}

function Card({children,style={}}){
  return <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,...style}}>{children}</div>;
}

function EmptyState({msg}){
  return <div style={{textAlign:"center",padding:"60px 20px"}}>
    <div style={{fontSize:40,opacity:.3,marginBottom:12}}>📜</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:C.textMuted}}>{msg}</div>
  </div>;
}

function Modal({title,onClose,onSave,saving,children}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:500,width:"92%",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 0 40px ${C.goldGlow}`}}>
      <div style={{padding:"18px 20px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:C.textDim,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:"18px 20px"}}>{children}</div>
      <div style={{padding:"12px 20px 18px",display:"flex",gap:8,justifyContent:"flex-end",borderTop:`1px solid ${C.border}`}}>
        <Btn onClick={onClose}>Annulla</Btn>
        <Btn onClick={onSave} primary disabled={saving}>{saving?"Salvataggio...":"Salva"}</Btn>
      </div>
    </div>
  </div>;
}

function NpcFormModal({npc, onClose, onSaved}){
  const [vals, setVals] = useState(npc || {name:"",role:"",icon:"👤",description:"",primo_incontro:"",attitude:"Neutrale",stato:"vivo",img_url:""});
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(npc?.img_url||"");
  const [saving, setSaving] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if(!f) return;
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    setSaving(true);
    try {
      let imgUrl = vals.img_url || "";
      if(imgFile){
        const ext = imgFile.name.split(".").pop();
        const path = `${Date.now()}.${ext}`;
        const {error:upErr} = await supabase.storage.from("npc-images").upload(path, imgFile, {upsert:true});
        if(upErr) throw upErr;
        const {data:urlData} = supabase.storage.from("npc-images").getPublicUrl(path);
        imgUrl = urlData.publicUrl;
      }
      const payload = {...vals, img_url: imgUrl};
      delete payload.id;
      let error;
      if(npc?.id){
        ({error} = await supabase.from("npcs").update(payload).eq("id", npc.id));
      } else {
        ({error} = await supabase.from("npcs").insert(payload));
      }
      if(error) throw error;
      onSaved();
    } catch(e){
      alert("Errore: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = {width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const lbl = {display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim};

  return <Modal title={npc?.id?"Modifica NPC":"Nuovo NPC"} onClose={onClose} onSave={save} saving={saving}>
    <div style={{marginBottom:13}}>
      <label style={lbl}>Immagine</label>
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
        {imgPreview
          ? <img src={imgPreview} style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:10,border:`1px solid ${C.border2}`}}/>
          : <div style={{width:"100%",height:120,background:C.bg3,borderRadius:10,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{vals.icon||"👤"}</div>
        }
        <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:12,color:C.textDim,textAlign:"center",width:"100%",boxSizing:"border-box"}}>
          📷 Scegli foto dal telefono
          <input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
        </label>
        {imgPreview && <button onClick={()=>{setImgFile(null);setImgPreview("");setVals(v=>({...v,img_url:""}));}} style={{fontSize:11,color:"#f87171",background:"none",border:"none",cursor:"pointer"}}>✕ Rimuovi immagine</button>}
      </div>
    </div>
    {[
      {id:"name",l:"Nome",ph:"Nome"},
      {id:"role",l:"Ruolo",ph:"es. Mercante"},
      {id:"icon",l:"Icona",ph:"👤"},
      {id:"primo_incontro",l:"Primo incontro",ph:"es. Aldermoor"},
    ].map(f=>(
      <div key={f.id} style={{marginBottom:13}}>
        <label style={lbl}>{f.l}</label>
        <input value={vals[f.id]||""} onChange={e=>setVals(v=>({...v,[f.id]:e.target.value}))} placeholder={f.ph} style={inp}/>
      </div>
    ))}
    <div style={{marginBottom:13}}>
      <label style={lbl}>Descrizione</label>
      <textarea value={vals.description||""} onChange={e=>setVals(v=>({...v,description:e.target.value}))} placeholder="Chi è?" style={{...inp,minHeight:80,resize:"vertical"}}/>
    </div>
    <div style={{marginBottom:13}}>
      <label style={lbl}>Relazione</label>
      <select value={vals.attitude||"neutrale"} onChange={e=>setVals(v=>({...v,attitude:e.target.value}))} style={{...inp,cursor:"pointer"}}>
        {["Neutrale","Alleato","Nemico","Sconosciuto"].map(o=><option key={o} value={o} style={{background:C.bg2}}>{o}</option>)}
      </select>
    </div>
    <div style={{marginBottom:13}}>
      <label style={lbl}>Stato</label>
      <select value={vals.stato||""} onChange={e=>setVals(v=>({...v,stato:e.target.value}))} style={{...inp,cursor:"pointer"}}>
        {["vivo","morto",""].map(o=><option key={o} value={o} style={{background:C.bg2}}>{o||"—"}</option>)}
      </select>
    </div>
  </Modal>;
}

function GenericModal({title, fields, vals, onClose, onSave, saving, onChange}){
  const inp = {width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  return <Modal title={title} onClose={onClose} onSave={onSave} saving={saving}>
    {fields.map(f=>(
      <div key={f.id} style={{marginBottom:13}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim}}>{f.l}</label>
        {f.sel
          ? <select value={vals[f.id]||""} onChange={e=>onChange(f.id,e.target.value)} style={{...inp,cursor:"pointer"}}>
              {f.sel.map(o=><option key={o} value={o} style={{background:C.bg2}}>{o||"—"}</option>)}
            </select>
          : f.ta
            ? <textarea value={vals[f.id]||""} onChange={e=>onChange(f.id,e.target.value)} placeholder={f.ph} style={{...inp,minHeight:80,resize:"vertical"}}/>
            : <input value={vals[f.id]||""} onChange={e=>onChange(f.id,e.target.value)} placeholder={f.ph} style={inp}/>
        }
      </div>
    ))}
  </Modal>;
}

function PinModal({onSuccess,onClose}){
  const [val,setVal]=useState("");
  const [err,setErr]=useState("");
  const press = d => {
    if(val.length>=4)return;
    const next=val+d;
    setVal(next);
    if(next.length===4){
      setTimeout(()=>{
        if(next===DM_PIN){onSuccess();}
        else{setErr("PIN errato");setVal("");}
      },80);
    }
  };
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,width:280,padding:"20px 20px 16px",boxShadow:`0 0 32px ${C.goldGlow}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold}}>🔐 Accesso DM</span>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:C.textDim,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"0 0 16px"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",border:`2px solid ${i<val.length?C.gold:C.border2}`,background:i<val.length?C.gold:"transparent",transition:"all .15s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,maxWidth:210,margin:"0 auto"}}>
        {["1","2","3","4","5","6","7","8","9","CLR","0","⌫"].map(k=>(
          <button key={k} onClick={()=>k==="CLR"?setVal(""):k==="⌫"?setVal(v=>v.slice(0,-1)):press(k)}
            style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:k.length>1?11:18,fontWeight:500,padding:"13px 0",cursor:"pointer"}}>
            {k}
          </button>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,fontWeight:600,color:C.gold,marginTop:8,minHeight:16}}>{err}</div>
    </div>
  </div>;
}

function NpcPanel({npc,onClose}){
  if(!npc)return null;
  return <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)"}}/>
    <div style={{position:"relative",background:C.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${C.border2}`,width:"100%",maxWidth:640,maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px 12px"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.gold}}>{npc.name}</span>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{textAlign:"center",padding:"0 0 14px",color:C.goldDim,fontSize:12}}>✦</div>
      <div style={{padding:"0 20px 16px"}}>
        {npc.img_url
          ? <img src={npc.img_url} alt={npc.name} style={{width:"100%",aspectRatio:"2/3",borderRadius:12,border:`2px solid ${C.gold}`,objectFit:"cover",objectPosition:"center top",display:"block"}}/>
          : <div style={{width:"100%",height:200,background:C.bg3,borderRadius:12,border:`1px solid ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>{npc.icon||"👤"}</div>
        }
      </div>
      <div style={{padding:"0 20px 32px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {npc.attitude&&<Tag t={npc.attitude}/>}{npc.stato&&<Tag t={npc.stato}/>}
        </div>
        {npc.role&&<div style={{fontSize:13,color:C.textDim,marginBottom:6,fontStyle:"italic"}}>{npc.role}</div>}
        {npc.primo_incontro&&<div style={{fontSize:13,marginBottom:14}}><strong>Primo incontro:</strong> <span style={{color:C.gold}}>{npc.primo_incontro}</span></div>}
        {npc.description&&<div style={{fontSize:15,color:C.text,lineHeight:1.75}}>{npc.description}</div>}
      </div>
    </div>
  </div>;
}

function CharSheet({p,idx,isAuth,onEdit,onHpChange}){
  const [tab,setTab]=useState("scheda");
  const tabs=["scheda","incantesimi","inventario","famigli","note session"];
  const hpPct=p.hpMax>0?Math.max(0,Math.min(100,(p.hp/p.hpMax)*100)):0;
  const hpColor=hpPct>60?C.green:hpPct>25?C.yellow:"#f87171";
  const statBox=(lbl,val)=>(
    <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:C.textDim}}>{lbl}</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text,marginTop:3}}>{val}</div>
    </div>
  );
  return <div style={{maxWidth:520,margin:"0 auto"}}>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
      <div style={{width:72,height:72,borderRadius:"50%",border:`3px solid ${p.color||C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,background:C.bg3,flexShrink:0}}>{p.icon||"🛡️"}</div>
      <div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text}}>{p.name}</div>
        <div style={{fontSize:13,color:C.textDim,marginTop:3}}>{p.sub}</div>
      </div>
    </div>
    <div style={{display:"flex",gap:2,background:C.bg3,borderRadius:10,padding:3,marginBottom:16,overflowX:"auto"}}>
      {tabs.map(t=>(
        <button key={t} onClick={()=>setTab(t)} style={{fontSize:12,fontWeight:tab===t?600:400,padding:"7px 13px",borderRadius:8,border:"none",background:tab===t?C.gold:"transparent",color:tab===t?"#0b1120":C.textDim,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t}</button>
      ))}
    </div>
    {tab==="scheda"&&<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {statBox("CA",p.ca||0)}{statBox("Livello",p.livello||1)}
        <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:C.textDim}}>Background</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:C.text,marginTop:5}}>{p.background||"—"}</div>
        </div>
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>Punti Ferita</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>onHpChange(idx,-1)} style={{width:36,height:36,borderRadius:"50%",border:"2px solid #f87171",background:"transparent",color:"#f87171",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 14px",minWidth:60,textAlign:"center"}}>{p.hp}</div>
          <div style={{fontSize:13,color:C.textDim}}>/ {p.hpMax}</div>
          <button onClick={()=>onHpChange(idx,1)} style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${C.green}`,background:"transparent",color:C.green,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginLeft:"auto"}}>+</button>
        </div>
        <div style={{height:6,background:C.bg4,borderRadius:3,overflow:"hidden",marginTop:10}}>
          <div style={{height:"100%",width:`${hpPct}%`,background:hpColor,borderRadius:3,transition:"width .3s"}}/>
        </div>
      </Card>
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Caratteristiche</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
          {["for","des","cos","int","sag","car"].map(s=>(
            <div key={s} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>{s.toUpperCase()}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,margin:"3px 0"}}>{p[s]||10}</div>
              <div style={{fontSize:11,fontWeight:600,color:C.gold}}>{fmtMod(mod(p[s]||10))}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10,display:"flex",justifyContent:"space-between"}}>
          <span>Abilità</span><span style={{fontWeight:400,color:C.textMuted}}>comp +{Math.ceil((p.livello||1)/4)+1}</span>
        </div>
        {ABILITA.map(a=>(
          <div key={a.n} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 2px"}}>
            <div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${C.border2}`,flexShrink:0}}/>
            <div style={{fontSize:13,fontWeight:600,color:C.text,width:30}}>{fmtMod(mod(p[a.s]||10))}</div>
            <div style={{fontSize:13,color:C.textDim,flex:1}}>{a.n}</div>
            <div style={{width:28,height:28,background:C.bg3,border:`1px solid ${C.border}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.textMuted}}>—</div>
          </div>
        ))}
      </Card>
    </>}
    {tab==="inventario"&&<Card><div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Inventario vuoto</div></Card>}
    {tab==="incantesimi"&&<Card><div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessun incantesimo</div></Card>}
    {tab==="famigli"&&<Card><div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessun famiglio</div></Card>}
    {tab==="note session"&&<Card><div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessuna nota</div></Card>}
    {isAuth&&<div style={{display:"flex",gap:6,marginTop:12,justifyContent:"center"}}><Btn onClick={()=>onEdit(p)}>✏ Modifica</Btn></div>}
  </div>;
}

// ── TABLE CONFIG ──
const TABLE_MAP = {
  sessioni: { table:"sessions", fields:[
    {id:"num",l:"Numero",ph:"es. I"},{id:"title",l:"Titolo",ph:"Titolo..."},
    {id:"date",l:"Data",ph:"es. 1 Gen 2025"},{id:"excerpt",l:"Riassunto",ph:"Cosa è successo...",ta:true}
  ]},
  gilda: { table:"factions", fields:[
    {id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"🏴"},
    {id:"rank",l:"Rango",ph:"es. Fondatori"},{id:"desc",l:"Descrizione",ph:"...",ta:true},
    {id:"sede",l:"Sede",ph:"es. Porto di Arenmar"},{id:"influence",l:"Potere %",ph:"0-100"}
  ]},
  fazioni: { table:"factions", fields:[
    {id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"⚔️"},
    {id:"desc",l:"Descrizione",ph:"...",ta:true},{id:"influence",l:"Influenza %",ph:"0-100"}
  ]},
  mondo: { table:"locations", fields:[
    {id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"🏰"},{id:"sub",l:"Descrizione",ph:"...",ta:true}
  ]},
  cronologia: { table:"timeline", fields:[
    {id:"date",l:"Data",ph:"Anno 1, Giorno X"},{id:"title",l:"Titolo",ph:"Evento..."},
    {id:"desc",l:"Descrizione",ph:"Cosa accadde...",ta:true}
  ]},
  arcano: { table:"arcane", fields:[
    {id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"✨"},
    {id:"school",l:"Scuola",ph:"Proibito"},{id:"desc",l:"Descrizione",ph:"...",ta:true}
  ]},
  tomo: { table:"tome", fields:[
    {id:"title",l:"Titolo",ph:"Segreto..."},{id:"text",l:"Contenuto",ph:"...",ta:true},
    {id:"locked",l:"Bloccato?",sel:["false","true"]}
  ]},
};

export default function App(){
  const [data,setData]=useState({sessioni:[],npc:[],gilda:[],fazioni:[],mondo:[],cronologia:[],arcano:[],tomo:[],party:[]});
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("mondo");
  const [isAuth,setIsAuth]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [showPin,setShowPin]=useState(false);
  const [npcOpen,setNpcOpen]=useState(null);
  const [modal,setModal]=useState(null); // {view, item|null}
  const [npcModal,setNpcModal]=useState(null); // npc obj or "new"
  const [genericModal,setGenericModal]=useState(null); // {view, item}
  const [genericVals,setGenericVals]=useState({});
  const [saving,setSaving]=useState(false);

  const TITLES={sessioni:"Sessioni",npc:"NPC",mappa:"Mappa",gilda:"Gilda",fazioni:"Fazioni",mondo:"Fogli del Mondo",cronologia:"Cronologia",arcano:"Compendio Arcano",party:"Party",tomo:"Tomo Segreto"};

  // ── LOAD DATA ──
  const loadAll = async () => {
    setLoading(true);
    try {
      const [npcs, sessions, factions, locations, timeline, arcane, tome] = await Promise.all([
        supabase.from("npcs").select("*").order("created_at",{ascending:false}),
        supabase.from("sessions").select("*").order("created_at",{ascending:false}),
        supabase.from("factions").select("*").order("created_at",{ascending:false}),
        supabase.from("locations").select("*").order("created_at",{ascending:false}),
        supabase.from("timeline").select("*").order("created_at",{ascending:false}),
        supabase.from("arcane").select("*").order("created_at",{ascending:false}),
        supabase.from("tome").select("*").order("created_at",{ascending:false}),
      ]);
      setData(d=>({...d,
        npc: npcs.data||[],
        sessioni: sessions.data||[],
        gilda: factions.data||[],
        fazioni: factions.data||[],
        mondo: locations.data||[],
        cronologia: timeline.data||[],
        arcano: arcane.data||[],
        tomo: tome.data||[],
      }));
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  useEffect(()=>{ loadAll(); },[]);

  const nav=(v)=>{setView(v);setSidebarOpen(false);};
  const toggleDm=()=>{ if(isAuth){setIsAuth(false);}else{setShowPin(true);} };

  // ── NPC ──
  const openNpcAdd = () => { if(!isAuth){setShowPin(true);return;} setNpcModal({}); };
  const openNpcEdit = (npc) => setNpcModal(npc);
  const deleteNpc = async (id) => {
    if(!window.confirm("Eliminare?"))return;
    await supabase.from("npcs").delete().eq("id",id);
    loadAll();
  };

  // ── GENERIC CRUD ──
  const openGenericAdd = () => {
    if(!isAuth){setShowPin(true);return;}
    setGenericVals({});
    setGenericModal({view, item:null});
  };
  const openGenericEdit = (v, item) => {
    setGenericVals({...item});
    setGenericModal({view:v, item});
  };
  const saveGeneric = async () => {
    if(!genericModal)return;
    setSaving(true);
    const cfg = TABLE_MAP[genericModal.view];
    if(!cfg){setSaving(false);return;}
    const numFields=["influence","hp","hpMax","ca","livello","for","des","cos","int","sag","car"];
    const obj={...genericVals};
    numFields.forEach(f=>{ if(obj[f]!==undefined) obj[f]=parseInt(obj[f])||0; });
    if(obj.locked!==undefined) obj.locked=obj.locked==="true"||obj.locked===true;
    delete obj.id; delete obj.created_at;
    try {
      if(genericModal.item?.id){
        await supabase.from(cfg.table).update(obj).eq("id",genericModal.item.id);
      } else {
        await supabase.from(cfg.table).insert(obj);
      }
      setGenericModal(null);
      loadAll();
    } catch(e){ alert("Errore: "+e.message); }
    setSaving(false);
  };
  const deleteGeneric = async (v, id) => {
    if(!window.confirm("Eliminare?"))return;
    const cfg = TABLE_MAP[v];
    if(!cfg)return;
    await supabase.from(cfg.table).delete().eq("id",id);
    loadAll();
  };

  const openAdd = () => {
    if(view==="npc") openNpcAdd();
    else if(TABLE_MAP[view]) openGenericAdd();
  };

  const EditBtns = ({v, item}) => isAuth ? <div style={{display:"flex",gap:6,marginTop:10,paddingTop:9,borderTop:`1px solid ${C.border}`}}>
    <Btn onClick={()=>{ if(v==="npc") openNpcEdit(item); else openGenericEdit(v,item); }}>✏ Modifica</Btn>
    <Btn onClick={()=>{ if(v==="npc") deleteNpc(item.id); else deleteGeneric(v,item.id); }}>✕</Btn>
  </div> : null;

  const renderContent=()=>{
    if(loading) return <div style={{textAlign:"center",padding:"60px 20px",color:C.textDim,fontSize:14}}>Caricamento...</div>;

    switch(view){
      case "sessioni": return !data.sessioni.length?<EmptyState msg="Nessuna sessione ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {data.sessioni.map((s,i)=>(
            <div key={s.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:C.goldDim,borderRadius:"12px 0 0 12px"}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.goldDim}}>{s.num?`Sessione ${s.num}`:""}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,margin:"5px 0 7px"}}>{s.title}</div>
              <div style={{fontSize:13,color:C.textDim,lineHeight:1.55,fontStyle:"italic"}}>{s.excerpt}</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>{s.date}</div>
              <EditBtns v="sessioni" item={s}/>
            </div>
          ))}
        </div>;

      case "npc": return !data.npc.length?<EmptyState msg="Nessun NPC ancora"/>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {data.npc.map((n,i)=>(
            <div key={n.id||i} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}} onClick={()=>setNpcOpen(n)}>
              <div style={{width:48,height:48,borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden"}}>
                {n.img_url?<img src={n.img_url} alt={n.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(n.icon||"👤")}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{n.name}</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.role}</div>
                <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>{n.attitude&&<Tag t={n.attitude}/>}{n.stato&&<Tag t={n.stato}/>}</div>
              </div>
              {isAuth&&<div onClick={e=>{e.stopPropagation();}} style={{display:"flex",flexDirection:"column",gap:4}}>
                <Btn onClick={()=>openNpcEdit(n)}>✏</Btn>
                <Btn onClick={()=>deleteNpc(n.id)}>✕</Btn>
              </div>}
            </div>
          ))}
        </div>;

      case "gilda": return <div>
        <div style={{textAlign:"center",padding:"16px 0 24px"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold,textShadow:`0 0 24px ${C.goldGlow}`}}>La Gilda</div>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.textMuted,marginTop:4}}>Fratellanza & Alleanze</div>
        </div>
        {!data.gilda.length?<EmptyState msg="Nessun membro della gilda ancora"/>:data.gilda.map((g,i)=>(
          <div key={g.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.gold}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <div style={{width:44,height:44,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{g.icon||"🏴"}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{g.name}</div>
                {g.rank&&<div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.gold,marginTop:2}}>{g.rank}</div>}
              </div>
            </div>
            {g.sede&&<div style={{fontSize:12,color:C.textDim,marginBottom:6}}>📍 {g.sede}</div>}
            {g.desc&&<div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.55,marginBottom:8}}>{g.desc}</div>}
            {g.influence!=null&&<><div style={{height:3,background:C.bg3,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${g.influence||0}%`,background:`linear-gradient(90deg,${C.goldDim},${C.gold})`}}/></div><div style={{fontSize:10,color:C.textMuted,marginTop:3}}>Potere: {g.influence||0}%</div></>}
            <EditBtns v="gilda" item={g}/>
          </div>
        ))}
      </div>;

      case "fazioni": return !data.fazioni.length?<EmptyState msg="Nessuna fazione ancora"/>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {data.fazioni.map((f,i)=>(
            <div key={f.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,display:"flex",gap:12}}>
              <div style={{width:44,height:44,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.icon||"⚔️"}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{f.name}</div>
                <div style={{fontSize:12,color:C.textDim,fontStyle:"italic",margin:"3px 0 7px",lineHeight:1.5}}>{f.desc}</div>
                <div style={{height:3,background:C.bg3,borderRadius:2,overflow:"hidden",marginTop:6}}><div style={{height:"100%",width:`${f.influence||0}%`,background:`linear-gradient(90deg,${C.goldDim},${C.gold})`}}/></div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>Influenza: {f.influence||0}%</div>
                <EditBtns v="fazioni" item={f}/>
              </div>
            </div>
          ))}
        </div>;

      case "mondo": return !data.mondo.length?<EmptyState msg="Nessun luogo ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
          {data.mondo.map((w,i)=>(
            <div key={w.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{height:76,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,borderBottom:`1px solid ${C.border}`}}>{w.icon||"🌍"}</div>
              <div style={{padding:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:600,color:C.text}}>{w.name}</div>
                <div style={{fontSize:11,color:C.textDim,fontStyle:"italic",marginTop:3,lineHeight:1.4}}>{w.sub}</div>
                <EditBtns v="mondo" item={w}/>
              </div>
            </div>
          ))}
        </div>;

      case "cronologia": return !data.cronologia.length?<EmptyState msg="Nessun evento ancora"/>:
        <div style={{position:"relative",paddingLeft:26}}>
          <div style={{position:"absolute",left:5,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${C.goldDim},transparent)`}}/>
          {data.cronologia.map((c,i)=>(
            <div key={c.id||i} style={{position:"relative",paddingLeft:16,paddingBottom:20}}>
              <div style={{position:"absolute",left:-21,top:5,width:8,height:8,border:`1px solid ${C.goldDim}`,background:C.bg,transform:"rotate(45deg)"}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.goldDim,marginBottom:3}}>{c.date}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.55}}>{c.desc}</div>
              <EditBtns v="cronologia" item={c}/>
            </div>
          ))}
        </div>;

      case "arcano": return !data.arcano.length?<EmptyState msg="Nessun elemento arcano ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {data.arcano.map((a,i)=>(
            <div key={a.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>{a.icon||"✨"}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{a.name}</div>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.goldDim,marginBottom:7}}>{a.school}</div>
              <div style={{fontSize:12,color:C.textDim,fontStyle:"italic",lineHeight:1.5}}>{a.desc}</div>
              <EditBtns v="arcano" item={a}/>
            </div>
          ))}
        </div>;

      case "party": return <EmptyState msg="Nessun personaggio ancora"/>;

      case "tomo": return <div>
        <div style={{textAlign:"center",padding:"16px 0 24px"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold,textShadow:`0 0 24px ${C.goldGlow}`}}>Tomo Segreto</div>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.textMuted,marginTop:4}}>Solo DM</div>
        </div>
        {!data.tomo.length?<EmptyState msg="Nessun segreto ancora"/>:data.tomo.map((t,i)=>(
          <div key={t.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.goldDim}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text,marginBottom:7}}>{t.title}</div>
            {t.locked?<><div style={{fontSize:13,color:C.textDim,fontStyle:"italic"}}>[SIGILLATO]</div><span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:C.goldDim,border:`1px solid ${C.goldDim}`,borderRadius:5,padding:"2px 8px",marginTop:7}}>🔒 Bloccato</span></>:<div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.65}}>{t.text}</div>}
            <EditBtns v="tomo" item={t}/>
          </div>
        ))}
      </div>;

      default: return <EmptyState msg="In costruzione"/>;
    }
  };

  const navItems=[
    {v:"sessioni",icon:"📜",label:"Sessioni"},{v:"npc",icon:"👤",label:"NPC"},
    {v:"mappa",icon:"🗺️",label:"Mappa"},{v:"gilda",icon:"🏴",label:"Gilda"},
    {v:"fazioni",icon:"⚔️",label:"Fazioni"},{v:"mondo",icon:"🌍",label:"Fogli del Mondo"},
    {v:"cronologia",icon:"⏳",label:"Cronologia"},{v:"arcano",icon:"✨",label:"Compendio Arcano"},
    {v:"party",icon:"🛡️",label:"Party"},
  ];

  return <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.bg,color:C.text,fontFamily:"'Inter',sans-serif"}}>
    {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:49,backdropFilter:"blur(3px)"}}/>}

    <aside style={{width:260,background:C.panel,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",position:"fixed",top:0,left:0,bottom:0,zIndex:50,transform:sidebarOpen?"translateX(0)":"translateX(-100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)"}}>
      <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.gold},${C.goldDim})`,boxShadow:`0 0 16px ${C.goldGlow}`,flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:C.text,letterSpacing:".04em"}}>Terre Perdute</div>
            <div style={{fontSize:11,color:C.textMuted,letterSpacing:".08em",marginTop:2}}>DM · Dungeon Master</div>
          </div>
        </div>
      </div>
      <div style={{padding:"14px 0 6px"}}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>La Campagna</div>
        {navItems.map(({v,icon,label})=>(
          <div key={v} onClick={()=>nav(v)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:view===v?500:400,color:view===v?C.gold:C.textDim,background:view===v?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view===v?C.gold:"transparent"}`,userSelect:"none"}}>
            <span style={{fontSize:14,width:18,textAlign:"center"}}>{icon}</span>{label}
          </div>
        ))}
      </div>
      <div style={{height:1,background:C.border,margin:"6px 18px"}}/>
      <div style={{padding:"14px 0 6px"}}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.goldDim,padding:"0 18px 6px"}}>Segreti</div>
        <div onClick={()=>nav("tomo")} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,color:view==="tomo"?C.gold:C.textDim,background:view==="tomo"?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view==="tomo"?C.gold:"transparent"}`}}>
          <span style={{fontSize:14,width:18,textAlign:"center"}}>🔒</span>Tomo Segreto
        </div>
      </div>
    </aside>

    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:`1px solid ${C.border}`,background:C.bg2,gap:10,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"none",border:`1px solid ${C.border2}`,borderRadius:8,color:C.textDim,fontSize:16,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>☰</button>
          <div style={{width:26,height:26,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.gold},${C.goldDim})`,boxShadow:`0 0 10px ${C.goldGlow}`,flexShrink:0}}/>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.gold,letterSpacing:".06em"}}>{TITLES[view]||view}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={toggleDm} style={{fontSize:12,fontWeight:500,padding:"6px 14px",border:`1px solid ${isAuth?C.gold:C.border2}`,borderRadius:8,background:isAuth?C.gold:"transparent",color:isAuth?"#0b1120":C.textDim,cursor:"pointer",boxShadow:isAuth?`0 0 12px ${C.goldGlow}`:"none"}}>
            {isAuth?"🔓 DM":"🔐 DM"}
          </button>
          {TABLE_MAP[view]||view==="npc"?<button onClick={openAdd} style={{fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:8,background:C.gold,color:"#0b1120",border:"none",cursor:"pointer"}}>+ Aggiungi</button>:null}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>{renderContent()}</div>
    </div>

    <NpcPanel npc={npcOpen} onClose={()=>setNpcOpen(null)}/>
    {showPin&&<PinModal onSuccess={()=>{setIsAuth(true);setShowPin(false);}} onClose={()=>setShowPin(false)}/>}
    {npcModal&&<NpcFormModal npc={npcModal?.id?npcModal:null} onClose={()=>setNpcModal(null)} onSaved={()=>{setNpcModal(null);loadAll();}}/>}
    {genericModal&&<GenericModal
      title={genericModal.item?"Modifica":"Aggiungi"}
      fields={TABLE_MAP[genericModal.view]?.fields||[]}
      vals={genericVals}
      onClose={()=>setGenericModal(null)}
      onSave={saveGeneric}
      saving={saving}
      onChange={(id,val)=>setGenericVals(v=>({...v,[id]:val}))}
    />}
  </div>;
}
