import { useState, useCallback } from "react";

const DM_PIN = "1234";

const C = {
  bg:"#0e0b14", bg2:"#13101a", bg3:"#1a1624", bg4:"#201c2e",
  panel:"#110e18", border:"#2a2040", border2:"#332848",
  red:"#c0392b", red2:"#e74c3c", redDim:"#7a1a1a",
  text:"#e8e0f0", textDim:"#8a7fa0", textMuted:"#4a4060",
  green:"#22c55e", yellow:"#eab308",
};

const initialData = {
  sessioni:[], npc:[], fazioni:[], mondo:[], cronologia:[], arcano:[], tomo:[],
  party:[
    {name:"Minerva", sub:"· Livello 1", color:"#c084fc", icon:"🔮", ca:0, livello:1, background:"", hp:0, hpMax:0, for:10, des:10, cos:10, int:10, sag:10, car:10, note:"", inventario:[], incantesimi:[], famigli:""},
    {name:"Talia",   sub:"· Livello 1", color:"#fb923c", icon:"⚔️",  ca:0, livello:1, background:"", hp:0, hpMax:0, for:10, des:10, cos:10, int:10, sag:10, car:10, note:"", inventario:[], incantesimi:[], famigli:""},
  ],
};

const ABILITA = [
  {n:"Acrobazia",s:"des"},{n:"Addestrare animali",s:"sag"},{n:"Arcano",s:"int"},
  {n:"Atletica",s:"for"},{n:"Furtività",s:"des"},{n:"Indagare",s:"int"},
  {n:"Inganno",s:"car"},{n:"Intimidire",s:"car"},{n:"Intuizione",s:"sag"},
  {n:"Medicina",s:"sag"},{n:"Natura",s:"int"},{n:"Percezione",s:"sag"},
  {n:"Performance",s:"car"},{n:"Persuasione",s:"car"},{n:"Rapidità di mano",s:"des"},
  {n:"Religione",s:"int"},{n:"Sopravvivenza",s:"sag"},{n:"Storia",s:"int"},
];

const FIELDS = {
  sessioni:[{id:"num",l:"Numero",ph:"es. I"},{id:"title",l:"Titolo",ph:"Titolo..."},{id:"date",l:"Data",ph:"es. 1 Gen 2025"},{id:"excerpt",l:"Riassunto",ph:"Cosa è successo...",ta:true}],
  npc:[{id:"name",l:"Nome",ph:"Nome"},{id:"role",l:"Ruolo",ph:"es. Mercante"},{id:"icon",l:"Icona",ph:"👤"},{id:"desc",l:"Descrizione",ph:"Chi è?",ta:true},{id:"primo",l:"Primo incontro",ph:"es. Aldermoor"},{id:"img",l:"URL Immagine",ph:"https://..."},{id:"tag",l:"Relazione",sel:["neutrale","alleato","nemico","sconosciuto"]},{id:"stato",l:"Stato",sel:["vivo","morto",""]}],
  fazioni:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"⚔️"},{id:"desc",l:"Descrizione",ph:"...",ta:true},{id:"influence",l:"Influenza %",ph:"0-100"}],
  mondo:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"🏰"},{id:"sub",l:"Descrizione",ph:"...",ta:true}],
  cronologia:[{id:"date",l:"Data",ph:"Anno 1, Giorno X"},{id:"title",l:"Titolo",ph:"Evento..."},{id:"desc",l:"Descrizione",ph:"Cosa accadde...",ta:true}],
  arcano:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"✨"},{id:"school",l:"Scuola",ph:"Proibito"},{id:"desc",l:"Descrizione",ph:"...",ta:true}],
  party:[{id:"name",l:"Nome",ph:"Nome"},{id:"sub",l:"Classe",ph:"Guerriero · Lv 1"},{id:"icon",l:"Icona",ph:"🛡️"},{id:"color",l:"Colore",ph:"#c084fc"},{id:"ca",l:"CA",ph:"15"},{id:"livello",l:"Livello",ph:"1"},{id:"background",l:"Background",ph:"Soldato"},{id:"hp",l:"HP Attuali",ph:"0"},{id:"hpMax",l:"HP Massimi",ph:"10"},{id:"for",l:"Forza",ph:"10"},{id:"des",l:"Destrezza",ph:"10"},{id:"cos",l:"Costituzione",ph:"10"},{id:"int",l:"Intelligenza",ph:"10"},{id:"sag",l:"Saggezza",ph:"10"},{id:"car",l:"Carisma",ph:"10"},{id:"note",l:"Note",ph:"...",ta:true}],
  tomo:[{id:"title",l:"Titolo",ph:"Segreto..."},{id:"text",l:"Contenuto",ph:"...",ta:true},{id:"locked",l:"Bloccato?",sel:["false","true"]}],
};

const mod = v => Math.floor(((v||10)-10)/2);
const fmtMod = v => (v>=0?"+":"")+v;
const tagColor = t => ({
  alleato:{border:"#166534",color:"#4ade80"},
  neutrale:{border:"#713f12",color:"#fbbf24"},
  nemico:{border:"#7f1d1d",color:"#f87171"},
  sconosciuto:{border:"#1e3a5f",color:"#60a5fa"},
  vivo:{border:"#166534",color:"#4ade80"},
  morto:{border:"#7f1d1d",color:"#f87171"},
}[t]||{border:C.border2,color:C.textDim});

function Tag({t}){
  const s=tagColor(t);
  return <span style={{fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",padding:"2px 8px",border:`1px solid ${s.border}`,borderRadius:5,color:s.color}}>{t}</span>;
}

function Btn({children,onClick,style={},primary=false}){
  return <button onClick={onClick} style={{fontFamily:"inherit",fontSize:12,fontWeight:600,padding:"7px 14px",borderRadius:8,border:primary?"none":`1px solid ${C.border2}`,background:primary?C.red:"transparent",color:primary?"#fff":C.textDim,cursor:"pointer",...style}}>{children}</button>;
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

function Modal({title,onClose,onSave,children}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:500,width:"92%",maxHeight:"88vh",overflowY:"auto",boxShadow:`0 0 40px rgba(192,57,43,.12)`}}>
      <div style={{padding:"18px 20px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>{title}</span>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:C.textDim,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{padding:"18px 20px"}}>{children}</div>
      <div style={{padding:"12px 20px 18px",display:"flex",gap:8,justifyContent:"flex-end",borderTop:`1px solid ${C.border}`}}>
        <Btn onClick={onClose}>Annulla</Btn>
        <Btn onClick={onSave} primary>Salva</Btn>
      </div>
    </div>
  </div>;
}

function FormFields({fields,vals,onChange}){
  const inp = {width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4};
  return <>{fields.map(f=>(
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
  ))}</>;
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
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,width:280,padding:"20px 20px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.red2}}>🔐 Accesso DM</span>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:C.textDim,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"0 0 16px"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",border:`2px solid ${i<val.length?C.red2:C.border2}`,background:i<val.length?C.red2:"transparent",transition:"all .15s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,maxWidth:210,margin:"0 auto"}}>
        {["1","2","3","4","5","6","7","8","9","CLR","0","⌫"].map(k=>(
          <button key={k} onClick={()=>k==="CLR"?setVal(""):k==="⌫"?setVal(v=>v.slice(0,-1)):press(k)}
            style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:k.length>1?11:18,fontWeight:500,padding:"13px 0",cursor:"pointer"}}>
            {k}
          </button>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,fontWeight:600,color:C.red2,marginTop:8,minHeight:16}}>{err}</div>
    </div>
  </div>;
}

function NpcPanel({npc,onClose}){
  if(!npc)return null;
  return <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)"}}/>
    <div style={{position:"relative",background:C.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${C.border2}`,width:"100%",maxWidth:640,maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px 12px"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.red2}}>{npc.name}</span>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{textAlign:"center",padding:"0 0 14px",color:C.redDim,fontSize:12}}>✦</div>
      <div style={{padding:"0 20px 16px"}}>
        {npc.img
          ? <img src={npc.img} alt={npc.name} style={{width:"100%",borderRadius:12,border:`1px solid ${C.border2}`,maxHeight:340,objectFit:"cover",display:"block"}}/>
          : <div style={{width:"100%",height:200,background:C.bg3,borderRadius:12,border:`1px solid ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>{npc.icon||"👤"}</div>
        }
      </div>
      <div style={{padding:"0 20px 32px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {npc.tag&&<Tag t={npc.tag}/>}{npc.stato&&<Tag t={npc.stato}/>}
        </div>
        {npc.role&&<div style={{fontSize:13,color:C.textDim,marginBottom:6,fontStyle:"italic"}}>{npc.role}</div>}
        {npc.primo&&<div style={{fontSize:13,marginBottom:14}}><strong>Primo incontro:</strong> <span style={{color:C.red2}}>{npc.primo}</span></div>}
        {npc.desc&&<div style={{fontSize:15,color:C.text,lineHeight:1.75}}>{npc.desc}</div>}
      </div>
    </div>
  </div>;
}

function CharSheet({p,idx,isAuth,onEdit,onHpChange}){
  const [tab,setTab]=useState("scheda");
  const tabs=["scheda","incantesimi","inventario","famigli","note session"];
  const hpPct=p.hpMax>0?Math.max(0,Math.min(100,(p.hp/p.hpMax)*100)):0;
  const hpColor=hpPct>60?C.green:hpPct>25?C.yellow:C.red2;

  const statBox=(lbl,val,sub)=>(
    <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:C.textDim}}>{lbl}</div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:sub?16:22,fontWeight:700,color:C.text,marginTop:3}}>{val}</div>
      {sub&&<div style={{fontSize:12,fontWeight:600,color:C.red2}}>{sub}</div>}
    </div>
  );

  return <div style={{maxWidth:520,margin:"0 auto"}}>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
      <div style={{width:72,height:72,borderRadius:"50%",border:`3px solid ${p.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,background:C.bg3,flexShrink:0}}>{p.icon||"🛡️"}</div>
      <div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text}}>{p.name}</div>
        <div style={{fontSize:13,color:C.textDim,marginTop:3}}>{p.sub}</div>
      </div>
    </div>

    <div style={{display:"flex",gap:2,background:C.bg3,borderRadius:10,padding:3,marginBottom:16,overflowX:"auto"}}>
      {tabs.map(t=>(
        <button key={t} onClick={()=>setTab(t)} style={{fontSize:12,fontWeight:tab===t?600:400,padding:"7px 13px",borderRadius:8,border:"none",background:tab===t?C.red:"transparent",color:tab===t?"#fff":C.textDim,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
          {t}
        </button>
      ))}
    </div>

    {tab==="scheda"&&<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {statBox("CA",p.ca||0)}
        {statBox("Livello",p.livello||1)}
        <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:C.textDim}}>Background</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:C.text,marginTop:5}}>{p.background||"—"}</div>
        </div>
      </div>

      <Card style={{marginBottom:12}}>
        <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>Punti Ferita</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>onHpChange(idx,-1)} style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${C.red}`,background:"transparent",color:C.red,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 14px",minWidth:60,textAlign:"center"}}>{p.hp}</div>
          <div style={{fontSize:13,color:C.textDim}}>/ {p.hpMax}</div>
          <button onClick={()=>onHpChange(idx,1)} style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${C.green}`,background:"transparent",color:C.green,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginLeft:"auto"}}>+</button>
        </div>
        <div style={{height:6,background:C.bg4,borderRadius:3,overflow:"hidden",marginTop:10}}>
          <div style={{height:"100%",width:`${hpPct}%`,background:hpColor,borderRadius:3,transition:"width .3s"}}/>
        </div>
      </Card>

      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.red2,marginBottom:10}}>Caratteristiche</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
          {["for","des","cos","int","sag","car"].map(s=>(
            <div key={s} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>{s.toUpperCase()}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,margin:"3px 0"}}>{p[s]||10}</div>
              <div style={{fontSize:11,fontWeight:600,color:C.red2}}>{fmtMod(mod(p[s]||10))}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.red2,marginBottom:10,display:"flex",justifyContent:"space-between"}}>
          <span>Abilità</span>
          <span style={{fontWeight:400,color:C.textMuted}}>comp +{Math.ceil((p.livello||1)/4)+1}</span>
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

    {tab==="inventario"&&<Card>{p.inventario?.length
      ? p.inventario.map((x,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:14}}>{x.name}</span><span style={{fontSize:12,color:C.textDim}}>{x.detail}</span></div>)
      : <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Inventario vuoto</div>
    }</Card>}

    {tab==="incantesimi"&&<Card>{p.incantesimi?.length
      ? p.incantesimi.map((x,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:14}}>{x.name}</span><span style={{fontSize:12,color:C.textDim}}>{x.detail}</span></div>)
      : <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessun incantesimo</div>
    }</Card>}

    {tab==="famigli"&&<Card>{p.famigli
      ? <div style={{fontSize:14,color:C.textDim,lineHeight:1.75,fontStyle:"italic"}}>{p.famigli}</div>
      : <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessun famiglio</div>
    }</Card>}

    {tab==="note session"&&<Card>{p.note
      ? <div style={{fontSize:14,color:C.textDim,lineHeight:1.75,fontStyle:"italic"}}>{p.note}</div>
      : <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessuna nota</div>
    }</Card>}

    {isAuth&&<div style={{display:"flex",gap:6,marginTop:12,justifyContent:"center"}}>
      <Btn onClick={()=>onEdit("party",idx)}>✏ Modifica</Btn>
    </div>}
  </div>;
}

export default function App(){
  const [data,setData]=useState(initialData);
  const [view,setView]=useState("mondo");
  const [isAuth,setIsAuth]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [showPin,setShowPin]=useState(false);
  const [npcOpen,setNpcOpen]=useState(null);
  const [modal,setModal]=useState(null);

  const TITLES={sessioni:"Sessioni",npc:"NPC",mappa:"Mappa",fazioni:"Fazioni",mondo:"Fogli del Mondo",cronologia:"Cronologia",arcano:"Compendio Arcano",party:"Party",tomo:"Tomo Segreto",minerva:"Minerva",talia:"Talia"};

  const nav=(v)=>{setView(v);setSidebarOpen(false);};
  const toggleDm=()=>{ if(isAuth){setIsAuth(false);}else{setShowPin(true);} };

  const adjustHp=(idx,delta)=>{
    setData(d=>{
      const party=[...d.party];
      party[idx]={...party[idx],hp:Math.max(0,Math.min(party[idx].hpMax||999,party[idx].hp+delta))};
      return {...d,party};
    });
  };

  const openEdit=(v,idx)=>{
    const obj=idx!=null?{...data[v][idx]}:{};
    setModal({view:v,idx,vals:obj});
  };

  const openAdd=()=>{ if(!isAuth){setShowPin(true);return;} openEdit(view,null); };

  const saveModal=()=>{
    const {view:v,idx,vals}=modal;
    const numFields=["influence","hp","hpMax","ca","livello","for","des","cos","int","sag","car"];
    const obj={...vals};
    numFields.forEach(f=>{ if(obj[f]!==undefined) obj[f]=parseInt(obj[f])||0; });
    if(obj.locked!==undefined) obj.locked=obj.locked==="true"||obj.locked===true;
    setData(d=>{
      const arr=[...d[v]];
      if(idx!=null) arr[idx]={...arr[idx],...obj};
      else arr.push(obj);
      return {...d,[v]:arr};
    });
    setModal(null);
  };

  const delItem=(v,idx)=>{
    if(!window.confirm("Eliminare?"))return;
    setData(d=>({...d,[v]:d[v].filter((_,i)=>i!==idx)}));
  };

  const EditBtns=({v,idx})=>isAuth?<div style={{display:"flex",gap:6,marginTop:10,paddingTop:9,borderTop:`1px solid ${C.border}`}}>
    <Btn onClick={()=>openEdit(v,idx)}>✏ Modifica</Btn>
    <Btn onClick={()=>delItem(v,idx)}>✕</Btn>
  </div>:null;

  const renderContent=()=>{
    switch(view){
      case "sessioni": return !data.sessioni.length?<EmptyState msg="Nessuna sessione ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {data.sessioni.map((s,i)=>(
            <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:C.redDim,borderRadius:"12px 0 0 12px"}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.redDim}}>{s.num?`Sessione ${s.num}`:""}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,margin:"5px 0 7px"}}>{s.title}</div>
              <div style={{fontSize:13,color:C.textDim,lineHeight:1.55,fontStyle:"italic"}}>{s.excerpt}</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>{s.date}</div>
              <EditBtns v="sessioni" idx={i}/>
            </div>
          ))}
        </div>;

      case "npc": return !data.npc.length?<EmptyState msg="Nessun NPC ancora"/>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {data.npc.map((n,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}} onClick={()=>setNpcOpen(n)}>
              <div style={{width:48,height:48,borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden"}}>
                {n.img?<img src={n.img} alt={n.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(n.icon||"👤")}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{n.name}</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.role}</div>
                <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                  {n.tag&&<Tag t={n.tag}/>}{n.stato&&<Tag t={n.stato}/>}
                </div>
              </div>
              {isAuth&&<div onClick={e=>{e.stopPropagation();}} style={{display:"flex",flexDirection:"column",gap:4}}>
                <Btn onClick={()=>openEdit("npc",i)}>✏</Btn>
                <Btn onClick={()=>delItem("npc",i)}>✕</Btn>
              </div>}
            </div>
          ))}
        </div>;

      case "mappa": return <div>
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,height:420,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.textMuted}}>Carica mappa personalizzata</div>
        </div>
        {isAuth&&<div style={{marginTop:10}}><Btn onClick={openAdd} primary>+ Aggiungi Luogo</Btn></div>}
      </div>;

      case "fazioni": return !data.fazioni.length?<EmptyState msg="Nessuna fazione ancora"/>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {data.fazioni.map((f,i)=>(
            <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,display:"flex",gap:12}}>
              <div style={{width:44,height:44,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.icon||"⚔️"}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{f.name}</div>
                <div style={{fontSize:12,color:C.textDim,fontStyle:"italic",margin:"3px 0 7px",lineHeight:1.5}}>{f.desc}</div>
                <div style={{height:3,background:C.bg3,borderRadius:2,overflow:"hidden",marginTop:6}}>
                  <div style={{height:"100%",width:`${f.influence||0}%`,background:`linear-gradient(90deg,${C.redDim},${C.red2})`}}/>
                </div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>Influenza: {f.influence||0}%</div>
                <EditBtns v="fazioni" idx={i}/>
              </div>
            </div>
          ))}
        </div>;

      case "mondo": return !data.mondo.length?<EmptyState msg="Nessun luogo ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
          {data.mondo.map((w,i)=>(
            <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{height:76,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,borderBottom:`1px solid ${C.border}`}}>{w.icon||"🌍"}</div>
              <div style={{padding:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:600,color:C.text}}>{w.name}</div>
                <div style={{fontSize:11,color:C.textDim,fontStyle:"italic",marginTop:3,lineHeight:1.4}}>{w.sub}</div>
                <EditBtns v="mondo" idx={i}/>
              </div>
            </div>
          ))}
        </div>;

      case "cronologia": return !data.cronologia.length?<EmptyState msg="Nessun evento ancora"/>:
        <div style={{position:"relative",paddingLeft:26}}>
          <div style={{position:"absolute",left:5,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${C.redDim},transparent)`}}/>
          {data.cronologia.map((c,i)=>(
            <div key={i} style={{position:"relative",paddingLeft:16,paddingBottom:20}}>
              <div style={{position:"absolute",left:-21,top:5,width:8,height:8,border:`1px solid ${C.redDim}`,background:C.bg,transform:"rotate(45deg)"}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.redDim,marginBottom:3}}>{c.date}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.55}}>{c.desc}</div>
              <EditBtns v="cronologia" idx={i}/>
            </div>
          ))}
        </div>;

      case "arcano": return !data.arcano.length?<EmptyState msg="Nessun elemento arcano ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
          {data.arcano.map((a,i)=>(
            <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>{a.icon||"✨"}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{a.name}</div>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.redDim,marginBottom:7}}>{a.school}</div>
              <div style={{fontSize:12,color:C.textDim,fontStyle:"italic",lineHeight:1.5}}>{a.desc}</div>
              <EditBtns v="arcano" idx={i}/>
            </div>
          ))}
        </div>;

      case "party": return <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {data.party.map((p,i)=>(
          <div key={i} onClick={()=>nav(p.name.toLowerCase())} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}}>
            <div style={{width:44,height:44,borderRadius:"50%",border:`2px solid ${p.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,background:C.bg3,flexShrink:0}}>{p.icon||"🛡️"}</div>
            <div><div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{p.name}</div><div style={{fontSize:12,color:C.textDim,marginTop:2}}>{p.sub}</div></div>
            <div style={{marginLeft:"auto",fontSize:12,fontWeight:600,color:p.color}}>HP {p.hp}/{p.hpMax}</div>
          </div>
        ))}
      </div>;

      case "tomo": return <div>
        <div style={{textAlign:"center",padding:"16px 0 24px"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.red2,textShadow:`0 0 24px rgba(192,57,43,.4)`}}>Tomo Segreto</div>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.textMuted,marginTop:4}}>Solo DM</div>
        </div>
        {!data.tomo.length?<EmptyState msg="Nessun segreto ancora"/>:data.tomo.map((t,i)=>(
          <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.redDim}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text,marginBottom:7}}>{t.title}</div>
            {t.locked?<><div style={{fontSize:13,color:C.textDim,fontStyle:"italic"}}>[SIGILLATO]</div><span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:C.redDim,border:`1px solid ${C.redDim}`,borderRadius:5,padding:"2px 8px",marginTop:7}}>🔒 Bloccato</span></>
              :<div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.65}}>{t.text}</div>}
            <EditBtns v="tomo" idx={i}/>
          </div>
        ))}
      </div>;

      case "minerva": { const i=data.party.findIndex(p=>p.name.toLowerCase()==="minerva"); return i>=0?<CharSheet p={data.party[i]} idx={i} isAuth={isAuth} onEdit={openEdit} onHpChange={adjustHp}/>:<EmptyState msg="Personaggio non trovato"/>; }
      case "talia":   { const i=data.party.findIndex(p=>p.name.toLowerCase()==="talia");   return i>=0?<CharSheet p={data.party[i]} idx={i} isAuth={isAuth} onEdit={openEdit} onHpChange={adjustHp}/>:<EmptyState msg="Personaggio non trovato"/>; }
      default: return <EmptyState msg="In costruzione"/>;
    }
  };

  const navItems=[
    {v:"sessioni",icon:"📜",label:"Sessioni"},{v:"npc",icon:"👤",label:"NPC"},
    {v:"mappa",icon:"🗺️",label:"Mappa"},{v:"fazioni",icon:"⚔️",label:"Fazioni"},
    {v:"mondo",icon:"🌍",label:"Fogli del Mondo"},{v:"cronologia",icon:"⏳",label:"Cronologia"},
    {v:"arcano",icon:"✨",label:"Compendio Arcano"},{v:"party",icon:"🛡️",label:"Party"},
  ];

  return <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.bg,color:C.text,fontFamily:"'Inter',sans-serif"}}>

    {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:49,backdropFilter:"blur(3px)"}}/>}

    <aside style={{width:260,background:C.panel,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",position:"fixed",top:0,left:0,bottom:0,zIndex:50,transform:sidebarOpen?"translateX(0)":"translateX(-100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)"}}>
      <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.red2},${C.redDim})`,boxShadow:`0 0 16px rgba(192,57,43,.4)`,flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:C.text,letterSpacing:".04em"}}>Terre Perdute</div>
            <div style={{fontSize:11,color:C.textMuted,letterSpacing:".08em",marginTop:2}}>DM · Dungeon Master</div>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 0 6px"}}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>La Campagna</div>
        {navItems.map(({v,icon,label})=>(
          <div key={v} onClick={()=>nav(v)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:view===v?500:400,color:view===v?C.red2:C.textDim,background:view===v?`rgba(192,57,43,.1)`:"transparent",borderLeft:`2px solid ${view===v?C.red:"transparent"}`,userSelect:"none"}}>
            <span style={{fontSize:14,width:18,textAlign:"center"}}>{icon}</span>{label}
          </div>
        ))}
      </div>

      <div style={{height:1,background:C.border,margin:"6px 18px"}}/>
      <div style={{padding:"14px 0 6px"}}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.redDim,padding:"0 18px 6px"}}>Segreti</div>
        <div onClick={()=>nav("tomo")} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,color:view==="tomo"?C.red2:C.textDim,background:view==="tomo"?`rgba(192,57,43,.1)`:"transparent",borderLeft:`2px solid ${view==="tomo"?C.red:"transparent"}`}}>
          <span style={{fontSize:14,width:18,textAlign:"center"}}>🔒</span>Tomo Segreto
        </div>
      </div>

      <div style={{height:1,background:C.border,margin:"6px 18px"}}/>
      <div style={{padding:"14px 0 6px"}}>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>La Compagnia</div>
        {[{v:"minerva",color:"#c084fc",label:"Minerva"},{v:"talia",color:"#fb923c",label:"Talia"}].map(({v,color,label})=>(
          <div key={v} onClick={()=>nav(v)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,color:view===v?C.red2:C.textDim,background:view===v?`rgba(192,57,43,.1)`:"transparent",borderLeft:`2px solid ${view===v?C.red:"transparent"}`}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0,display:"inline-block"}}/>
            {label}
          </div>
        ))}
      </div>
    </aside>

    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",marginLeft:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:`1px solid ${C.border}`,background:C.bg2,gap:10,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"none",border:`1px solid ${C.border2}`,borderRadius:8,color:C.textDim,fontSize:16,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>☰</button>
          <div style={{width:26,height:26,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.red2},${C.redDim})`,boxShadow:`0 0 10px rgba(192,57,43,.4)`,flexShrink:0}}/>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.red2,letterSpacing:".06em"}}>{TITLES[view]||view}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={toggleDm} style={{fontSize:12,fontWeight:500,padding:"6px 14px",border:`1px solid ${isAuth?C.red:C.border2}`,borderRadius:8,background:isAuth?C.red:"transparent",color:isAuth?"#fff":C.textDim,cursor:"pointer",boxShadow:isAuth?`0 0 12px rgba(192,57,43,.4)`:"none"}}>
            {isAuth?"🔓 DM":"🔐 DM"}
          </button>
          <button onClick={openAdd} style={{fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:8,background:C.red,color:"#fff",border:"none",cursor:"pointer"}}>+ Aggiungi</button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {renderContent()}
      </div>
    </div>

    <NpcPanel npc={npcOpen} onClose={()=>setNpcOpen(null)}/>
    {showPin&&<PinModal onSuccess={()=>{setIsAuth(true);setShowPin(false);}} onClose={()=>setShowPin(false)}/>}
    {modal&&<Modal title={modal.idx!=null?"Modifica":"Aggiungi"} onClose={()=>setModal(null)} onSave={saveModal}>
      <FormFields fields={FIELDS[modal.view]||[{id:"name",l:"Nome",ph:""},{id:"desc",l:"Descrizione",ph:"",ta:true}]} vals={modal.vals} onChange={(id,val)=>setModal(m=>({...m,vals:{...m.vals,[id]:val}}))}/>
    </Modal>}
  </div>;
}
