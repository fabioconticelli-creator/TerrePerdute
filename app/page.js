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
  {n:"Acrobazia",s:"dex"},{n:"Addestrare animali",s:"wis"},{n:"Arcano",s:"int"},
  {n:"Atletica",s:"str"},{n:"Furtività",s:"dex"},{n:"Indagare",s:"int"},
  {n:"Inganno",s:"cha"},{n:"Intimidire",s:"cha"},{n:"Intuizione",s:"wis"},
  {n:"Medicina",s:"wis"},{n:"Natura",s:"int"},{n:"Percezione",s:"wis"},
  {n:"Performance",s:"cha"},{n:"Persuasione",s:"cha"},{n:"Rapidità di mano",s:"dex"},
  {n:"Religione",s:"int"},{n:"Sopravvivenza",s:"wis"},{n:"Storia",s:"int"},
];

const mod = v => Math.floor(((v||10)-10)/2);
const fmtMod = v => (v>=0?"+":"")+v;
const partyIcon = name => {
  const n=(name||"").toLowerCase();
  if(n.includes("kassandra"))return "🛡️";
  if(n.includes("taipan"))return "🐍";
  if(n.includes("vaelor"))return "🍃";
  if(n.includes("lobdlin")||n.includes("lobdi"))return "🕊️";
  return "⚔️";
};
const formatLongText = text => {
  if(!text) return [];
  const re=/((?:\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*)?([A-ZÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜ]{4,}(?:\s[A-ZÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜ]{4,})*)\s*/gu;
  const matches=[...text.matchAll(re)];
  if(matches.length===0)return [{type:"p",text}];
  const blocks=[];
  const intro=text.slice(0,matches[0].index).trim();
  if(intro)blocks.push({type:"p",text:intro});
  for(let i=0;i<matches.length;i++){
    const m=matches[i];
    const header=m[2];
    const emoji=(m[1]||"").trim();
    const start=m.index+m[0].length;
    const end=i+1<matches.length?matches[i+1].index:text.length;
    const body=text.slice(start,end).trim();
    blocks.push({type:"h",header,emoji});
    if(body)blocks.push({type:"p",text:body});
  }
  return blocks;
};
const LongText = ({text,style={}}) => !text?null:<>
  {formatLongText(text).map((b,i)=>b.type==="h"
    ?<div key={i} style={{fontSize:11,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.gold,marginTop:i===0?0:16,marginBottom:6}}>{b.emoji?b.emoji+" ":""}{b.header}</div>
    :<div key={i} style={{fontSize:15,color:C.text,lineHeight:1.75,marginBottom:8,...style}}>{b.text}</div>
  )}
</>;
const RulesText = ({text}) => {
  if(!text) return null;
  const blocks=[];
  let bulletBuf=[];
  const flushBullets=()=>{ if(bulletBuf.length){blocks.push({type:"ul",items:bulletBuf});bulletBuf=[];} };
  text.split("\n").forEach(raw=>{
    const line=raw.trim();
    if(!line){flushBullets();return;}
    if(line.startsWith("*")||line.startsWith("-")){
      bulletBuf.push(line.replace(/^[-*]\s*/,""));
    }else{
      flushBullets();
      const isHeader=line.length<70&&!/[.!?%]$/.test(line);
      blocks.push({type:isHeader?"h":"p",text:line});
    }
  });
  flushBullets();
  return <>
    {blocks.map((b,i)=>{
      if(b.type==="h")return <div key={i} style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:C.gold,marginTop:i===0?0:18,marginBottom:6}}>{b.text}</div>;
      if(b.type==="ul")return <ul key={i} style={{margin:"4px 0 12px",paddingLeft:20,color:C.text,fontSize:14,lineHeight:1.7}}>{b.items.map((it,j)=><li key={j} style={{marginBottom:3}}>{it}</li>)}</ul>;
      return <div key={i} style={{fontSize:14,color:C.text,lineHeight:1.7,marginBottom:8}}>{b.text}</div>;
    })}
  </>;
};
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

// ── LOGIN SCREEN ──
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("choose"); // choose | dm | player
  const [pin,setPin]=useState("");
  const [pinErr,setPinErr]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loginErr,setLoginErr]=useState("");
  const [loading,setLoading]=useState(false);

  const pressPin = d => {
    if(pin.length>=4)return;
    const next=pin+d;
    setPin(next);
    if(next.length===4){
      setTimeout(()=>{
        if(next===DM_PIN){ onLogin({role:"dm",name:"DM"}); }
        else{ setPinErr("PIN errato"); setPin(""); }
      },80);
    }
  };

  const loginPlayer = async () => {
    setLoading(true); setLoginErr("");
    const {data,error} = await supabase.auth.signInWithPassword({email,password});
    if(error){ setLoginErr("Email o password errati"); setLoading(false); return; }
    const {data:profile} = await supabase.from("profiles").select("*").eq("id",data.user.id).single();
    if(!profile){ setLoginErr("Profilo non trovato"); setLoading(false); return; }
    onLogin({role:"player", name:profile.character_name, email, userId:data.user.id, profile});
    setLoading(false);
  };

  const inp = {width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:15,padding:"10px 14px",outline:"none",boxSizing:"border-box",marginTop:6};

  if(mode==="choose") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:340,width:"92%"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.gold},${C.goldDim})`,boxShadow:`0 0 32px ${C.goldGlow}`,margin:"0 auto 20px"}}/>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:26,fontWeight:700,color:C.gold,marginBottom:6}}>Terre Perdute</div>
        <div style={{fontSize:12,color:C.textMuted,letterSpacing:".15em",textTransform:"uppercase",marginBottom:40}}>Chi sei?</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <button onClick={()=>setMode("dm")} style={{background:C.gold,color:"#0b1120",fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,padding:"14px",borderRadius:12,border:"none",cursor:"pointer",letterSpacing:".05em"}}>🔐 Dungeon Master</button>
          <button onClick={()=>setMode("player")} style={{background:C.bg2,color:C.text,fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,padding:"14px",borderRadius:12,border:`1px solid ${C.border2}`,cursor:"pointer",letterSpacing:".05em"}}>⚔️ Avventuriero</button>
        </div>
      </div>
    </div>
  );

  if(mode==="dm") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,width:280,padding:"24px 20px",boxShadow:`0 0 32px ${C.goldGlow}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold}}>🔐 PIN Dungeon Master</span>
          <button onClick={()=>setMode("choose")} style={{background:"none",border:"none",fontSize:18,color:C.textDim,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center",margin:"0 0 20px"}}>
          {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${i<pin.length?C.gold:C.border2}`,background:i<pin.length?C.gold:"transparent",transition:"all .15s"}}/>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,maxWidth:210,margin:"0 auto"}}>
          {["1","2","3","4","5","6","7","8","9","CLR","0","⌫"].map(k=>(
            <button key={k} onClick={()=>k==="CLR"?setPin(""):k==="⌫"?setPin(v=>v.slice(0,-1)):pressPin(k)}
              style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:k.length>1?11:18,fontWeight:500,padding:"13px 0",cursor:"pointer"}}>{k}</button>
          ))}
        </div>
        <div style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#f87171",marginTop:10,minHeight:16}}>{pinErr}</div>
      </div>
    </div>
  );

  if(mode==="player") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:340,width:"92%",padding:"24px 20px",boxShadow:`0 0 32px ${C.goldGlow}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold}}>⚔️ Accesso Avventuriero</span>
          <button onClick={()=>setMode("choose")} style={{background:"none",border:"none",fontSize:18,color:C.textDim,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="es. fredys@tp.com" style={inp}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim}}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loginPlayer()} placeholder="••••••••" style={inp}/>
        </div>
        {loginErr&&<div style={{fontSize:12,color:"#f87171",marginBottom:12,textAlign:"center"}}>{loginErr}</div>}
        <button onClick={loginPlayer} disabled={loading} style={{width:"100%",background:C.gold,color:"#0b1120",fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,padding:"12px",borderRadius:10,border:"none",cursor:loading?"not-allowed":"pointer",opacity:loading?.6:1}}>
          {loading?"Accesso...":"Entra"}
        </button>
      </div>
    </div>
  );
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
        {npc.img_url?<img src={npc.img_url} alt={npc.name} style={{width:"100%",maxHeight:480,borderRadius:12,border:`2px solid ${C.gold}`,objectFit:"contain",background:C.bg3,display:"block"}}/>
          :<div style={{width:"100%",height:200,background:C.bg3,borderRadius:12,border:`1px solid ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>{npc.icon||"👤"}</div>}
      </div>
      <div style={{padding:"0 20px 32px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {npc.attitude&&<Tag t={npc.attitude}/>}{npc.stato&&<Tag t={npc.stato}/>}
        </div>
        {npc.role&&<div style={{fontSize:13,color:C.textDim,marginBottom:6,fontStyle:"italic"}}>{npc.role}</div>}
        {npc.sede&&<div style={{fontSize:13,marginBottom:6}}>📍 <span style={{color:C.gold}}>{npc.sede}</span></div>}
        {npc.primo_incontro&&<div style={{fontSize:13,marginBottom:14}}><strong>Primo incontro:</strong> <span style={{color:C.gold}}>{npc.primo_incontro}</span></div>}
        {npc.description&&<LongText text={npc.description}/>}
        {npc.influence!=null&&npc.grado&&<div style={{marginTop:14}}>
          <div style={{height:4,background:"#101827",borderRadius:2,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${npc.influence||0}%`,background:"linear-gradient(90deg,#7a5c00,#d4a017)"}}/></div>
          <div style={{fontSize:11,color:"#8a8070"}}>Fama: {npc.influence||0}%</div>
        </div>}
      </div>
    </div>
  </div>;
}

// ── PLAYER VIEW ──
function PlayerView({user, onLogout}){
  const [char, setChar] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("scheda");
  const [editing, setEditing] = useState(false);
  const [editVals, setEditVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [invModal, setInvModal] = useState(null);
  const [invVals, setInvVals] = useState({});
  const [noteModal, setNoteModal] = useState(null);
  const [noteVals, setNoteVals] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState("scheda");
  const [campData, setCampData] = useState({sessioni:[],npc:[],gilda:[],fazioni:[],mondo:[],cronologia:[],map_pins:[],map_config:null,guild_rules:null});
  const [npcOpen, setNpcOpen] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedCompagno, setSelectedCompagno] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const charTabs = ["scheda","inventario","famigli","note sessione"];

  const load = async () => {
    const [charRes, invRes, notesRes, npcs, sessions, factions, locations, timeline, map_pins, map_config, bestiary, mercatoRes2, guildRulesRes] = await Promise.all([
      supabase.from("player_characters").select("*").eq("player_id", user.userId).maybeSingle(),
      supabase.from("player_inventory").select("*").eq("player_id", user.userId).order("created_at"),
      supabase.from("player_session_notes").select("*").eq("player_id", user.userId).order("created_at",{ascending:false}),
      supabase.from("npcs").select("*").order("created_at",{ascending:false}),
      supabase.from("sessions").select("*").order("created_at",{ascending:false}),
      supabase.from("factions").select("*").order("created_at",{ascending:false}),
      supabase.from("locations").select("*").order("created_at",{ascending:false}),
      supabase.from("timeline").select("*").order("created_at",{ascending:false}),
      supabase.from("map_pins").select("*").order("created_at",{ascending:false}),
      supabase.from("map_config").select("*").order("id"),
        supabase.from("bestiary").select("*").order("name"),
        supabase.from("mercato").select("*").order("name"),
        supabase.from("guild_rules").select("*").limit(1),
    ]);
    if(charRes.data){
      const c = charRes.data;
      if(typeof c.attacks==="string") try{c.attacks=JSON.parse(c.attacks);}catch(e){c.attacks=[];}
      if(!Array.isArray(c.attacks)) c.attacks=[];
      if(typeof c.spell_slots==="string") try{c.spell_slots=JSON.parse(c.spell_slots);}catch(e){c.spell_slots={};}
      if(typeof c.coins==="string") try{c.coins=JSON.parse(c.coins);}catch(e){c.coins={};}
      if(typeof c.potions==="string") try{c.potions=JSON.parse(c.potions);}catch(e){c.potions={};}
      setChar(c); setAvatarPreview(c.avatar_url||"");
    }
    setInventory(invRes.data||[]);
    setSessionNotes(notesRes.data||[]);
    setCampData({
      sessioni:sessions.data||[], npc:npcs.data||[], gilda:(factions.data||[]).filter(f=>f.tipo==="gilda"),
      fazioni:(factions.data||[]).filter(f=>f.tipo!=="gilda"), mondo:locations.data||[], cronologia:timeline.data||[],
      map_pins:map_pins.data||[], map_config:map_config.data?.[0]||null,
      bestiario:bestiary.data||[],
      mercato:mercatoRes2.data||[],
      guild_rules:guildRulesRes.data?.[0]||null,
    });
    const playersRes = await supabase.from("player_characters").select("*").order("name");
    const parsed = (playersRes.data||[]).map(p=>{
      if(typeof p.attacks==="string")try{p.attacks=JSON.parse(p.attacks);}catch(e){p.attacks=[];}
      if(!Array.isArray(p.attacks))p.attacks=[];
      if(typeof p.spell_slots==="string")try{p.spell_slots=JSON.parse(p.spell_slots);}catch(e){p.spell_slots={};}
      return p;
    });
    setAllPlayers(parsed);
    setLoading(false);
  };

  useEffect(()=>{ load(); },[user.userId]);

  const saveChar = async () => {
    setSaving(true);
    try {
      let avatarUrl = editVals.avatar_url || char?.avatar_url || "";
      if(avatarFile){
        const ext=avatarFile.name.split(".").pop();
        const path=`avatars/${user.userId}.${ext}`;
        const {error:upErr}=await supabase.storage.from("npc-images").upload(path,avatarFile,{upsert:true});
        if(!upErr){ const {data:urlData}=supabase.storage.from("npc-images").getPublicUrl(path); avatarUrl=urlData.publicUrl; }
      }
      const numFields=["level","hp","max_hp","ac","str","dex","con","int","wis","cha","prof_bonus"];
      const obj={...editVals,avatar_url:avatarUrl};
      numFields.forEach(f=>{if(obj[f]!==undefined)obj[f]=parseInt(obj[f])||0;});
      delete obj.id; delete obj.created_at; delete obj.player_id;
      if(char?.id){ await supabase.from("player_characters").update(obj).eq("id",char.id); }
      else{ await supabase.from("player_characters").insert({...obj,player_id:user.userId}); }
      setEditing(false); setAvatarFile(null); load();
    }catch(e){alert("Errore: "+e.message);}
    setSaving(false);
  };

  const adjustHp=async(delta)=>{
    if(!char)return;
    const newHp=Math.max(0,Math.min(char.max_hp||999,(char.hp||0)+delta));
    await supabase.from("player_characters").update({hp:newHp}).eq("id",char.id);
    setChar(c=>({...c,hp:newHp}));
  };

  const toggleSkillProf=async(skillName)=>{
    if(!char)return;
    const profs=[...(char.skill_proficiencies||[])];
    const idx=profs.indexOf(skillName);
    if(idx>=0)profs.splice(idx,1);else profs.push(skillName);
    await supabase.from("player_characters").update({skill_proficiencies:profs}).eq("id",char.id);
    setChar(c=>({...c,skill_proficiencies:profs}));
  };

  const toggleSaveProf=async(stat)=>{
    if(!char)return;
    const profs=[...(char.saving_throw_proficiencies||[])];
    const idx=profs.indexOf(stat);
    if(idx>=0)profs.splice(idx,1);else profs.push(stat);
    await supabase.from("player_characters").update({saving_throw_proficiencies:profs}).eq("id",char.id);
    setChar(c=>({...c,saving_throw_proficiencies:profs}));
  };

  const saveInv=async()=>{
    setSaving(true);
    const obj={...invVals,quantity:parseInt(invVals.quantity)||1};
    delete obj.id; delete obj.created_at; delete obj.player_id;
    if(invModal?.id){ await supabase.from("player_inventory").update(obj).eq("id",invModal.id); }
    else{ await supabase.from("player_inventory").insert({...obj,player_id:user.userId}); }
    setInvModal(null); setSaving(false); load();
  };

  const deleteInv=async(id)=>{ if(!window.confirm("Eliminare?"))return; await supabase.from("player_inventory").delete().eq("id",id); load(); };

  const saveNote=async()=>{
    setSaving(true);
    const obj={...noteVals};
    delete obj.id; delete obj.created_at; delete obj.player_id;
    if(noteModal?.id){ await supabase.from("player_session_notes").update(obj).eq("id",noteModal.id); }
    else{ await supabase.from("player_session_notes").insert({...obj,player_id:user.userId}); }
    setNoteModal(null); setSaving(false); load();
  };

  const deleteNote=async(id)=>{ if(!window.confirm("Eliminare?"))return; await supabase.from("player_session_notes").delete().eq("id",id); load(); };

  const updateCoins=async(key,val)=>{
    const coins={...(char?.coins||{mo:0,ma:0,mr:0,mp:0}),[key]:parseInt(val)||0};
    await supabase.from("player_characters").update({coins}).eq("id",char.id);
    setChar(c=>({...c,coins}));
  };

  const updatePotions=async(key,delta)=>{
    const potions={...(char?.potions||{minore:0,maggiore:0,superiore:0,suprema:0})};
    potions[key]=Math.max(0,(potions[key]||0)+delta);
    await supabase.from("player_characters").update({potions}).eq("id",char.id);
    setChar(c=>({...c,potions}));
  };

  const hpPct=char?.max_hp>0?Math.max(0,Math.min(100,((char.hp||0)/char.max_hp)*100)):0;
  const hpColor=hpPct>60?C.green:hpPct>25?C.yellow:"#f87171";
  const inp={width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const lbl={display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2};

  const navItems=[
    {v:"scheda",icon:"🛡️",label:"La mia Scheda"},
    {v:"sessioni",icon:"📜",label:"Sessioni"},
    {v:"gilda",icon:"🏴",label:"Gilda"},
    {v:"npc",icon:"👤",label:"NPC"},
    {v:"mappa",icon:"🗺️",label:"Mappa"},
    {v:"fazioni",icon:"⚔️",label:"Fazioni"},
    {v:"mondo",icon:"🌍",label:"Fogli del Mondo"},
    {v:"cronologia",icon:"⏳",label:"Cronologia"},{v:"mercato",icon:"🪙",label:"Mercato"},
  ];
  const partyNavItems=[
    {v:"bastioni",icon:"⚓",label:"Bastioni"},
    {v:"bestiario",icon:"🐉",label:"Bestiario Scoperto"},
  ];

  if(loading) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.textDim,fontSize:14}}>Caricamento...</div>;

  const renderCampaign=()=>{
    switch(view){
      case "sessioni": return !campData.sessioni.length?<EmptyState msg="Nessuna sessione ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {campData.sessioni.map((s,i)=>(
            <div key={s.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:C.goldDim}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.goldDim}}>{s.num?`Sessione ${s.num}`:""}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,margin:"5px 0 7px"}}>{s.title}</div>
              <div style={{fontSize:13,color:C.textDim,lineHeight:1.55,fontStyle:"italic"}}>{s.excerpt}</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:8}}>{s.date}</div>
            </div>
          ))}
        </div>;
      case "npc": return !campData.npc.length?<EmptyState msg="Nessun NPC ancora"/>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {campData.npc.map((n,i)=>(
            <div key={n.id||i} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}} onClick={()=>setNpcOpen(n)}>
              <div style={{width:48,height:48,borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden"}}>
                {n.img_url?<img src={n.img_url} alt={n.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(n.icon||"👤")}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{n.name}</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.role}</div>
                <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>{n.attitude&&<Tag t={n.attitude}/>}{n.stato&&<Tag t={n.stato}/>}</div>
              </div>
            </div>
          ))}
        </div>;
      case "gilda":{
        const gradoOrdP={"Adamantio":5,"Platino":4,"Oro":3,"Argento":2,"Ferro":1};
        const gradoColorP={"Ferro":"#a0522d","Argento":"#c0c0c0","Oro":C.gold,"Platino":"#e5e4e2","Adamantio":"#b9f2ff"};
        const sortedGP=[...campData.gilda].sort((a,b)=>(gradoOrdP[b.grado]||0)-(gradoOrdP[a.grado]||0));
        const gradiP=["Adamantio","Platino","Oro","Argento","Ferro"];
        return <div>
          <div onClick={()=>setRulesOpen(true)} style={{display:"flex",alignItems:"center",gap:10,background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:12,padding:"12px 14px",marginBottom:16,cursor:"pointer"}}>
            <span style={{fontSize:18}}>📜</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.gold,flex:1}}>Regole di Gilda</span>
            <span style={{fontSize:12,color:C.textMuted}}>Come funziona la fama ›</span>
          </div>
          {!campData.gilda.length?<EmptyState msg="Nessuna gilda ancora"/>:
          gradiP.map(grado=>{
            const gruppi=sortedGP.filter(g=>g.grado===grado);
            if(!gruppi.length)return null;
            return <div key={grado} style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"0 2px"}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:gradoColorP[grado]}}>{grado}</div>
                <div style={{flex:1,height:1,background:gradoColorP[grado],opacity:.3}}/>
              </div>
              {gruppi.map((g,i)=>(
                <div key={g.id||i} onClick={()=>setNpcOpen(g)} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${gradoColorP[g.grado]||C.gold}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
                  <div style={{width:48,height:48,borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                    {g.img_url?<img src={g.img_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🏴"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{g.name}</div>
                    {g.sede&&<div style={{fontSize:11,color:C.textDim,marginTop:2}}>📍 {g.sede}</div>}
                  </div>
                  {g.influence!=null&&<div style={{fontSize:12,fontWeight:600,color:gradoColorP[g.grado]||C.gold}}>{g.influence}%</div>}
                </div>
              ))}
            </div>;
          })}
          {rulesOpen&&<div onClick={()=>setRulesOpen(false)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.85)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:560,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:24,boxShadow:`0 0 40px ${C.goldGlow}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold}}>📜 Regole di Gilda</span>
                <button onClick={()=>setRulesOpen(false)} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
              </div>
              {campData.guild_rules?.text
                ?<RulesText text={campData.guild_rules.text}/>
                :<div style={{color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Il DM non ha ancora scritto le regole di gilda.</div>}
            </div>
          </div>}
        </div>;
      }
      case "fazioni": return !campData.fazioni.length?<EmptyState msg="Nessuna fazione ancora"/>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {campData.fazioni.map((f,i)=>(
            <div key={f.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,display:"flex",gap:12}}>
              <div style={{width:44,height:44,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{f.icon||"⚔️"}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{f.name}</div>
                <div style={{fontSize:12,color:C.textDim,fontStyle:"italic",margin:"3px 0 7px"}}>{f.description}</div>
                <div style={{height:3,background:C.bg3,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${f.influence||0}%`,background:`linear-gradient(90deg,${C.goldDim},${C.gold})`}}/></div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>Influenza: {f.influence||0}%</div>
              </div>
            </div>
          ))}
        </div>;
      case "mondo": return !campData.mondo.length?<EmptyState msg="Nessun luogo ancora"/>:
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
          {campData.mondo.map((w,i)=>(
            <div key={w.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
              <div style={{height:76,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,borderBottom:`1px solid ${C.border}`}}>{w.icon||"🌍"}</div>
              <div style={{padding:12}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:600,color:C.text}}>{w.name}</div>
                <div style={{fontSize:11,color:C.textDim,fontStyle:"italic",marginTop:3,lineHeight:1.4}}>{w.sub}</div>
              </div>
            </div>
          ))}
        </div>;
      case "cronologia": return !campData.cronologia.length?<EmptyState msg="Nessun evento ancora"/>:
        <div style={{position:"relative",paddingLeft:26}}>
          <div style={{position:"absolute",left:5,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${C.goldDim},transparent)`}}/>
          {campData.cronologia.map((c,i)=>(
            <div key={c.id||i} style={{position:"relative",paddingLeft:16,paddingBottom:20}}>
              <div style={{position:"absolute",left:-21,top:5,width:8,height:8,border:`1px solid ${C.goldDim}`,background:C.bg,transform:"rotate(45deg)"}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.goldDim,marginBottom:3}}>{c.date}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.55}}>{c.description}</div>
              {c.image_path&&<img src={c.image_path} alt={c.title} style={{width:"100%",borderRadius:10,border:`1px solid ${C.border2}`,objectFit:"contain",background:C.bg3,maxHeight:200,marginTop:8,display:"block"}}/>}
            </div>
          ))}
        </div>;
      case "bastioni": return <BastioniView isAuth={false} onUpdate={()=>{}}/>;
      case "mappa":{
        const mapImg=campData.map_config?.map_path;
        return <div>
          <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
            {mapImg?<div style={{position:"relative"}}>
              <img src={mapImg} style={{width:"100%",display:"block",borderRadius:12,maxHeight:520,objectFit:"contain"}}/>
              {campData.map_pins.map((pin,i)=>(
                <div key={pin.id||i} style={{position:"absolute",left:`${pin.x_percent}%`,top:`${pin.y_percent}%`,transform:"translate(-50%,-50%)",zIndex:10}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:pin.status==="nemico"?"#f87171":pin.status==="alleato"?"#4ade80":C.gold,border:"2px solid #fff",boxShadow:"0 0 8px rgba(0,0,0,.6)"}}/>
                  <div style={{position:"absolute",bottom:"calc(100% + 4px)",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,.85)",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:4,whiteSpace:"nowrap"}}>{pin.name}</div>
                </div>
              ))}
            </div>
            :<div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted,fontSize:13}}>Nessuna mappa disponibile</div>}
          </div>
        </div>;
      }
      case "bestiario": return <PlayerBestiaryView data={campData.bestiario} userId={user.userId} onUpdate={load}/>;
      default:
        if(view.startsWith("compagno_")&&selectedCompagno){
          const p=selectedCompagno;
          const hpPct=p.max_hp>0?Math.max(0,Math.min(100,((p.hp||0)/p.max_hp)*100)):0;
          const hpColor=hpPct>60?C.green:hpPct>25?C.yellow:"#f87171";
          return <div style={{maxWidth:520,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
              <div style={{width:64,height:64,borderRadius:"50%",border:`3px solid ${C.gold}`,overflow:"hidden",background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>
                {p.avatar_url?<img src={p.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🛡️"}
              </div>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.text}}>{p.name}</div>
                <div style={{fontSize:12,color:C.textDim,marginTop:3}}>{[p.race,p.class,`Lv ${p.level}`].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
              {[["CA",p.ac||0],["Iniziativa",fmtMod(mod(p.dex||10))],["Livello",p.level||1],["B.Comp.",`+${p.prof_bonus||2}`]].map(([l,v])=>(
                <div key={l} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2}}>{l}</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:l==="Iniziativa"?(mod(p.dex||10)>=0?C.green:"#f87171"):l==="B.Comp."?C.gold:C.text}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>Background</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:C.text}}>{p.background||"—"}</span>
            </div>
            <Card style={{marginBottom:12}}>
              <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>Punti Ferita</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text}}>{p.hp||0}</div>
                <div style={{fontSize:13,color:C.textDim}}>/ {p.max_hp||0}</div>
              </div>
              <div style={{height:8,background:C.bg4,borderRadius:4,overflow:"hidden",marginTop:10}}>
                <div style={{height:"100%",width:`${hpPct}%`,background:hpColor,borderRadius:4,transition:"width .3s"}}/>
              </div>
            </Card>
            <Card style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Caratteristiche</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
                {[["FOR","str"],["DES","dex"],["COS","con"],["INT","int"],["SAG","wis"],["CAR","cha"]].map(([l,k])=>(
                  <div key={k} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>{l}</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,margin:"3px 0"}}>{p[k]||10}</div>
                    <div style={{fontSize:11,fontWeight:600,color:C.gold}}>{fmtMod(mod(p[k]||10))}</div>
                  </div>
                ))}
              </div>
            </Card>
            {(p.attacks||[]).length>0&&<Card style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Attacchi</div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:4,marginBottom:6}}>
                {["Nome","Bonus","Danni"].map(h=><div key={h} style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textMuted}}>{h}</div>)}
              </div>
              {(p.attacks||[]).map((a,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:4,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.name}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.green}}>{a.bonus}</div>
                  <div style={{fontSize:13,color:C.gold}}>{a.damage}</div>
                </div>
              ))}
            </Card>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <Card>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10,display:"flex",justifyContent:"space-between"}}>
                  <span>Abilità</span><span style={{fontWeight:400,color:C.textMuted}}>+{p.prof_bonus||2}</span>
                </div>
                {ABILITA.map(a=>{
                  const hasProf=(p.skill_proficiencies||[]).includes(a.n);
                  const bonus=mod(p[a.s]||10)+(hasProf?(p.prof_bonus||2):0);
                  return <div key={a.n} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 2px"}}>
                    <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${hasProf?C.gold:C.border2}`,background:hasProf?C.gold:"transparent",flexShrink:0}}/>
                    <div style={{fontSize:12,fontWeight:600,color:hasProf?C.gold:C.text,width:28}}>{fmtMod(bonus)}</div>
                    <div style={{fontSize:11,color:C.textDim,flex:1}}>{a.n}</div>
                  </div>;
                })}
              </Card>
              <Card>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Tiri Salvezza</div>
                {[["FOR","str"],["DES","dex"],["COS","con"],["INT","int"],["SAG","wis"],["CAR","cha"]].map(([l,k])=>{
                  const hasProf=(p.saving_throw_proficiencies||[]).includes(k);
                  const bonus=mod(p[k]||10)+(hasProf?(p.prof_bonus||2):0);
                  return <div key={k} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 2px"}}>
                    <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${hasProf?C.gold:C.border2}`,background:hasProf?C.gold:"transparent",flexShrink:0}}/>
                    <div style={{fontSize:12,fontWeight:600,color:hasProf?C.gold:C.text,width:28}}>{fmtMod(bonus)}</div>
                    <div style={{fontSize:11,color:C.textDim,flex:1}}>{l}</div>
                  </div>;
                })}
              </Card>
            </div>
          </div>;
        }
        return null;
    }
  };

  // EDIT MODE
  if(editing) return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",background:C.bg2,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:10}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.gold}}>✏ Modifica Scheda</span>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>{setEditing(false);setAvatarFile(null);}}>Annulla</Btn>
          <Btn primary onClick={saveChar} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
        </div>
      </div>
      <div style={{maxWidth:520,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{marginBottom:16,textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:"50%",border:`3px solid ${C.gold}`,overflow:"hidden",margin:"0 auto 10px",background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>
            {avatarPreview?<img src={avatarPreview} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🛡️"}
          </div>
          <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:C.textDim}}>
            📷 Cambia avatar
            <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setAvatarFile(f);setAvatarPreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
          </label>
        </div>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Informazioni Base</div>
          {[{k:"name",l:"Nome"},{k:"class",l:"Classe"},{k:"race",l:"Razza"},{k:"background",l:"Background"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}><label style={lbl}>{f.l}</label><input value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/></div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{k:"level",l:"Livello"},{k:"ac",l:"CA"},{k:"prof_bonus",l:"Bonus Comp."}].map(f=>(
              <div key={f.k}><label style={lbl}>{f.l}</label><input type="number" value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/></div>
            ))}
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Punti Ferita</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{k:"hp",l:"HP Attuali"},{k:"max_hp",l:"HP Massimi"}].map(f=>(
              <div key={f.k}><label style={lbl}>{f.l}</label><input type="number" value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/></div>
            ))}
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Caratteristiche</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[{k:"str",l:"FOR"},{k:"dex",l:"DES"},{k:"con",l:"COS"},{k:"int",l:"INT"},{k:"wis",l:"SAG"},{k:"cha",l:"CAR"}].map(f=>(
              <div key={f.k}><label style={lbl}>{f.l}</label><input type="number" value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/></div>
            ))}
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>Attacchi</span>
            <Btn primary onClick={()=>setEditVals(v=>({...v,attacks:[...(v.attacks||[]),{name:"",bonus:"",damage:""}]}))}>+ Aggiungi</Btn>
          </div>
          {(editVals.attacks||[]).map((a,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:6,marginBottom:8,alignItems:"end"}}>
              <div><label style={lbl}>Nome</label><input value={a.name||""} onChange={e=>setEditVals(v=>({...v,attacks:v.attacks.map((x,j)=>j===i?{...x,name:e.target.value}:x)}))} style={inp}/></div>
              <div><label style={lbl}>Bonus</label><input value={a.bonus||""} onChange={e=>setEditVals(v=>({...v,attacks:v.attacks.map((x,j)=>j===i?{...x,bonus:e.target.value}:x)}))} style={inp}/></div>
              <div><label style={lbl}>Danni</label><input value={a.damage||""} onChange={e=>setEditVals(v=>({...v,attacks:v.attacks.map((x,j)=>j===i?{...x,damage:e.target.value}:x)}))} style={inp}/></div>
              <button onClick={()=>setEditVals(v=>({...v,attacks:v.attacks.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:"#f87171",fontSize:18,cursor:"pointer",paddingBottom:4}}>✕</button>
            </div>
          ))}
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Slot Incantesimo</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {[1,2,3,4,5,6,7,8,9].map(lv=>(
              <div key={lv}><label style={lbl}>Lv {lv}</label><input type="number" value={(editVals.spell_slots||{})[lv]||""} onChange={e=>setEditVals(v=>({...v,spell_slots:{...(v.spell_slots||{}),[lv]:parseInt(e.target.value)||0}}))} style={inp}/></div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Famiglio</div>
          <textarea value={editVals.famiglio||""} onChange={e=>setEditVals(v=>({...v,famiglio:e.target.value}))} placeholder="Descrivi il tuo famiglio..." style={{...inp,minHeight:80,resize:"vertical"}}/>
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.bg,color:C.text,fontFamily:"'Inter',sans-serif"}}>
      {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:49,backdropFilter:"blur(3px)"}}/>}
      <aside style={{width:260,background:C.panel,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",position:"fixed",top:0,left:0,bottom:0,zIndex:50,transform:sidebarOpen?"translateX(0)":"translateX(-100%)",transition:"transform .3s cubic-bezier(.4,0,.2,1)"}}>
        <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.gold},${C.goldDim})`,boxShadow:`0 0 16px ${C.goldGlow}`,flexShrink:0}}/>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:C.text}}>Terre Perdute</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{user.name||"Avventuriero"}</div>
            </div>
          </div>
        </div>
        <div style={{padding:"14px 0 6px"}}>
          {navItems.map(({v,icon,label})=>(
            <div key={v} onClick={()=>{setView(v);setSidebarOpen(false);load();}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:view===v?500:400,color:view===v?C.gold:C.textDim,background:view===v?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view===v?C.gold:"transparent"}`,userSelect:"none"}}>
              <span style={{fontSize:14,width:18,textAlign:"center"}}>{icon}</span>{label}
            </div>
          ))}
        </div>
        <div style={{height:1,background:C.border,margin:"6px 18px"}}/>
        <div style={{padding:"14px 0 6px"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>Party</div>
          {partyNavItems.map(({v,icon,label})=>(
            <div key={v} onClick={()=>{setView(v);setSidebarOpen(false);load();}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:view===v?500:400,color:view===v?C.gold:C.textDim,background:view===v?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view===v?C.gold:"transparent"}`,userSelect:"none"}}>
              <span style={{fontSize:14,width:18,textAlign:"center"}}>{icon}</span>{label}
            </div>
          ))}
        </div>
        {allPlayers.length>0&&<>
          <div style={{height:1,background:C.border,margin:"6px 18px"}}/>
          <div style={{padding:"14px 0 6px"}}>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>La Compagnia</div>
            {allPlayers.map((p,i)=>{
              const vkey=`compagno_${p.id}`;
              return <div key={i} onClick={()=>{setSelectedCompagno(p);setView(vkey);setSidebarOpen(false);load();}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",cursor:"pointer",background:view===vkey?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view===vkey?C.gold:"transparent"}`}}>
                <span style={{fontSize:14,flexShrink:0}}>{partyIcon(p.name)}</span>
                <div style={{fontSize:13,color:view===vkey?C.gold:C.textDim,fontWeight:view===vkey?500:400}}>{p.name}</div>
                <div style={{marginLeft:"auto",fontSize:10,color:C.textMuted}}>{p.hp}/{p.max_hp}</div>
              </div>;
            })}
          </div>
        </>}
        <div style={{marginTop:"auto",padding:"14px 18px",borderTop:`1px solid ${C.border}`}}>
          <Btn onClick={onLogout} style={{width:"100%"}}>Esci</Btn>
        </div>
      </aside>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:`1px solid ${C.border}`,background:C.bg2,gap:10,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"none",border:`1px solid ${C.border2}`,borderRadius:8,color:C.textDim,fontSize:16,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>☰</button>
            <div style={{width:26,height:26,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.gold},${C.goldDim})`,boxShadow:`0 0 10px ${C.goldGlow}`,flexShrink:0}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.gold,letterSpacing:".06em"}}>{navItems.find(n=>n.v===view)?.label||"Terre Perdute"}</span>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:20}}>
          {view==="scheda"?(<>
            {!char?(
              <div style={{textAlign:"center",padding:"40px 0"}}>
                <div style={{fontSize:40,opacity:.3,marginBottom:16}}>📜</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.textDim,marginBottom:20}}>Nessuna scheda trovata</div>
                <Btn primary onClick={()=>{setEditVals({name:user.name||"",str:10,dex:10,con:10,int:10,wis:10,cha:10,hp:10,max_hp:10,ac:10,level:1,prof_bonus:2,attacks:[],spell_slots:{},coins:{mo:0,ma:0,mr:0,mp:0},potions:{minore:0,maggiore:0,superiore:0,suprema:0}});setEditing(true);}}>Crea la tua scheda</Btn>
              </div>
            ):(
              <div style={{maxWidth:520,margin:"0 auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                  <div style={{width:64,height:64,borderRadius:"50%",border:`3px solid ${C.gold}`,overflow:"hidden",background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>
                    {char.avatar_url?<img src={char.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🛡️"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.text}}>{char.name||user.name}</div>
                    <div style={{fontSize:12,color:C.textDim,marginTop:3}}>{[char.race,char.class,`Lv ${char.level}`].filter(Boolean).join(" · ")}</div>
                  </div>
                  <Btn onClick={()=>{setEditVals({...char});setEditing(true);}}>✏</Btn>
                </div>
                <div style={{display:"flex",gap:2,background:C.bg3,borderRadius:10,padding:3,marginBottom:16,overflowX:"auto"}}>
                  {charTabs.map(t=>(
                    <button key={t} onClick={()=>setTab(t)} style={{fontSize:11,fontWeight:tab===t?600:400,padding:"7px 10px",borderRadius:8,border:"none",background:tab===t?C.gold:"transparent",color:tab===t?"#0b1120":C.textDim,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t}</button>
                  ))}
                </div>
                {tab==="scheda"&&<>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
                    {[["CA",char.ac||0],["Iniziativa",fmtMod(mod(char.dex||10))],["Livello",char.level||1],["B.Comp.",`+${char.prof_bonus||2}`]].map(([l,v])=>(
                      <div key={l} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
                        <div style={{fontSize:8,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2}}>{l}</div>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:l==="Iniziativa"?(mod(char.dex||10)>=0?C.green:"#f87171"):l==="B.Comp."?C.gold:C.text}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>Background</span>
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:C.text}}>{char.background||"—"}</span>
                  </div>
                  <Card style={{marginBottom:12}}>
                    <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>Punti Ferita</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button onClick={()=>adjustHp(-1)} style={{width:36,height:36,borderRadius:"50%",border:"2px solid #f87171",background:"transparent",color:"#f87171",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 14px",minWidth:60,textAlign:"center"}}>{char.hp||0}</div>
                      <div style={{fontSize:13,color:C.textDim}}>/ {char.max_hp||0}</div>
                      <button onClick={()=>adjustHp(1)} style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${C.green}`,background:"transparent",color:C.green,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginLeft:"auto"}}>+</button>
                    </div>
                    <div style={{height:8,background:C.bg4,borderRadius:4,overflow:"hidden",marginTop:10}}>
                      <div style={{height:"100%",width:`${hpPct}%`,background:hpColor,borderRadius:4,transition:"width .3s"}}/>
                    </div>
                  </Card>
                  <Card style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Caratteristiche</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
                      {[["FOR","str"],["DES","dex"],["COS","con"],["INT","int"],["SAG","wis"],["CAR","cha"]].map(([l,k])=>(
                        <div key={k} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
                          <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>{l}</div>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,margin:"3px 0"}}>{char[k]||10}</div>
                          <div style={{fontSize:11,fontWeight:600,color:C.gold}}>{fmtMod(mod(char[k]||10))}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                    <Card>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10,display:"flex",justifyContent:"space-between"}}>
                        <span>Abilità</span><span style={{fontWeight:400,color:C.textMuted}}>+{char.prof_bonus||2}</span>
                      </div>
                      {ABILITA.map(a=>{
                        const hasProf=(char.skill_proficiencies||[]).includes(a.n);
                        const bonus=mod(char[a.s]||10)+(hasProf?(char.prof_bonus||2):0);
                        return <div key={a.n} onClick={()=>toggleSkillProf(a.n)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 2px",cursor:"pointer",borderRadius:4,transition:"background .1s"}}>
                          <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${hasProf?C.gold:C.border2}`,background:hasProf?C.gold:"transparent",flexShrink:0,transition:"all .15s"}}/>
                          <div style={{fontSize:12,fontWeight:600,color:hasProf?C.gold:C.text,width:28}}>{fmtMod(bonus)}</div>
                          <div style={{fontSize:11,color:C.textDim,flex:1}}>{a.n}</div>
                        </div>;
                      })}
                    </Card>
                    <Card>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Tiri Salvezza</div>
                      {[["FOR","str"],["DES","dex"],["COS","con"],["INT","int"],["SAG","wis"],["CAR","cha"]].map(([l,k])=>{
                        const hasProf=(char.saving_throw_proficiencies||[]).includes(k);
                        const bonus=mod(char[k]||10)+(hasProf?(char.prof_bonus||2):0);
                        return <div key={k} onClick={()=>toggleSaveProf(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 2px",cursor:"pointer"}}>
                          <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${hasProf?C.gold:C.border2}`,background:hasProf?C.gold:"transparent",flexShrink:0,transition:"all .15s"}}/>
                          <div style={{fontSize:12,fontWeight:600,color:hasProf?C.gold:C.text,width:28}}>{fmtMod(bonus)}</div>
                          <div style={{fontSize:11,color:C.textDim,flex:1}}>{l}</div>
                        </div>;
                      })}
                    </Card>
                  </div>
                  {(char.attacks||[]).length>0&&<Card style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Attacchi</div>
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:4,marginBottom:6}}>
                      {["Nome","Bonus","Danni"].map(h=><div key={h} style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textMuted}}>{h}</div>)}
                    </div>
                    {(char.attacks||[]).map((a,i)=>(
                      <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:4,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.name}</div>
                        <div style={{fontSize:13,fontWeight:600,color:C.green}}>{a.bonus}</div>
                        <div style={{fontSize:13,color:C.gold}}>{a.damage}</div>
                      </div>
                    ))}
                  </Card>}
                  {Object.keys(char.spell_slots||{}).some(k=>(char.spell_slots[k]||0)>0)&&<Card>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Slot Incantesimo</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                      {[1,2,3,4,5,6,7,8,9].filter(lv=>(char.spell_slots||{})[lv]>0).map(lv=>(
                        <div key={lv} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                          <div style={{fontSize:9,fontWeight:700,color:C.textDim}}>Lv {lv}</div>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold,marginTop:2}}>{char.spell_slots[lv]}</div>
                        </div>
                      ))}
                    </div>
                  </Card>}
                </>}
                {tab==="inventario"&&<>
                  <Card style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>💰 Monete</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {[["MO","mo"],["MA","ma"],["MR","mr"],["MP","mp"]].map(([l,k])=>(
                        <div key={k} style={{textAlign:"center"}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.gold,marginBottom:4}}>{l}</div>
                          <input type="number" value={(char.coins||{})[k]||0} onChange={e=>updateCoins(k,e.target.value)} style={{...inp,textAlign:"center",fontSize:16,fontWeight:700,padding:"8px 4px"}}/>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>🧪 Pozioni Curative</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {[["Minore","minore","2d4+2"],["Maggiore","maggiore","4d4+4"],["Superiore","superiore","8d4+8"],["Suprema","suprema","10d4+20"]].map(([l,k,d])=>(
                        <div key={k} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:10}}>
                          <div style={{fontSize:10,fontWeight:700,color:C.gold}}>{l}</div>
                          <div style={{fontSize:10,color:C.textMuted,marginBottom:6}}>{d}</div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <button onClick={()=>updatePotions(k,-1)} style={{width:28,height:28,borderRadius:"50%",border:"2px solid #f87171",background:"transparent",color:"#f87171",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                            <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.text,flex:1,textAlign:"center"}}>{(char.potions||{})[k]||0}</div>
                            <button onClick={()=>updatePotions(k,1)} style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${C.green}`,background:"transparent",color:C.green,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
                    <Btn primary onClick={()=>{setInvVals({name:"",type:"",description:"",quantity:1});setInvModal({});}}>+ Aggiungi</Btn>
                  </div>
                  {inventory.map((item,i)=>(
                    <div key={item.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text}}>{item.name}</div>
                        {item.description&&<div style={{fontSize:11,color:C.textDim,marginTop:2}}>{item.description}</div>}
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          {item.type&&<span style={{fontSize:10,fontWeight:600,padding:"1px 6px",border:`1px solid ${C.border2}`,borderRadius:4,color:C.textDim}}>{item.type}</span>}
                          {item.quantity>1&&<span style={{fontSize:10,fontWeight:600,color:C.gold}}>x{item.quantity}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>{setInvVals({...item});setInvModal(item);}} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:14}}>✏</button>
                        <button onClick={()=>deleteInv(item.id)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:14}}>🗑</button>
                      </div>
                    </div>
                  ))}
                </>}
                {tab==="famigli"&&<Card>{char.famiglio?<div style={{fontSize:14,color:C.textDim,lineHeight:1.75}}>{char.famiglio}</div>:<div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessun famiglio</div>}</Card>}
                {tab==="note sessione"&&<>
                  <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
                    <Btn primary onClick={()=>{setNoteVals({session_title:"",date:"",content:""});setNoteModal({});}}>+ Aggiungi nota</Btn>
                  </div>
                  {sessionNotes.length===0?<Card><div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessuna nota ancora</div></Card>
                    :sessionNotes.map((note,i)=>(
                      <div key={note.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.gold}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text}}>{note.session_title}</div>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>{setNoteVals({...note});setNoteModal(note);}} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:14}}>✏</button>
                            <button onClick={()=>deleteNote(note.id)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:14}}>🗑</button>
                          </div>
                        </div>
                        {note.date&&<div style={{fontSize:10,color:C.textMuted,marginBottom:6}}>{note.date}</div>}
                        {note.content&&<div style={{fontSize:13,color:C.textDim,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{note.content}</div>}
                      </div>
                    ))
                  }
                </>}
              </div>
            )}
          </>):(renderCampaign())}
        </div>
      </div>

      <NpcPanel npc={npcOpen} onClose={()=>setNpcOpen(null)}/>

      {invModal!==null&&<div onClick={()=>setInvModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:440,width:"92%",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>{invModal?.id?"Modifica Oggetto":"Nuovo Oggetto"}</div>
          {[{k:"name",l:"Nome",ph:"Nome oggetto"},{k:"type",l:"Tipo",ph:"es. Arma, Vari"},{k:"description",l:"Descrizione",ph:"...",ta:true}].map(f=>(
            <div key={f.k} style={{marginBottom:12}}>
              <label style={lbl}>{f.l}</label>
              {f.ta?<textarea value={invVals[f.k]||""} onChange={e=>setInvVals(v=>({...v,[f.k]:e.target.value}))} placeholder={f.ph} style={{...inp,minHeight:60,resize:"vertical"}}/>
                :<input value={invVals[f.k]||""} onChange={e=>setInvVals(v=>({...v,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/>}
            </div>
          ))}
          <div style={{marginBottom:16}}><label style={lbl}>Quantità</label><input type="number" value={invVals.quantity||1} onChange={e=>setInvVals(v=>({...v,quantity:e.target.value}))} style={inp}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setInvModal(null)}>Annulla</Btn>
            <Btn primary onClick={saveInv} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
          </div>
        </div>
      </div>}

      {noteModal!==null&&<div onClick={()=>setNoteModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:440,width:"92%",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>{noteModal?.id?"Modifica Nota":"Nuova Nota"}</div>
          {[{k:"session_title",l:"Titolo sessione",ph:"es. Sessione I"},{k:"date",l:"Data",ph:"es. 1 Gen 2025"}].map(f=>(
            <div key={f.k} style={{marginBottom:12}}><label style={lbl}>{f.l}</label><input value={noteVals[f.k]||""} onChange={e=>setNoteVals(v=>({...v,[f.k]:e.target.value}))} placeholder={f.ph} style={inp}/></div>
          ))}
          <div style={{marginBottom:16}}><label style={lbl}>Contenuto</label><textarea value={noteVals.content||""} onChange={e=>setNoteVals(v=>({...v,content:e.target.value}))} placeholder="Cosa è successo..." style={{...inp,minHeight:120,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setNoteModal(null)}>Annulla</Btn>
            <Btn primary onClick={saveNote} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── DM PLAYER VIEW ──
function DmPlayerView({player, onUpdate}){
  const [char, setChar] = useState(player);
  const [inventory, setInventory] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [tab, setTab] = useState("scheda");
  const [editing, setEditing] = useState(false);
  const [editVals, setEditVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [invModal, setInvModal] = useState(null);
  const [invVals, setInvVals] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(player.avatar_url||"");

  const tabs = ["scheda","inventario","famigli","note sessione"];

  const load = async () => {
    const [charRes, invRes, notesRes] = await Promise.all([
      supabase.from("player_characters").select("*").eq("id", player.id).maybeSingle(),
      supabase.from("player_inventory").select("*").eq("player_id", player.player_id).order("created_at"),
      supabase.from("player_session_notes").select("*").eq("player_id", player.player_id).order("created_at",{ascending:false}),
    ]);
    if(charRes.data){
        const c = charRes.data;
        if(typeof c.attacks === 'string') try{ c.attacks = JSON.parse(c.attacks); }catch(e){ c.attacks = []; }
        if(!Array.isArray(c.attacks)) c.attacks = [];
        if(typeof c.spell_slots === 'string') try{ c.spell_slots = JSON.parse(c.spell_slots); }catch(e){ c.spell_slots = {}; }
        if(typeof c.coins === 'string') try{ c.coins = JSON.parse(c.coins); }catch(e){ c.coins = {}; }
        if(typeof c.potions === 'string') try{ c.potions = JSON.parse(c.potions); }catch(e){ c.potions = {}; }
        setChar(c); setAvatarPreview(c.avatar_url||"");
    }
    setInventory(invRes.data||[]);
    setSessionNotes(notesRes.data||[]);
  };

  useEffect(()=>{ load(); },[player.id]);

  const saveChar = async () => {
    setSaving(true);
    try {
      let avatarUrl = editVals.avatar_url || char?.avatar_url || "";
      if(avatarFile){
        const ext = avatarFile.name.split(".").pop();
        const path = `avatars/${char.player_id}.${ext}`;
        const {error:upErr} = await supabase.storage.from("npc-images").upload(path, avatarFile, {upsert:true});
        if(!upErr){
          const {data:urlData} = supabase.storage.from("npc-images").getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }
      const numFields = ["level","hp","max_hp","ac","str","dex","con","int","wis","cha","prof_bonus"];
      const obj = {...editVals, avatar_url: avatarUrl};
      numFields.forEach(f=>{ if(obj[f]!==undefined) obj[f]=parseInt(obj[f])||0; });
      delete obj.id; delete obj.created_at; delete obj.player_id;
      await supabase.from("player_characters").update(obj).eq("id", char.id);
      setEditing(false); setAvatarFile(null); load(); onUpdate();
    } catch(e){ alert("Errore: "+e.message); }
    setSaving(false);
  };

  const adjustHp = async (delta) => {
    const newHp = Math.max(0, Math.min(char.max_hp||999, (char.hp||0)+delta));
    await supabase.from("player_characters").update({hp:newHp}).eq("id", char.id);
    setChar(c=>({...c, hp:newHp}));
    onUpdate();
  };

  const toggleSkillProf=async(skillName)=>{
    if(!char)return;
    const profs=[...(char.skill_proficiencies||[])];
    const idx=profs.indexOf(skillName);
    if(idx>=0)profs.splice(idx,1);else profs.push(skillName);
    await supabase.from("player_characters").update({skill_proficiencies:profs}).eq("id",char.id);
    setChar(c=>({...c,skill_proficiencies:profs}));
    onUpdate();
  };

  const toggleSaveProf=async(stat)=>{
    if(!char)return;
    const profs=[...(char.saving_throw_proficiencies||[])];
    const idx=profs.indexOf(stat);
    if(idx>=0)profs.splice(idx,1);else profs.push(stat);
    await supabase.from("player_characters").update({saving_throw_proficiencies:profs}).eq("id",char.id);
    setChar(c=>({...c,saving_throw_proficiencies:profs}));
    onUpdate();
  };

  const saveInv = async () => {
    setSaving(true);
    const obj = {...invVals, quantity: parseInt(invVals.quantity)||1};
    delete obj.id; delete obj.created_at; delete obj.player_id;
    if(invModal?.id){
      await supabase.from("player_inventory").update(obj).eq("id", invModal.id);
    } else {
      await supabase.from("player_inventory").insert({...obj, player_id: char.player_id});
    }
    setInvModal(null); setSaving(false); load();
  };

  const deleteInv = async (id) => {
    if(!window.confirm("Eliminare?")) return;
    await supabase.from("player_inventory").delete().eq("id", id);
    load();
  };

  const hpPct = char?.max_hp>0 ? Math.max(0,Math.min(100,((char.hp||0)/char.max_hp)*100)) : 0;
  const hpColor = hpPct>60?C.green:hpPct>25?C.yellow:"#f87171";
  const inp = {width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const lbl = {display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2};

  const playerName = char.name || player.name || "Player";

  if(editing) return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.gold}}>✏ Modifica {playerName}</span>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>{setEditing(false);setAvatarFile(null);}}>Annulla</Btn>
          <Btn primary onClick={saveChar} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
        </div>
      </div>
      {/* Avatar */}
      <div style={{marginBottom:16,textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",border:`3px solid ${C.gold}`,overflow:"hidden",margin:"0 auto 10px",background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>
          {avatarPreview?<img src={avatarPreview} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🛡️"}
        </div>
        <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:C.textDim}}>
          📷 Cambia avatar
          <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setAvatarFile(f);setAvatarPreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
        </label>
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Informazioni Base</div>
        {[{k:"name",l:"Nome"},{k:"class",l:"Classe"},{k:"race",l:"Razza"},{k:"background",l:"Background"}].map(f=>(
          <div key={f.k} style={{marginBottom:10}}>
            <label style={lbl}>{f.l}</label>
            <input value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{k:"level",l:"Livello"},{k:"ac",l:"CA"},{k:"prof_bonus",l:"Bonus Comp."}].map(f=>(
            <div key={f.k}>
              <label style={lbl}>{f.l}</label>
              <input type="number" value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Punti Ferita</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{k:"hp",l:"HP Attuali"},{k:"max_hp",l:"HP Massimi"}].map(f=>(
            <div key={f.k}>
              <label style={lbl}>{f.l}</label>
              <input type="number" value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Caratteristiche</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[{k:"str",l:"FOR"},{k:"dex",l:"DES"},{k:"con",l:"COS"},{k:"int",l:"INT"},{k:"wis",l:"SAG"},{k:"cha",l:"CAR"}].map(f=>(
            <div key={f.k}>
              <label style={lbl}>{f.l}</label>
              <input type="number" value={editVals[f.k]||""} onChange={e=>setEditVals(v=>({...v,[f.k]:e.target.value}))} style={inp}/>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>Attacchi</span>
          <Btn primary onClick={()=>setEditVals(v=>({...v,attacks:[...(v.attacks||[]),{name:"",bonus:"",damage:""}]}))}>+ Aggiungi</Btn>
        </div>
        {(editVals.attacks||[]).map((a,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:6,marginBottom:8,alignItems:"end"}}>
            <div><label style={lbl}>Nome</label><input value={a.name||""} onChange={e=>setEditVals(v=>({...v,attacks:v.attacks.map((x,j)=>j===i?{...x,name:e.target.value}:x)}))} style={inp}/></div>
            <div><label style={lbl}>Bonus</label><input value={a.bonus||""} onChange={e=>setEditVals(v=>({...v,attacks:v.attacks.map((x,j)=>j===i?{...x,bonus:e.target.value}:x)}))} style={inp}/></div>
            <div><label style={lbl}>Danni</label><input value={a.damage||""} onChange={e=>setEditVals(v=>({...v,attacks:v.attacks.map((x,j)=>j===i?{...x,damage:e.target.value}:x)}))} style={inp}/></div>
            <button onClick={()=>setEditVals(v=>({...v,attacks:v.attacks.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:"#f87171",fontSize:18,cursor:"pointer",paddingBottom:4}}>✕</button>
          </div>
        ))}
      </Card>
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Slot Incantesimo</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {[1,2,3,4,5,6,7,8,9].map(lv=>(
            <div key={lv}>
              <label style={lbl}>Lv {lv}</label>
              <input type="number" value={(editVals.spell_slots||{})[lv]||""} onChange={e=>setEditVals(v=>({...v,spell_slots:{...(v.spell_slots||{}),[lv]:parseInt(e.target.value)||0}}))} style={inp}/>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>Famiglio</div>
        <textarea value={editVals.famiglio||""} onChange={e=>setEditVals(v=>({...v,famiglio:e.target.value}))} placeholder="Descrivi il famiglio..." style={{...inp,minHeight:80,resize:"vertical"}}/>
      </Card>
    </div>
  );

  return (
    <div style={{maxWidth:520,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <div style={{width:64,height:64,borderRadius:"50%",border:`3px solid ${C.gold}`,overflow:"hidden",background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>
          {char.avatar_url?<img src={char.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🛡️"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.text}}>{char.name||playerName}</div>
          <div style={{fontSize:12,color:C.textDim,marginTop:3}}>{[char.race,char.class,`Lv ${char.level}`].filter(Boolean).join(" · ")}</div>
        </div>
        <Btn primary onClick={()=>{setEditVals({...char});setEditing(true);}}>✏ Modifica</Btn>
      </div>

      <div style={{display:"flex",gap:2,background:C.bg3,borderRadius:10,padding:3,marginBottom:16,overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{fontSize:11,fontWeight:tab===t?600:400,padding:"7px 10px",borderRadius:8,border:"none",background:tab===t?C.gold:"transparent",color:tab===t?"#0b1120":C.textDim,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{t}</button>
        ))}
      </div>

      {tab==="scheda"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
          {[["CA",char.ac||0],["Iniziativa",fmtMod(mod(char.dex||10))],["Livello",char.level||1],["B.Comp.",`+${char.prof_bonus||2}`]].map(([l,v])=>(
            <div key={l} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
              <div style={{fontSize:8,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2}}>{l}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:l==="Iniziativa"?(mod(char.dex||10)>=0?C.green:"#f87171"):l==="B.Comp."?C.gold:C.text}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>Background</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,color:C.text}}>{char.background||"—"}</span>
        </div>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>Punti Ferita</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>adjustHp(-1)} style={{width:36,height:36,borderRadius:"50%",border:"2px solid #f87171",background:"transparent",color:"#f87171",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.text,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 14px",minWidth:60,textAlign:"center"}}>{char.hp||0}</div>
            <div style={{fontSize:13,color:C.textDim}}>/ {char.max_hp||0}</div>
            <button onClick={()=>adjustHp(1)} style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${C.green}`,background:"transparent",color:C.green,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginLeft:"auto"}}>+</button>
          </div>
          <div style={{height:8,background:C.bg4,borderRadius:4,overflow:"hidden",marginTop:10}}>
            <div style={{height:"100%",width:`${hpPct}%`,background:hpColor,borderRadius:4,transition:"width .3s"}}/>
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Caratteristiche</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
            {[["FOR","str"],["DES","dex"],["COS","con"],["INT","int"],["SAG","wis"],["CAR","cha"]].map(([l,k])=>(
              <div key={k} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 4px",textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textDim}}>{l}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,margin:"3px 0"}}>{char[k]||10}</div>
                <div style={{fontSize:11,fontWeight:600,color:C.gold}}>{fmtMod(mod(char[k]||10))}</div>
              </div>
            ))}
          </div>
        </Card>
        {(char.attacks||[]).length>0&&<Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Attacchi</div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:4,marginBottom:6}}>
            {["Nome","Bonus","Danni"].map(h=><div key={h} style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textMuted}}>{h}</div>)}
          </div>
          {(char.attacks||[]).map((a,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:4,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.name}</div>
              <div style={{fontSize:13,fontWeight:600,color:C.green}}>{a.bonus}</div>
              <div style={{fontSize:13,color:C.gold}}>{a.damage}</div>
            </div>
          ))}
        </Card>}
        {Object.keys(char.spell_slots||{}).some(k=>(char.spell_slots[k]||0)>0)&&<Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Slot Incantesimo</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
            {[1,2,3,4,5,6,7,8,9].filter(lv=>(char.spell_slots||{})[lv]>0).map(lv=>(
              <div key={lv} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:700,color:C.textDim}}>Lv {lv}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold,marginTop:2}}>{char.spell_slots[lv]}</div>
              </div>
            ))}
          </div>
        </Card>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <Card>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10,display:"flex",justifyContent:"space-between"}}>
              <span>Abilità</span><span style={{fontWeight:400,color:C.textMuted}}>+{char.prof_bonus||2}</span>
            </div>
            {ABILITA.map(a=>{
              const hasProf=(char.skill_proficiencies||[]).includes(a.n);
              const bonus=mod(char[a.s]||10)+(hasProf?(char.prof_bonus||2):0);
              return <div key={a.n} onClick={()=>toggleSkillProf(a.n)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 2px",cursor:"pointer",borderRadius:4,transition:"background .1s"}}>
                <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${hasProf?C.gold:C.border2}`,background:hasProf?C.gold:"transparent",flexShrink:0,transition:"all .15s"}}/>
                <div style={{fontSize:12,fontWeight:600,color:hasProf?C.gold:C.text,width:28}}>{fmtMod(bonus)}</div>
                <div style={{fontSize:11,color:C.textDim,flex:1}}>{a.n}</div>
              </div>;
            })}
          </Card>
          <Card>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Tiri Salvezza</div>
            {[["FOR","str"],["DES","dex"],["COS","con"],["INT","int"],["SAG","wis"],["CAR","cha"]].map(([l,k])=>{
              const hasProf=(char.saving_throw_proficiencies||[]).includes(k);
              const bonus=mod(char[k]||10)+(hasProf?(char.prof_bonus||2):0);
              return <div key={k} onClick={()=>toggleSaveProf(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 2px",cursor:"pointer"}}>
                <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${hasProf?C.gold:C.border2}`,background:hasProf?C.gold:"transparent",flexShrink:0,transition:"all .15s"}}/>
                <div style={{fontSize:12,fontWeight:600,color:hasProf?C.gold:C.text,width:28}}>{fmtMod(bonus)}</div>
                <div style={{fontSize:11,color:C.textDim,flex:1}}>{l}</div>
              </div>;
            })}
          </Card>
        </div>
      </>}

      {tab==="inventario"&&<>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>💰 Monete</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[["MO","mo"],["MA","ma"],["MR","mr"],["MP","mp"]].map(([l,k])=>(
              <div key={k} style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:C.gold,marginBottom:4}}>{l}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.text,background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>{(char.coins||{})[k]||0}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>🧪 Pozioni</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
            {[["Minore","minore"],["Maggiore","maggiore"],["Superiore","superiore"],["Suprema","suprema"]].map(([l,k])=>(
              <div key={k} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:12,color:C.textDim}}>{l}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold}}>{(char.potions||{})[k]||0}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
          <Btn primary onClick={()=>{setInvVals({name:"",type:"",description:"",quantity:1});setInvModal({});}}>+ Aggiungi</Btn>
        </div>
        {inventory.map((item,i)=>(
          <div key={item.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text}}>{item.name}</div>
              {item.description&&<div style={{fontSize:11,color:C.textDim,marginTop:2}}>{item.description}</div>}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                {item.type&&<span style={{fontSize:10,fontWeight:600,padding:"1px 6px",border:`1px solid ${C.border2}`,borderRadius:4,color:C.textDim}}>{item.type}</span>}
                {item.quantity>1&&<span style={{fontSize:10,fontWeight:600,color:C.gold}}>x{item.quantity}</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>{setInvVals({...item});setInvModal(item);}} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:14}}>✏</button>
              <button onClick={()=>deleteInv(item.id)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:14}}>🗑</button>
            </div>
          </div>
        ))}
      </>}

      {tab==="famigli"&&<Card>{char.famiglio?<div style={{fontSize:14,color:C.textDim,lineHeight:1.75}}>{char.famiglio}</div>:<div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessun famiglio</div>}</Card>}

      {tab==="note sessione"&&(sessionNotes.length===0?<Card><div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessuna nota</div></Card>
        :sessionNotes.map((note,i)=>(
          <div key={note.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.gold}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>{note.session_title}</div>
            {note.date&&<div style={{fontSize:10,color:C.textMuted,marginBottom:6}}>{note.date}</div>}
            {note.content&&<div style={{fontSize:13,color:C.textDim,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{note.content}</div>}
          </div>
        ))
      )}

      {invModal!==null&&<div onClick={()=>setInvModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:440,width:"92%",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>{invModal?.id?"Modifica Oggetto":"Nuovo Oggetto"}</div>
          {[{k:"name",l:"Nome",ph:"Nome oggetto"},{k:"type",l:"Tipo",ph:"es. Arma, Armatura, Vari"},{k:"description",l:"Descrizione",ph:"...",ta:true}].map(f=>(
            <div key={f.k} style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2}}>{f.l}</label>
              {f.ta?<textarea value={invVals[f.k]||""} onChange={e=>setInvVals(v=>({...v,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,minHeight:60,resize:"vertical",boxSizing:"border-box"}}/>
                :<input value={invVals[f.k]||""} onChange={e=>setInvVals(v=>({...v,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"}}/>}
            </div>
          ))}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2}}>Quantità</label>
            <input type="number" value={invVals.quantity||1} onChange={e=>setInvVals(v=>({...v,quantity:e.target.value}))} style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setInvModal(null)}>Annulla</Btn>
            <Btn primary onClick={saveInv} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
          </div>
        </div>
      </div>}
    </div>
  );
}


const TABLE_MAP = {
  sessioni:{table:"sessions",fields:[{id:"num",l:"Numero",ph:"es. I"},{id:"title",l:"Titolo",ph:"Titolo..."},{id:"date",l:"Data",type:"date"},{id:"excerpt",l:"Riassunto",ph:"Cosa è successo...",ta:true}]},
  gilda:{table:"factions",fields:[{id:"name",l:"Nome",ph:"Nome"},{id:"grado",l:"Grado",sel:["Ferro","Argento","Oro","Platino","Adamantio"]},{id:"description",l:"Descrizione",ph:"...",ta:true},{id:"sede",l:"Sede",ph:"es. Porto di Arenmar"},{id:"influence",l:"Fama %",ph:"0-100"}],tipo:"gilda",hasImage:true,imageBucket:"npc-images",imageField:"img_url"},
  fazioni:{table:"factions",fields:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"⚔️"},{id:"description",l:"Descrizione",ph:"...",ta:true},{id:"influence",l:"Influenza %",ph:"0-100"}],tipo:"fazione"},
  mondo:{table:"locations",fields:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"🏰"},{id:"sub",l:"Descrizione",ph:"...",ta:true}]},
  mercato:{table:"mercato",fields:[{id:"name",l:"Nome",ph:"es. Armeria di Brenor"},{id:"location",l:"Città/Luogo",ph:"es. Porto di Arenmar"},{id:"description",l:"Descrizione",ph:"Cosa vende...",ta:true}],hasImage:true,imageBucket:"npc-images",imageField:"img_url"},
  cronologia:{table:"timeline",fields:[{id:"date",l:"Data",ph:"Anno 1, Giorno X"},{id:"title",l:"Titolo",ph:"Evento..."},{id:"description",l:"Descrizione",ph:"Cosa accadde...",ta:true}],hasImage:true,imageBucket:"timeline-images",imageField:"image_path"},
};


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

function PinModal({onSuccess,onClose}){
  const [val,setVal]=useState("");
  const [err,setErr]=useState("");
  const press=d=>{
    if(val.length>=4)return;
    const next=val+d;
    setVal(next);
    if(next.length===4){setTimeout(()=>{if(next==="1234"){onSuccess();}else{setErr("PIN errato");setVal("");}},80);}
  };
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,width:280,padding:"20px 20px 16px",boxShadow:`0 0 32px ${C.goldGlow}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold}}>🔐 PIN Dungeon Master</span>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:C.textDim,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"0 0 16px"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${i<val.length?C.gold:C.border2}`,background:i<val.length?C.gold:"transparent",transition:"all .15s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,maxWidth:210,margin:"0 auto"}}>
        {["1","2","3","4","5","6","7","8","9","CLR","0","⌫"].map(k=>(
          <button key={k} onClick={()=>k==="CLR"?setVal(""):k==="⌫"?setVal(v=>v.slice(0,-1)):press(k)}
            style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:k.length>1?11:18,fontWeight:500,padding:"13px 0",cursor:"pointer"}}>{k}</button>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,fontWeight:600,color:"#f87171",marginTop:8,minHeight:16}}>{err}</div>
    </div>
  </div>;
}

function NpcFormModal({npc,onClose,onSaved}){
  const [vals,setVals]=useState(npc||{name:"",role:"",icon:"👤",description:"",primo_incontro:"",attitude:"Neutrale",stato:"vivo",img_url:""});
  const [imgFile,setImgFile]=useState(null);
  const [imgPreview,setImgPreview]=useState(npc?.img_url||"");
  const [saving,setSaving]=useState(false);
  const handleFile=e=>{const f=e.target.files[0];if(!f)return;setImgFile(f);setImgPreview(URL.createObjectURL(f));};
  const save=async()=>{
    setSaving(true);
    try{
      let imgUrl=vals.img_url||"";
      if(imgFile){
        const ext=imgFile.name.split(".").pop();
        const path=`${Date.now()}.${ext}`;
        const {error:upErr}=await supabase.storage.from("npc-images").upload(path,imgFile,{upsert:true});
        if(upErr)throw upErr;
        const {data:urlData}=supabase.storage.from("npc-images").getPublicUrl(path);
        imgUrl=urlData.publicUrl;
      }
      const payload={...vals,img_url:imgUrl};
      delete payload.id; delete payload.created_at;
      let error;
      if(npc?.id){({error}=await supabase.from("npcs").update(payload).eq("id",npc.id));}
      else{({error}=await supabase.from("npcs").insert(payload));}
      if(error)throw error;
      onSaved();
    }catch(e){alert("Errore: "+e.message);}
    setSaving(false);
  };
  const inp={width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const lbl={display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim};
  return <Modal title={npc?.id?"Modifica NPC":"Nuovo NPC"} onClose={onClose} onSave={save} saving={saving}>
    <div style={{marginBottom:13}}>
      <label style={lbl}>Immagine</label>
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
        {imgPreview?<img src={imgPreview} style={{width:"100%",maxHeight:280,objectFit:"contain",background:C.bg3,borderRadius:10,border:`1px solid ${C.border2}`}}/>
          :<div style={{width:"100%",height:120,background:C.bg3,borderRadius:10,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{vals.icon||"👤"}</div>}
        <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:12,color:C.textDim,textAlign:"center",width:"100%",boxSizing:"border-box"}}>
          📷 Scegli foto dal telefono
          <input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
        </label>
        {imgPreview&&<button onClick={()=>{setImgFile(null);setImgPreview("");setVals(v=>({...v,img_url:""}));}} style={{fontSize:11,color:"#f87171",background:"none",border:"none",cursor:"pointer"}}>✕ Rimuovi immagine</button>}
      </div>
    </div>
    {[{id:"name",l:"Nome",ph:"Nome"},{id:"role",l:"Ruolo",ph:"es. Mercante"},{id:"icon",l:"Icona",ph:"👤"},{id:"primo_incontro",l:"Primo incontro",ph:"es. Aldermoor"}].map(f=>(
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
      <select value={vals.attitude||"Neutrale"} onChange={e=>setVals(v=>({...v,attitude:e.target.value}))} style={{...inp,cursor:"pointer"}}>
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

function GenericModal({title,fields,vals,onClose,onSave,saving,onChange,hasImage,imageBucket,imageField}){
  const [imgFile,setImgFile]=useState(null);
  const [imgPreview,setImgPreview]=useState(vals[imageField||"image_path"]||"");
  const inp={width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const handleSave=async()=>{
    if(hasImage&&imgFile){
      const ext=imgFile.name.split(".").pop();
      const path=`${Date.now()}.${ext}`;
      const {error:upErr}=await supabase.storage.from(imageBucket).upload(path,imgFile,{upsert:true});
      if(upErr){alert("Errore upload: "+upErr.message);return;}
      const {data:urlData}=supabase.storage.from(imageBucket).getPublicUrl(path);
      onSave(urlData.publicUrl,imageField);
    }else{onSave(null,null);}
  };
  return <Modal title={title} onClose={onClose} onSave={handleSave} saving={saving}>
    {hasImage&&<div style={{marginBottom:13}}>
      <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim}}>Immagine</label>
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
        {imgPreview?<img src={imgPreview} style={{width:"100%",maxHeight:200,objectFit:"contain",background:C.bg3,borderRadius:10,border:`1px solid ${C.border2}`}}/>
          :<div style={{width:"100%",height:100,background:C.bg3,borderRadius:10,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:C.textMuted}}>🖼️</div>}
        <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:12,color:C.textDim,textAlign:"center",width:"100%",boxSizing:"border-box"}}>
          📷 Scegli foto dal telefono
          <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setImgFile(f);setImgPreview(URL.createObjectURL(f));onChange(imageField,"");}}} style={{display:"none"}}/>
        </label>
        {imgPreview&&<button onClick={()=>{setImgFile(null);setImgPreview("");onChange(imageField,"");}} style={{fontSize:11,color:"#f87171",background:"none",border:"none",cursor:"pointer"}}>✕ Rimuovi immagine</button>}
      </div>
    </div>}
    {fields.map(f=>(
      <div key={f.id} style={{marginBottom:13}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim}}>{f.l}</label>
        {f.sel?<select value={vals[f.id]||""} onChange={e=>onChange(f.id,e.target.value)} style={{...inp,cursor:"pointer"}}>
            {f.sel.map(o=><option key={o} value={o} style={{background:C.bg2}}>{o||"—"}</option>)}
          </select>
          :f.ta?<textarea value={vals[f.id]||""} onChange={e=>onChange(f.id,e.target.value)} placeholder={f.ph} style={{...inp,minHeight:80,resize:"vertical"}}/>
          :<input type={f.type||"text"} value={vals[f.id]||""} onChange={e=>onChange(f.id,e.target.value)} placeholder={f.ph||""} style={inp}/>}
      </div>
    ))}
  </Modal>;
}


// ── MERCATO VIEW ──
function MercatoView({isAuth, data, onUpdate}){
  const [modal,setModal]=useState(null);
  const [vals,setVals]=useState({});
  const [imgFile,setImgFile]=useState(null);
  const [imgPreview,setImgPreview]=useState("");
  const [catalogFile,setCatalogFile]=useState(null);
  const [catalogPreview,setCatalogPreview]=useState("");
  const [saving,setSaving]=useState(false);
  const [detailOpen,setDetailOpen]=useState(null);
  const [fullscreenImg,setFullscreenImg]=useState(null);

  const save=async()=>{
    setSaving(true);
    try{
      let imgUrl=vals.img_url||"";
      if(imgFile){
        const ext=imgFile.name.split(".").pop();
        const path=`mercato/${Date.now()}.${ext}`;
        const {error:upErr}=await supabase.storage.from("npc-images").upload(path,imgFile,{upsert:true});
        if(upErr){
          alert("Errore upload immagine: "+upErr.message);
          setSaving(false);
          return;
        }
        const {data:u}=supabase.storage.from("npc-images").getPublicUrl(path);
        imgUrl=u.publicUrl;
      }
      let catalogUrl=vals.catalog_img_url||"";
      if(catalogFile){
        const ext=catalogFile.name.split(".").pop();
        const path=`mercato/catalog_${Date.now()}.${ext}`;
        const {error:upErr}=await supabase.storage.from("npc-images").upload(path,catalogFile,{upsert:true});
        if(upErr){
          alert("Errore upload immagine catalogo: "+upErr.message);
          setSaving(false);
          return;
        }
        const {data:u}=supabase.storage.from("npc-images").getPublicUrl(path);
        catalogUrl=u.publicUrl;
      }
      const obj={...vals,img_url:imgUrl,catalog_img_url:catalogUrl};
      delete obj.id; delete obj.created_at;
      if(modal?.id){await supabase.from("mercato").update(obj).eq("id",modal.id);}
      else{await supabase.from("mercato").insert(obj);}
      setModal(null);setImgFile(null);setImgPreview("");setCatalogFile(null);setCatalogPreview("");onUpdate();
    }catch(e){alert("Errore: "+e.message);}
    setSaving(false);
  };

  const del=async(id)=>{if(!window.confirm("Eliminare?"))return;await supabase.from("mercato").delete().eq("id",id);onUpdate();};

  const inp={width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const lbl={display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2};

  return <div>
    {isAuth&&<div style={{marginBottom:12}}>
      <Btn primary onClick={()=>{setVals({name:"",location:"",description:"",img_url:"",catalog_img_url:""});setImgPreview("");setImgFile(null);setCatalogPreview("");setCatalogFile(null);setModal({});}}>+ Aggiungi Negozio</Btn>
    </div>}

    {!(data||[]).length?<EmptyState msg="Nessun negozio ancora"/>:
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
        {(data||[]).map((s,i)=>(
          <div key={s.id||i} onClick={()=>setDetailOpen(s)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer"}}>
            {s.img_url
              ?<img src={s.img_url} style={{width:"100%",height:180,objectFit:"contain",background:C.bg3,display:"block"}}/>
              :<div style={{height:140,background:C.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🏪</div>}
            <div style={{padding:"10px 12px"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:600,color:C.text,marginBottom:2}}>{s.name}</div>
              {s.location&&<div style={{fontSize:10,color:C.textDim}}>📍 {s.location}</div>}
              {s.description&&<div style={{fontSize:10,color:C.textMuted,marginTop:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.description}</div>}
              {isAuth&&<div onClick={e=>{e.stopPropagation();}} style={{display:"flex",gap:4,marginTop:8}}>
                <button onClick={()=>{setVals({...s});setImgPreview(s.img_url||"");setImgFile(null);setCatalogPreview(s.catalog_img_url||"");setCatalogFile(null);setModal(s);}} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:12}}>✏</button>
                <button onClick={()=>del(s.id)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:12}}>🗑</button>
              </div>}
            </div>
          </div>
        ))}
      </div>}

    {/* Detail panel */}
    {detailOpen&&<div onClick={()=>setDetailOpen(null)} style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",background:C.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${C.border2}`,width:"100%",maxWidth:960,maxHeight:"96vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px 12px"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.gold}}>{detailOpen.name}</span>
          <button onClick={()=>setDetailOpen(null)} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
        </div>
        {(detailOpen.catalog_img_url||detailOpen.img_url)&&<div style={{padding:"0 20px 16px"}}>
          <img src={detailOpen.catalog_img_url||detailOpen.img_url} onClick={()=>setFullscreenImg(detailOpen.catalog_img_url||detailOpen.img_url)} style={{width:"100%",maxHeight:'none',objectFit:"contain",background:C.bg3,borderRadius:12,border:`1px solid ${C.border2}`,display:"block",cursor:"zoom-in"}}/>
        </div>}
        <div style={{padding:"0 20px 32px"}}>
          {detailOpen.location&&<div style={{fontSize:13,color:C.textDim,marginBottom:8}}>📍 {detailOpen.location}</div>}
          {detailOpen.description&&<div style={{fontSize:15,color:C.text,lineHeight:1.75}}>{detailOpen.description}</div>}
        </div>
      </div>
    </div>}

    {/* Fullscreen catalog image viewer */}
    {fullscreenImg&&<div onClick={()=>setFullscreenImg(null)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out",padding:16}}>
      <img src={fullscreenImg} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}}/>
      <button onClick={()=>setFullscreenImg(null)} style={{position:"fixed",top:16,right:16,background:"rgba(0,0,0,.6)",border:`1px solid ${C.border2}`,borderRadius:"50%",width:40,height:40,color:C.text,fontSize:20,cursor:"pointer"}}>✕</button>
    </div>}

    {/* Add/Edit Modal */}
    {modal!==null&&<div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:480,width:"92%",maxHeight:"88vh",overflowY:"auto",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>{modal?.id?"Modifica Negozio":"Nuovo Negozio"}</div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Immagine Copertina</label>
          <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:6}}>
            {imgPreview?<img src={imgPreview} style={{width:"100%",maxHeight:220,objectFit:"contain",background:C.bg3,borderRadius:10,border:`1px solid ${C.border2}`}}/>
              :<div style={{height:100,background:C.bg3,borderRadius:10,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🏪</div>}
            <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,color:C.textDim,textAlign:"center"}}>
              📷 Scegli immagine copertina
              <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setImgFile(f);setImgPreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
            </label>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Immagine Catalogo/Menu</label>
          <div style={{fontSize:10,color:C.textMuted,marginBottom:6}}>Mostrata a schermo intero quando il giocatore apre il negozio</div>
          <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:6}}>
            {catalogPreview?<img src={catalogPreview} style={{width:"100%",maxHeight:220,objectFit:"contain",background:C.bg3,borderRadius:10,border:`1px solid ${C.border2}`}}/>
              :<div style={{height:100,background:C.bg3,borderRadius:10,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>📜</div>}
            <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,color:C.textDim,textAlign:"center"}}>
              📷 Scegli immagine catalogo
              <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setCatalogFile(f);setCatalogPreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
            </label>
          </div>
        </div>
        <div style={{marginBottom:12}}><label style={lbl}>Nome</label><input value={vals.name||""} onChange={e=>setVals(v=>({...v,name:e.target.value}))} placeholder="es. Armeria di Brenor" style={inp}/></div>
        <div style={{marginBottom:12}}><label style={lbl}>Città/Luogo</label><input value={vals.location||""} onChange={e=>setVals(v=>({...v,location:e.target.value}))} placeholder="es. Porto di Arenmar" style={inp}/></div>
        <div style={{marginBottom:16}}><label style={lbl}>Descrizione</label><textarea value={vals.description||""} onChange={e=>setVals(v=>({...v,description:e.target.value}))} placeholder="Cosa vende, chi gestisce..." style={{...inp,minHeight:80,resize:"vertical"}}/></div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setModal(null)}>Annulla</Btn>
          <Btn primary onClick={save} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
        </div>
      </div>
    </div>}
  </div>;
}


// ── BESTIARY VIEW ──
function BestiaryView({isAuth, data, onUpdate}){
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [vals,setVals]=useState({});
  const [imgFile,setImgFile]=useState(null);
  const [imgPreview,setImgPreview]=useState("");
  const [saving,setSaving]=useState(false);
  const [detailOpen,setDetailOpen]=useState(null);
  const [autoImg,setAutoImg]=useState(null);
  const [loadingImg,setLoadingImg]=useState(false);

  // Map Italian names to D&D 5e API English names
  const nameMap={
    "Aboleth":"aboleth","Ammasso Gelatinoso":"gelatinous-cube","Arpia":"harpy",
    "Banshee":"banshee","Basilisco":"basilisk","Bugbear":"bugbear","Bulette":"bulette",
    "Ciclope":"cyclops","Coccodrillo":"crocodile","Displacer Beast":"displacer-beast",
    "Drago Antico Bianco":"ancient-white-dragon","Drago Antico Blu":"ancient-blue-dragon",
    "Drago Antico Nero":"ancient-black-dragon","Drago Antico Rosso":"ancient-red-dragon",
    "Drago Antico Verde":"ancient-green-dragon","Drago d'Oro Antico":"ancient-gold-dragon",
    "Drago d'Argento Antico":"ancient-silver-dragon","Drago di Gioventù Rosso":"young-red-dragon",
    "Dracolich":"dracolich","Drow":"drow","Drider":"drider","Elementale dell'Acqua":"water-elemental",
    "Elementale dell'Aria":"air-elemental","Elementale della Terra":"earth-elemental",
    "Elementale del Fuoco":"fire-elemental","Ettin":"ettin","Fantasma":"ghost",
    "Fomoriano":"fomorian","Gargoyle":"gargoyle","Ghoul":"ghoul",
    "Gigante delle Colline":"hill-giant","Gigante del Fuoco":"fire-giant",
    "Gigante del Gelo":"frost-giant","Gigante delle Nuvole":"cloud-giant",
    "Gigante delle Pietre":"stone-giant","Gigante delle Tempeste":"storm-giant",
    "Goblin":"goblin","Gorgone":"gorgon","Grifo":"griffon","Hobgoblin":"hobgoblin",
    "Idra":"hydra","Kobold":"kobold","Kraken":"kraken","Lamia":"lamia","Lich":"lich",
    "Manticora":"manticore","Medusa":"medusa","Mimic":"mimic","Minotauro":"minotaur",
    "Mummia":"mummy","Mummia Lord":"mummy-lord","Ogre":"ogre","Orco":"orc",
    "Orsogufo":"owlbear","Pegaso":"pegasus","Roc":"roc","Salamandra":"salamander",
    "Scheletro":"skeleton","Sirena":"merrow","Spettro":"specter",
    "Succube/Incubo":"succubus","Tarrasque":"tarrasque","Treant":"treant",
    "Troll":"troll","Unicorno":"unicorn","Vampiro":"vampire","Vampiro Spawn":"vampire-spawn",
    "Verme Viola":"purple-worm","Wraith":"wraith","Wyvern":"wyvern","Zombie":"zombie",
    "Demone Balor":"balor","Demone Dretch":"dretch","Demone Vrock":"vrock",
    "Demone Hezrou":"hezrou","Demone Glabrezu":"glabrezu","Demone Marilith":"marilith",
    "Demone Nalfeshnee":"nalfeshnee","Diavolo Pit Fiend":"pit-fiend",
    "Diavolo Erinyes":"erinyes","Diavolo Chain":"chain-devil",
    "Diavolo Bone":"bone-devil","Diavolo Barbed":"barbed-devil",
    "Sfinge Androsphinx":"androsphinx","Sfinge Gynosphinx":"gynosphinx",
  };

  const fetchAutoImage = async (creature) => {
    if(creature.img_url) { setAutoImg(null); return; }
    setAutoImg(null); setLoadingImg(true);
    try {
      const slug = nameMap[creature.name];
      if(slug) {
        const res = await fetch(`https://www.dnd5eapi.co/api/monsters/${slug}`);
        if(res.ok){
          const json = await res.json();
          if(json.image) { setAutoImg("https://www.dnd5eapi.co"+json.image); setLoadingImg(false); return; }
        }
      }
      // Fallback: use Wikipedia search
      setAutoImg(null);
    } catch(e){}
    setLoadingImg(false);
  };

  const TYPES=["Bestia","Umanoide","Non morto","Demone","Drago","Costrutto","Fata","Gigante","Melma","Pianta","Aberrazione","Elementale","Celeste","Mostruosità"];
  const CR=["0","1/8","1/4","1/2","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30"];

  const filtered=(data||[]).filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));

  const save=async()=>{
    setSaving(true);
    try{
      let imgUrl=vals.img_url||"";
      if(imgFile){
        const ext=imgFile.name.split(".").pop();
        const path=`bestiary/${Date.now()}.${ext}`;
        const {error:upErr}=await supabase.storage.from("npc-images").upload(path,imgFile,{upsert:true});
        if(!upErr){const {data:u}=supabase.storage.from("npc-images").getPublicUrl(path);imgUrl=u.publicUrl;}
      }
      const obj={...vals,img_url:imgUrl};
      delete obj.id; delete obj.created_at;
      if(modal?.id){await supabase.from("bestiary").update(obj).eq("id",modal.id);}
      else{await supabase.from("bestiary").insert(obj);}
      setModal(null);setImgFile(null);setImgPreview("");onUpdate();
    }catch(e){alert("Errore: "+e.message);}
    setSaving(false);
  };

  const del=async(id)=>{if(!window.confirm("Eliminare?"))return;await supabase.from("bestiary").delete().eq("id",id);onUpdate();};

  const inp={width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const lbl={display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2};

  const crColor=(cr)=>{
    const n=parseFloat(cr)||0;
    if(n<=1)return C.green;
    if(n<=5)return C.yellow;
    if(n<=10)return "#fb923c";
    return "#f87171";
  };

  return <div>
    {/* Search bar */}
    <div style={{position:"relative",marginBottom:16}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cerca nel bestiario..." style={{...inp,marginTop:0,paddingLeft:14,fontSize:15}}/>
    </div>

    {/* Add button */}
    {isAuth&&<div style={{marginBottom:12}}>
      <Btn primary onClick={()=>{setVals({name:"",type:"Bestia",challenge_rating:"1",hp:"",description:"",attacks:"",img_url:""});setImgPreview("");setImgFile(null);setModal({});}}>+ Aggiungi Creatura</Btn>
    </div>}

    {/* List */}
    {filtered.length===0?<EmptyState msg="Nessuna creatura nel bestiario"/>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map((c,i)=>(
          <div key={c.id||i} onClick={()=>{setDetailOpen(c);fetchAutoImage(c);}} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}}>
            <div style={{width:52,height:52,borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
              {c.img_url?<img src={c.img_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🐉"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{c.name}</div>
              <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{c.type}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textMuted}}>GS</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:crColor(c.challenge_rating)}}>{c.challenge_rating||"—"}</div>
            </div>
            {isAuth&&<div onClick={e=>{e.stopPropagation();}} style={{display:"flex",flexDirection:"column",gap:4,marginLeft:4}}>
              <Btn onClick={()=>{setVals({...c});setImgPreview(c.img_url||"");setImgFile(null);setModal(c);}}>✏</Btn>
              <Btn onClick={()=>del(c.id)}>✕</Btn>
            </div>}
          </div>
        ))}
      </div>}

    {/* Detail panel */}
    {detailOpen&&<div onClick={()=>setDetailOpen(null)} style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",background:C.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${C.border2}`,width:"100%",maxWidth:640,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px 12px"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.gold}}>{detailOpen.name}</span>
          <button onClick={()=>setDetailOpen(null)} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:"0 20px 16px"}}>
          {(detailOpen.img_url||autoImg)?
            <img src={detailOpen.img_url||autoImg} style={{width:"100%",maxHeight:300,objectFit:"contain",background:C.bg3,borderRadius:12,border:`1px solid ${C.border2}`,display:"block"}}/>
            :loadingImg?<div style={{height:120,background:C.bg3,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",color:C.textDim,fontSize:13}}>Caricamento immagine...</div>
            :<div style={{height:80,background:C.bg3,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🐉</div>}
        </div>
        <div style={{padding:"0 20px 32px"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            {detailOpen.type&&<span style={{fontSize:11,fontWeight:600,padding:"3px 10px",border:`1px solid ${C.border2}`,borderRadius:6,color:C.textDim}}>{detailOpen.type}</span>}
            {detailOpen.challenge_rating&&<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",border:`1px solid ${crColor(detailOpen.challenge_rating)}`,borderRadius:6,color:crColor(detailOpen.challenge_rating)}}>GS {detailOpen.challenge_rating}</span>}
            {detailOpen.hp&&<span style={{fontSize:11,fontWeight:600,padding:"3px 10px",border:`1px solid #f87171`,borderRadius:6,color:"#f87171"}}>❤️ {detailOpen.hp} PF</span>}
          </div>
          {detailOpen.description&&<LongText text={detailOpen.description}/>}
          {detailOpen.attacks&&<div style={{marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:6}}>Attacchi</div>
            <div style={{fontSize:14,color:C.textDim,lineHeight:1.65}}>{detailOpen.attacks}</div>
          </div>}
        </div>
      </div>
    </div>}

    {/* Edit/Add Modal */}
    {modal!==null&&<div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:500,width:"92%",maxHeight:"88vh",overflowY:"auto",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>{modal?.id?"Modifica Creatura":"Nuova Creatura"}</div>
        {/* Image */}
        <div style={{marginBottom:13}}>
          <label style={lbl}>Immagine</label>
          <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:6}}>
            {imgPreview?<img src={imgPreview} style={{width:"100%",maxHeight:200,objectFit:"contain",background:C.bg3,borderRadius:10,border:`1px solid ${C.border2}`}}/>
              :<div style={{height:80,background:C.bg3,borderRadius:10,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🐉</div>}
            <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,color:C.textDim,textAlign:"center"}}>
              📷 Scegli immagine
              <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setImgFile(f);setImgPreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
            </label>
          </div>
        </div>
        {/* Name */}
        <div style={{marginBottom:13}}><label style={lbl}>Nome</label><input value={vals.name||""} onChange={e=>setVals(v=>({...v,name:e.target.value}))} placeholder="es. Orsogufo" style={inp}/></div>
        {/* Type */}
        <div style={{marginBottom:13}}>
          <label style={lbl}>Tipo</label>
          <select value={vals.type||"Bestia"} onChange={e=>setVals(v=>({...v,type:e.target.value}))} style={{...inp,cursor:"pointer"}}>
            {TYPES.map(t=><option key={t} value={t} style={{background:C.bg2}}>{t}</option>)}
          </select>
        </div>
        {/* CR & HP */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:13}}>
          <div>
            <label style={lbl}>Grado di Sfida</label>
            <select value={vals.challenge_rating||"1"} onChange={e=>setVals(v=>({...v,challenge_rating:e.target.value}))} style={{...inp,cursor:"pointer"}}>
              {CR.map(r=><option key={r} value={r} style={{background:C.bg2}}>GS {r}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Punti Ferita</label><input value={vals.hp||""} onChange={e=>setVals(v=>({...v,hp:e.target.value}))} placeholder="es. 95 (10d10+40)" style={inp}/></div>
        </div>
        {/* Description */}
        <div style={{marginBottom:13}}><label style={lbl}>Descrizione</label><textarea value={vals.description||""} onChange={e=>setVals(v=>({...v,description:e.target.value}))} placeholder="Descrivi la creatura..." style={{...inp,minHeight:80,resize:"vertical"}}/></div>
        {/* Attacks */}
        <div style={{marginBottom:13}}><label style={lbl}>Attacchi</label><textarea value={vals.attacks||""} onChange={e=>setVals(v=>({...v,attacks:e.target.value}))} placeholder="es. Artigli: +7 colpire, 2d6+4 taglienti..." style={{...inp,minHeight:60,resize:"vertical"}}/></div>
        {/* Buttons */}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setModal(null)}>Annulla</Btn>
          <Btn primary onClick={save} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
        </div>
      </div>
    </div>}
  </div>;
}


// ── PLAYER BESTIARY VIEW ──
function PlayerBestiaryView({data, userId, onUpdate}){
  const [search,setSearch]=useState("");
  const [detailOpen,setDetailOpen]=useState(null);

  const filtered=(data||[]).filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));

  const crColor=(cr)=>{
    const n=parseFloat(cr)||0;
    if(n<=1)return C.green;
    if(n<=5)return C.yellow;
    if(n<=10)return "#fb923c";
    return "#f87171";
  };

  const inp={width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};

  return <div>
    <div style={{marginBottom:16}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Cerca nel bestiario..." style={{...inp,marginTop:0}}/>
    </div>


    {/* Unlocked list */}
    {filtered.length===0?<EmptyState msg="Nessuna creatura nel bestiario"/>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map((c,i)=>(
          <div key={c.id||i} onClick={()=>setDetailOpen(c)} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}}>
            <div style={{width:52,height:52,borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>
              {c.img_url?<img src={c.img_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🐉"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{c.name}</div>
              <div style={{fontSize:11,color:C.textDim,marginTop:2}}>{c.type}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textMuted}}>GS</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:crColor(c.challenge_rating)}}>{c.challenge_rating||"—"}</div>
            </div>
          </div>
        ))}
      </div>}

    {/* Detail panel */}
    {detailOpen&&<div onClick={()=>setDetailOpen(null)} style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",background:C.bg2,borderRadius:"20px 20px 0 0",border:`1px solid ${C.border2}`,width:"100%",maxWidth:640,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px 12px"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:C.gold}}>{detailOpen.name}</span>
          <button onClick={()=>setDetailOpen(null)} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
        </div>
        {detailOpen.img_url&&<div style={{padding:"0 20px 16px"}}>
          <img src={detailOpen.img_url} style={{width:"100%",maxHeight:300,objectFit:"contain",background:C.bg3,borderRadius:12,border:`1px solid ${C.border2}`,display:"block"}}/>
        </div>}
        <div style={{padding:"0 20px 32px"}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            {detailOpen.type&&<span style={{fontSize:11,fontWeight:600,padding:"3px 10px",border:`1px solid ${C.border2}`,borderRadius:6,color:C.textDim}}>{detailOpen.type}</span>}
            {detailOpen.challenge_rating&&<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",border:`1px solid ${crColor(detailOpen.challenge_rating)}`,borderRadius:6,color:crColor(detailOpen.challenge_rating)}}>GS {detailOpen.challenge_rating}</span>}
            {detailOpen.hp&&<span style={{fontSize:11,fontWeight:600,padding:"3px 10px",border:"1px solid #f87171",borderRadius:6,color:"#f87171"}}>❤️ {detailOpen.hp} PF</span>}
          </div>
          {detailOpen.description&&<LongText text={detailOpen.description}/>}
          {detailOpen.attacks&&<div style={{marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:6}}>Attacchi</div>
            <div style={{fontSize:14,color:C.textDim,lineHeight:1.65}}>{detailOpen.attacks}</div>
          </div>}
        </div>
      </div>
    </div>}
  </div>;
}


// ── BASTIONI VIEW ──
function BastioniView({isAuth, onUpdate}){
  const [nave, setNave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editVals, setEditVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [stanzaModal, setStanzaModal] = useState(null);
  const [stanzaVals, setStanzaVals] = useState({});
  const [stanzaImgFile, setStanzaImgFile] = useState(null);
  const [stanzaImgPreview, setStanzaImgPreview] = useState("");

  const load = async () => {
    const {data} = await supabase.from("bastioni").select("*").limit(1).maybeSingle();
    if(data){
      if(typeof data.stanze==="string") try{data.stanze=JSON.parse(data.stanze);}catch(e){data.stanze=[];}
      if(!Array.isArray(data.stanze)) data.stanze=[];
      setNave(data);
      setImgPreview(data.image_url||"");
    }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const saveNave = async () => {
    if(!nave) return;
    setSaving(true);
    try {
      let imageUrl = editVals.image_url || nave.image_url || "";
      if(imgFile){
        const ext = imgFile.name.split(".").pop();
        const path = `bastioni/${Date.now()}.${ext}`;
        const {error:upErr} = await supabase.storage.from("npc-images").upload(path, imgFile, {upsert:true});
        if(!upErr){
          const {data:urlData} = supabase.storage.from("npc-images").getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }
      const numFields = ["scafo_attuale","scafo_max","vele_attuale","vele_max","equipaggio_attuale","equipaggio_max","feriti","caduti","morale","provviste_attuale","provviste_max","giorni_rimasti"];
      const obj = {...editVals, image_url: imageUrl};
      numFields.forEach(f=>{ if(obj[f]!==undefined) obj[f]=parseInt(obj[f])||0; });
      delete obj.id; delete obj.created_at;
      await supabase.from("bastioni").update(obj).eq("id", nave.id);
      setEditing(false); setImgFile(null); load();
    } catch(e){ alert("Errore: "+e.message); }
    setSaving(false);
  };

  const updateField = async (field, value) => {
    if(!nave) return;
    const val = typeof value === "number" ? value : (parseInt(value)||0);
    await supabase.from("bastioni").update({[field]: val}).eq("id", nave.id);
    setNave(n=>({...n, [field]: val}));
  };

  const saveStanza = async () => {
    if(!nave) return;
    setSaving(true);
    try {
      let imgUrl = stanzaVals.img || "";
      if(stanzaImgFile){
        const ext = stanzaImgFile.name.split(".").pop();
        const path = `bastioni/stanze/${Date.now()}.${ext}`;
        const {error:upErr} = await supabase.storage.from("npc-images").upload(path, stanzaImgFile, {upsert:true});
        if(!upErr){
          const {data:urlData} = supabase.storage.from("npc-images").getPublicUrl(path);
          imgUrl = urlData.publicUrl;
        }
      }
      let stanze = [...(nave.stanze||[])];
      if(stanzaModal?.idx !== undefined){
        stanze[stanzaModal.idx] = {...stanzaVals, img: imgUrl};
      } else {
        stanze.push({...stanzaVals, img: imgUrl});
      }
      await supabase.from("bastioni").update({stanze}).eq("id", nave.id);
      setStanzaModal(null); setStanzaImgFile(null); setStanzaImgPreview(""); load();
    } catch(e){ alert("Errore: "+e.message); }
    setSaving(false);
  };

  const deleteStanza = async (idx) => {
    if(!window.confirm("Eliminare questa stanza?")) return;
    const stanze = nave.stanze.filter((_,i)=>i!==idx);
    await supabase.from("bastioni").update({stanze}).eq("id", nave.id);
    load();
  };

  const inp = {width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"};
  const lbl = {display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:2};

  const StatRow = ({label, fieldA, fieldM, note}) => (
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
      <div style={{fontSize:13,color:C.text,fontWeight:600}}>{label}</div>
      <input type="number" value={nave?.[fieldA]||0} onChange={e=>updateField(fieldA,e.target.value)}
        disabled={!isAuth} style={{...inp,marginTop:0,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:C.gold,opacity:isAuth?1:.7}}/>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:C.textDim,textAlign:"center"}}>{nave?.[fieldM]||0}</div>
      <input value={note||""} readOnly style={{...inp,marginTop:0,fontSize:12,color:C.textDim,opacity:.7}}/>
    </div>
  );

  if(loading) return <div style={{textAlign:"center",padding:"60px 20px",color:C.textDim}}>Caricamento...</div>;
  if(!nave) return <EmptyState msg="Nessun bastione trovato"/>;

  return (
    <div style={{maxWidth:700,margin:"0 auto"}}>
      {/* Header nave */}
      <div style={{textAlign:"center",padding:"16px 0 20px"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,color:C.gold,textShadow:`0 0 24px ${C.goldGlow}`}}>{nave.name||"La Nave"}</div>
        <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.textMuted,marginTop:4}}>Bastione del Party</div>
      </div>

      {/* Immagine nave */}
      <div style={{marginBottom:16,position:"relative"}}>
        {nave.image_url
          ? <img src={nave.image_url} style={{width:"100%",borderRadius:12,border:`1px solid ${C.border2}`,maxHeight:400,objectFit:"contain",display:"block",background:C.bg3}}/>
          : <div style={{height:200,background:C.bg3,borderRadius:12,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
              <div style={{fontSize:40,opacity:.3}}>⚓</div>
              <div style={{fontSize:13,color:C.textMuted}}>Nessuna immagine della nave</div>
            </div>}
        {isAuth&&<label style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,.8)",border:`1px solid ${C.border2}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,color:C.textDim}}>
          📷 {nave.image_url?"Cambia":"Carica"} immagine
          <input type="file" accept="image/*" onChange={async e=>{
            const f=e.target.files[0]; if(!f)return;
            const ext=f.name.split(".").pop();
            const path=`bastioni/${Date.now()}.${ext}`;
            const {error:upErr}=await supabase.storage.from("npc-images").upload(path,f,{upsert:true});
            if(upErr){alert("Errore: "+upErr.message);return;}
            const {data:urlData}=supabase.storage.from("npc-images").getPublicUrl(path);
            await supabase.from("bastioni").update({image_url:urlData.publicUrl}).eq("id",nave.id);
            load();
          }} style={{display:"none"}}/>
        </label>}
      </div>

      {/* STATO DELLA NAVE */}
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>⚓ Stato della Nave</span>
          {isAuth&&<Btn onClick={()=>{setEditVals({...nave});setEditing(true);}}>✏ Modifica tutto</Btn>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr",gap:8,marginBottom:8}}>
          {["Statistica","Attuale","Massimo","Note"].map(h=><div key={h} style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textMuted}}>{h}</div>)}
        </div>
        <StatRow label="🛡 Scafo" fieldA="scafo_attuale" fieldM="scafo_max" note="A 0 la nave affonda"/>
        <StatRow label="⛵ Vele" fieldA="vele_attuale" fieldM="vele_max" note="Velocità e manovre"/>
        <StatRow label="👥 Equipaggio" fieldA="equipaggio_attuale" fieldM="equipaggio_max" note={`Feriti: ${nave.feriti||0} • Caduti: ${nave.caduti||0}`}/>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr",gap:8,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,color:C.text,fontWeight:600}}>⚔️ Morale</div>
          <div style={{display:"flex",gap:4}}>
            {[1,2,3,4,5].map(i=>(
              <div key={i} onClick={()=>isAuth&&updateField("morale",i)} style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${C.gold}`,background:i<=(nave.morale||0)?C.gold:"transparent",cursor:isAuth?"pointer":"default"}}/>
            ))}
          </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:C.textDim,textAlign:"center"}}>5</div>
          <div style={{fontSize:12,color:C.textDim}}>0: crisi • 1: svantaggio</div>
        </div>
        <StatRow label="🍞 Provviste" fieldA="provviste_attuale" fieldM="provviste_max" note={`Giorni rimasti: ${nave.giorni_rimasti||0}`}/>
      </Card>

      {/* RUOLI */}
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12}}>⚔️ Ruoli del Party</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          {["Ruolo","Personaggio"].map(h=><div key={h} style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:C.textMuted}}>{h}</div>)}
        </div>
        {[["⚓ Capitano","capitano","Persuasione/Intimidire"],["🗺️ Navigatore","navigatore","Sopravvivenza"],["🔧 Nostromo","nostromo","Atletica/Attrezzi"],["💣 Cannoniere","cannoniere","Percezione/Attacco"]].map(([ruolo,field,prova])=>(
          <div key={field} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ruolo}</div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{prova}</div>
            </div>
            <input value={nave?.[field]||""} onChange={async e=>{
              const v=e.target.value;
              setNave(n=>({...n,[field]:v}));
              await supabase.from("bastioni").update({[field]:v}).eq("id",nave.id);
            }} disabled={!isAuth} placeholder="—" style={{...inp,marginTop:0,opacity:isAuth?1:.7}}/>
          </div>
        ))}
      </Card>

      {/* NOTE */}
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>📝 Note di Viaggio</div>
        <textarea value={nave.note_viaggio||""} onChange={async e=>{
          const v=e.target.value;
          setNave(n=>({...n,note_viaggio:v}));
          await supabase.from("bastioni").update({note_viaggio:v}).eq("id",nave.id);
        }} disabled={!isAuth} placeholder="Note sul viaggio..." style={{...inp,minHeight:100,resize:"vertical",opacity:isAuth?1:.7}}/>
      </Card>

      {/* STANZE */}
      <Card style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>🚪 Stanze della Nave</span>
          {isAuth&&<Btn primary onClick={()=>{setStanzaVals({name:"",description:"",img:""});setStanzaImgPreview("");setStanzaImgFile(null);setStanzaModal({});}}>+ Aggiungi</Btn>}
        </div>
        {(nave.stanze||[]).length===0?<div style={{textAlign:"center",padding:"20px",color:C.textMuted,fontSize:13,fontStyle:"italic"}}>Nessuna stanza ancora</div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {(nave.stanze||[]).map((s,i)=>(
              <div key={i} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
                {s.img?<img src={s.img} style={{width:"100%",height:120,objectFit:"contain",background:C.bg}}/>
                  :<div style={{height:80,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🚪</div>}
                <div style={{padding:10}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:600,color:C.text,marginBottom:4}}>{s.name}</div>
                  {s.description&&<div style={{fontSize:11,color:C.textDim,lineHeight:1.4}}>{s.description}</div>}
                  {isAuth&&<div style={{display:"flex",gap:4,marginTop:8}}>
                    <button onClick={()=>{setStanzaVals({...s});setStanzaImgPreview(s.img||"");setStanzaImgFile(null);setStanzaModal({idx:i});}} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:12}}>✏</button>
                    <button onClick={()=>deleteStanza(i)} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:12}}>🗑</button>
                  </div>}
                </div>
              </div>
            ))}
          </div>}
      </Card>

      {/* EDIT MODAL */}
      {editing&&<div onClick={()=>setEditing(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:500,width:"92%",maxHeight:"88vh",overflowY:"auto",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>✏ Modifica Nave</div>
          <div style={{marginBottom:12}}><label style={lbl}>Nome Nave</label><input value={editVals.name||""} onChange={e=>setEditVals(v=>({...v,name:e.target.value}))} style={inp}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[["scafo_attuale","Scafo Attuale"],["scafo_max","Scafo Max"],["vele_attuale","Vele Attuali"],["vele_max","Vele Max"],["equipaggio_attuale","Equipaggio"],["equipaggio_max","Equipaggio Max"],["feriti","Feriti"],["caduti","Caduti"],["provviste_attuale","Provviste"],["provviste_max","Provviste Max"],["giorni_rimasti","Giorni Rimasti"]].map(([k,l])=>(
              <div key={k}><label style={lbl}>{l}</label><input type="number" value={editVals[k]||0} onChange={e=>setEditVals(v=>({...v,[k]:e.target.value}))} style={inp}/></div>
            ))}
          </div>
          <div style={{marginBottom:12}}><label style={lbl}>Note</label><textarea value={editVals.note||""} onChange={e=>setEditVals(v=>({...v,note:e.target.value}))} style={{...inp,minHeight:60,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setEditing(false)}>Annulla</Btn>
            <Btn primary onClick={saveNave} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
          </div>
        </div>
      </div>}

      {/* STANZA MODAL */}
      {stanzaModal!==null&&<div onClick={()=>setStanzaModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:440,width:"92%",maxHeight:"88vh",overflowY:"auto",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>{stanzaModal?.idx!==undefined?"Modifica Stanza":"Nuova Stanza"}</div>
          <div style={{marginBottom:12}}>
            <label style={lbl}>Immagine</label>
            <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:6}}>
              {stanzaImgPreview?<img src={stanzaImgPreview} style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:10,border:`1px solid ${C.border2}`}}/>
                :<div style={{height:80,background:C.bg3,borderRadius:10,border:`2px dashed ${C.border2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🚪</div>}
              <label style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,color:C.textDim,textAlign:"center"}}>
                📷 Scegli foto
                <input type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setStanzaImgFile(f);setStanzaImgPreview(URL.createObjectURL(f));}}} style={{display:"none"}}/>
              </label>
            </div>
          </div>
          <div style={{marginBottom:12}}><label style={lbl}>Nome</label><input value={stanzaVals.name||""} onChange={e=>setStanzaVals(v=>({...v,name:e.target.value}))} placeholder="es. Cabina del Capitano" style={inp}/></div>
          <div style={{marginBottom:16}}><label style={lbl}>Descrizione</label><textarea value={stanzaVals.description||""} onChange={e=>setStanzaVals(v=>({...v,description:e.target.value}))} placeholder="Cosa c'è in questa stanza..." style={{...inp,minHeight:80,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setStanzaModal(null)}>Annulla</Btn>
            <Btn primary onClick={saveStanza} disabled={saving}>{saving?"Salvo...":"Salva"}</Btn>
          </div>
        </div>
      </div>}
    </div>
  );
}





export default function App(){
  const [user,setUser]=useState(()=>{
    try{
      const s=localStorage.getItem("tp_user");
      return s?JSON.parse(s):null;
    }catch(e){return null;}
  });
  const [authChecked,setAuthChecked]=useState(false);
  const [data,setData]=useState({sessioni:[],npc:[],gilda:[],fazioni:[],mondo:[],cronologia:[],map_pins:[],map_config:null,bestiario:[],mercato:[],guild_rules:null});
  const [loading,setLoading]=useState(true);
  const [view,setView]=useState("sessioni");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [npcOpen,setNpcOpen]=useState(null);
  const [npcModal,setNpcModal]=useState(null);
  const [genericModal,setGenericModal]=useState(null);
  const [genericVals,setGenericVals]=useState({});
  const [saving,setSaving]=useState(false);
  const [pinModal,setPinModal]=useState(null);
  const [pinVals,setPinVals]=useState({});
  const [mapUploading,setMapUploading]=useState(false);
  const [maps,setMaps]=useState([]);
  const [selectedMap,setSelectedMap]=useState(null);
  const [mapNameModal,setMapNameModal]=useState(false);
  const [newMapName,setNewMapName]=useState("");
  const [pendingPin,setPendingPin]=useState(false);
  const [players,setPlayers]=useState([]);
  const [selectedPlayer,setSelectedPlayer]=useState(null);
  const [rulesOpen,setRulesOpen]=useState(false);
  const [rulesEditing,setRulesEditing]=useState(false);
  const [rulesDraft,setRulesDraft]=useState("");
  const [rulesSaving,setRulesSaving]=useState(false);

  const isAuth = user?.role==="dm";
  const TITLES={sessioni:"Sessioni",npc:"NPC",mappa:"Mappa",gilda:"Gilda",fazioni:"Fazioni",mondo:"Fogli del Mondo",cronologia:"Cronologia",mercato:"Mercato",bestiario:"Bestiario Scoperto"};

  const handleLogin = (u) => {
    setUser(u);
    try{localStorage.setItem("tp_user",JSON.stringify(u));}catch(e){}
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    try{localStorage.removeItem("tp_user");}catch(e){}
  };

  const loadAll=async()=>{
    setLoading(true);
    try{
      const [npcs,sessions,factions,locations,timeline,map_pins,map_config,playersRes,bestiary,mercatoRes,guildRulesRes]=await Promise.all([
        supabase.from("npcs").select("*").order("created_at",{ascending:false}),
        supabase.from("sessions").select("*").order("created_at",{ascending:false}),
        supabase.from("factions").select("*").order("created_at",{ascending:false}),
        supabase.from("locations").select("*").order("created_at",{ascending:false}),
        supabase.from("timeline").select("*").order("created_at",{ascending:false}),
        supabase.from("map_pins").select("*").order("created_at",{ascending:false}),
        supabase.from("map_config").select("*").order("id"),
        supabase.from("player_characters").select("*").order("name"),
        supabase.from("bestiary").select("*").order("name"),
        supabase.from("mercato").select("*").order("name"),
        supabase.from("guild_rules").select("*").limit(1),
      ]);
      const parsed=(playersRes.data||[]).map(p=>{
        if(typeof p.attacks==="string")try{p.attacks=JSON.parse(p.attacks);}catch(e){p.attacks=[];}
        if(!Array.isArray(p.attacks))p.attacks=[];
        if(typeof p.spell_slots==="string")try{p.spell_slots=JSON.parse(p.spell_slots);}catch(e){p.spell_slots={};}
        if(typeof p.coins==="string")try{p.coins=JSON.parse(p.coins);}catch(e){p.coins={};}
        if(typeof p.potions==="string")try{p.potions=JSON.parse(p.potions);}catch(e){p.potions={};}
        return p;
      });
      setPlayers(parsed);
      const allMaps = map_config.data||[];
      setMaps(allMaps);
      if(allMaps.length>0 && !selectedMap) setSelectedMap(s=>s||allMaps[0]);
      setData(d=>({...d,
        npc:npcs.data||[],sessioni:sessions.data||[],gilda:(factions.data||[]).filter(f=>f.tipo==="gilda"||(!f.tipo&&false)),
        fazioni:(factions.data||[]).filter(f=>f.tipo!=="gilda"),mondo:locations.data||[],cronologia:timeline.data||[],map_pins:map_pins.data||[],map_config:map_config.data?.[0]||null,
        bestiario:bestiary.data||[],mercato:mercatoRes.data||[],
        guild_rules:guildRulesRes.data?.[0]||null,
      }));
    }catch(e){console.error(e);}
    setLoading(false);
  };

  // Restore Supabase session on page load
  useEffect(()=>{
    const restoreSession = async () => {
      const {data:{session}} = await supabase.auth.getSession();
      if(session && !user){
        const {data:profile} = await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        if(profile && profile.role==="player"){
          const restored = {role:"player", name:profile.character_name, email:session.user.email, userId:session.user.id, profile};
          setUser(restored);
          try{localStorage.setItem("tp_user",JSON.stringify(restored));}catch(e){}
        }
      }
      setAuthChecked(true);
    };
    restoreSession();
  },[]);

  useEffect(()=>{
    if(user?.role==="dm"){ loadAll(); }
  },[user]);

  if(!authChecked && !user) return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.textDim,fontSize:14}}>Caricamento...</div>;
  if(!user) return <LoginScreen onLogin={handleLogin}/>;
  if(user.role==="player") return <PlayerView user={user} onLogout={handleLogout}/>;

  const nav=(v)=>{
    if(!v.startsWith("player_")) setSelectedPlayer(null);
    setView(v);setSidebarOpen(false);
    loadAll();
  };

  const openNpcAdd=()=>setNpcModal({});
  const openNpcEdit=(npc)=>setNpcModal(npc);
  const deleteNpc=async(id)=>{if(!window.confirm("Eliminare?"))return;await supabase.from("npcs").delete().eq("id",id);loadAll();};

  const openGenericAdd=()=>{setGenericVals({});setGenericModal({view,item:null});};
  const openGenericEdit=(v,item)=>{setGenericVals({...item});setGenericModal({view:v,item});};

  const saveGuildRules=async()=>{
    setRulesSaving(true);
    try{
      if(data.guild_rules?.id){
        await supabase.from("guild_rules").update({text:rulesDraft,updated_at:new Date().toISOString()}).eq("id",data.guild_rules.id);
      }else{
        await supabase.from("guild_rules").insert({text:rulesDraft});
      }
      setRulesEditing(false);
      await loadAll();
    }catch(e){alert("Errore: "+e.message);}
    setRulesSaving(false);
  };
  const saveGeneric=async(imgUrl=null,imgField=null)=>{
    if(!genericModal)return;
    setSaving(true);
    const cfg=TABLE_MAP[genericModal.view];
    if(!cfg){setSaving(false);return;}
    const numFields=["influence","hp","hpMax","ca","livello","for","des","cos","int","sag","car"];
    const obj={...genericVals};
    if(imgUrl&&imgField)obj[imgField]=imgUrl;
    numFields.forEach(f=>{if(obj[f]!==undefined)obj[f]=parseInt(obj[f])||0;});
    if(obj.locked!==undefined)obj.locked=obj.locked==="true"||obj.locked===true;
    delete obj.id;delete obj.created_at;
    try{
      if(cfg.tipo && !obj.tipo) obj.tipo = cfg.tipo;
      if(genericModal.item?.id){await supabase.from(cfg.table).update(obj).eq("id",genericModal.item.id);}
      else{await supabase.from(cfg.table).insert(obj);}
      setGenericModal(null);loadAll();
    }catch(e){alert("Errore: "+e.message);}
    setSaving(false);
  };
  const deleteGeneric=async(v,id)=>{
    if(!window.confirm("Eliminare?"))return;
    const cfg=TABLE_MAP[v];if(!cfg)return;
    await supabase.from(cfg.table).delete().eq("id",id);loadAll();
  };

  const openAdd=()=>{if(view==="npc")openNpcAdd();else if(TABLE_MAP[view])openGenericAdd();};

  const EditBtns=({v,item})=>isAuth?<div style={{display:"flex",gap:6,marginTop:10,paddingTop:9,borderTop:`1px solid ${C.border}`}}>
    <Btn onClick={()=>{if(v==="npc")openNpcEdit(item);else openGenericEdit(v,item);}}>✏ Modifica</Btn>
    <Btn onClick={()=>{if(v==="npc")deleteNpc(item.id);else deleteGeneric(v,item.id);}}>✕</Btn>
  </div>:null;

  const renderContent=()=>{
    if(loading)return <div style={{textAlign:"center",padding:"60px 20px",color:C.textDim,fontSize:14}}>Caricamento...</div>;
    switch(view){
      case "sessioni":return !data.sessioni.length?<EmptyState msg="Nessuna sessione ancora"/>:
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

      case "npc":return !data.npc.length?<EmptyState msg="Nessun NPC ancora"/>:
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

      case "gilda":{
        const gradoOrd={"Adamantio":5,"Platino":4,"Oro":3,"Argento":2,"Ferro":1};
        const gradoColor={"Ferro":"#a0522d","Argento":"#c0c0c0","Oro":C.gold,"Platino":"#e5e4e2","Adamantio":"#b9f2ff"};
        const sortedGilda=[...data.gilda].sort((a,b)=>(gradoOrd[b.grado]||0)-(gradoOrd[a.grado]||0));
        const gradiDM=["Adamantio","Platino","Oro","Argento","Ferro"];
        return <div>
          <div style={{textAlign:"center",padding:"16px 0 20px"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold,textShadow:`0 0 24px ${C.goldGlow}`}}>La Gilda</div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:".2em",textTransform:"uppercase",color:C.textMuted,marginTop:4}}>Fratellanza & Alleanze</div>
          </div>
          <div onClick={()=>{setRulesDraft(data.guild_rules?.text||"");setRulesEditing(false);setRulesOpen(true);}} style={{display:"flex",alignItems:"center",gap:10,background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:12,padding:"12px 14px",marginBottom:16,cursor:"pointer"}}>
            <span style={{fontSize:18}}>📜</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:C.gold,flex:1}}>Regole di Gilda</span>
            <span style={{fontSize:12,color:C.textMuted}}>Come funziona la fama ›</span>
          </div>
          {!data.gilda.length?<EmptyState msg="Nessun gruppo nella gilda ancora"/>:
            gradiDM.map(grado=>{
              const gruppi=sortedGilda.filter(g=>g.grado===grado);
              if(!gruppi.length)return null;
              return <div key={grado} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:gradoColor[grado]}}>{grado}</div>
                  <div style={{flex:1,height:1,background:gradoColor[grado],opacity:.3}}/>
                </div>
                {gruppi.map((g,i)=>(
                  <div key={g.id||i} onClick={()=>setNpcOpen(g)} style={{display:"flex",alignItems:"center",gap:12,background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${gradoColor[g.grado]||C.gold}`,borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
                    <div style={{width:48,height:48,borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,flexShrink:0,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                      {g.img_url?<img src={g.img_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🏴"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{g.name}</div>
                      {g.sede&&<div style={{fontSize:11,color:C.textDim,marginTop:2}}>📍 {g.sede}</div>}
                    </div>
                    {g.influence!=null&&<div style={{fontSize:12,fontWeight:600,color:gradoColor[g.grado]||C.gold,marginRight:8}}>{g.influence}%</div>}
                    {isAuth&&<div onClick={e=>{e.stopPropagation();}} style={{display:"flex",flexDirection:"column",gap:4}}>
                      <Btn onClick={()=>openGenericEdit("gilda",g)}>✏</Btn>
                      <Btn onClick={()=>deleteGeneric("gilda",g.id)}>✕</Btn>
                    </div>}
                  </div>
                ))}
              </div>;
            })
          }
          {rulesOpen&&<div onClick={()=>setRulesOpen(false)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.85)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:560,width:"100%",maxHeight:"80vh",overflowY:"auto",padding:24,boxShadow:`0 0 40px ${C.goldGlow}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold}}>📜 Regole di Gilda</span>
                <button onClick={()=>setRulesOpen(false)} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
              </div>
              {rulesEditing?<>
                <textarea value={rulesDraft} onChange={e=>setRulesDraft(e.target.value)} rows={14} placeholder="Scrivi qui le regole di gilda, come funziona la fama, ecc..." style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,fontFamily:"inherit",fontSize:14,padding:12,outline:"none",boxSizing:"border-box",lineHeight:1.6,resize:"vertical"}}/>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <Btn onClick={()=>{setRulesEditing(false);setRulesDraft(data.guild_rules?.text||"");}} style={{flex:1}}>Annulla</Btn>
                  <Btn primary onClick={saveGuildRules} disabled={rulesSaving} style={{flex:1}}>{rulesSaving?"Salvataggio...":"Salva"}</Btn>
                </div>
              </>:<>
                {data.guild_rules?.text
                  ?<RulesText text={data.guild_rules.text}/>
                  :<div style={{color:C.textMuted,fontSize:13,fontStyle:"italic",marginBottom:12}}>Nessuna regola scritta ancora.</div>}
                <Btn primary onClick={()=>setRulesEditing(true)} style={{marginTop:12,width:"100%"}}>✏ {data.guild_rules?.text?"Modifica":"Scrivi"} regole</Btn>
              </>}
            </div>
          </div>}
        </div>;
      }
      case "fazioni":return !data.fazioni.length?<EmptyState msg="Nessuna fazione ancora"/>:
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {data.fazioni.map((f,i)=>(
            <div key={f.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,display:"flex",gap:12}}>
              <div style={{width:44,height:44,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.icon||"⚔️"}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{f.name}</div>
                <div style={{fontSize:12,color:C.textDim,fontStyle:"italic",margin:"3px 0 7px",lineHeight:1.5}}>{f.description}</div>
                <div style={{height:3,background:C.bg3,borderRadius:2,overflow:"hidden",marginTop:6}}><div style={{height:"100%",width:`${f.influence||0}%`,background:`linear-gradient(90deg,${C.goldDim},${C.gold})`}}/></div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>Influenza: {f.influence||0}%</div>
                <EditBtns v="fazioni" item={f}/>
              </div>
            </div>
          ))}
        </div>;

      case "mondo":return !data.mondo.length?<EmptyState msg="Nessun luogo ancora"/>:
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

      case "cronologia":return !data.cronologia.length?<EmptyState msg="Nessun evento ancora"/>:
        <div style={{position:"relative",paddingLeft:26}}>
          <div style={{position:"absolute",left:5,top:0,bottom:0,width:1,background:`linear-gradient(to bottom,${C.goldDim},transparent)`}}/>
          {data.cronologia.map((c,i)=>(
            <div key={c.id||i} style={{position:"relative",paddingLeft:16,paddingBottom:20}}>
              <div style={{position:"absolute",left:-21,top:5,width:8,height:8,border:`1px solid ${C.goldDim}`,background:C.bg,transform:"rotate(45deg)"}}/>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.goldDim,marginBottom:3}}>{c.date}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.55}}>{c.description}</div>
              {c.image_path&&<img src={c.image_path} alt={c.title} style={{width:"100%",borderRadius:10,border:`1px solid ${C.border2}`,objectFit:"contain",background:C.bg3,maxHeight:200,marginTop:8,display:"block"}}/>}
              <EditBtns v="cronologia" item={c}/>
            </div>
          ))}
        </div>;



      case "mappa":{
        const curMap = selectedMap || maps[0];
        const mapImg = curMap?.map_path;
        return <div>
          {/* Selettore mappe */}
          {maps.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,overflowX:"auto"}}>
            {maps.map((m,i)=>(
              <button key={m.id||i} onClick={()=>setSelectedMap(m)}
                style={{fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:8,border:`1px solid ${selectedMap?.id===m.id?C.gold:C.border2}`,background:selectedMap?.id===m.id?`rgba(212,160,23,.15)`:"transparent",color:selectedMap?.id===m.id?C.gold:C.textDim,cursor:"pointer",whiteSpace:"nowrap"}}>
                🗺️ {m.name||`Mappa ${i+1}`}
              </button>
            ))}
            {isAuth&&<Btn onClick={()=>{setNewMapName("");setMapNameModal(true);}}>+ Nuova mappa</Btn>}
          </div>}
          {/* Mappa corrente */}
          <div style={{position:"relative",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
            {mapImg?<div style={{position:"relative"}}>
                <img src={mapImg} style={{width:"100%",display:"block",borderRadius:12,maxHeight:520,objectFit:"contain"}}/>
                {data.map_pins.filter(p=>!p.map_id||(curMap&&p.map_id===curMap.id)).map((pin,i)=>(
                  <div key={pin.id||i} onClick={()=>setPinModal({item:pin,view:"pin_detail"})}
                    style={{position:"absolute",left:`${pin.x_percent}%`,top:`${pin.y_percent}%`,transform:"translate(-50%,-50%)",cursor:"pointer",zIndex:10}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:pin.status==="nemico"?"#f87171":pin.status==="alleato"?"#4ade80":C.gold,border:"2px solid #fff",boxShadow:"0 0 8px rgba(0,0,0,.6)"}}/>
                    <div style={{position:"absolute",bottom:"calc(100% + 4px)",left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,.85)",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:4,whiteSpace:"nowrap"}}>{pin.name}</div>
                  </div>
                ))}
                {pendingPin&&<div style={{position:"absolute",inset:0,cursor:"crosshair",zIndex:21}} onClick={e=>{
                  const rect=e.currentTarget.getBoundingClientRect();
                  const x=((e.clientX-rect.left)/rect.width*100).toFixed(1);
                  const y=((e.clientY-rect.top)/rect.height*100).toFixed(1);
                  setPinVals({x_percent:x,y_percent:y,name:"",description:"",status:"neutrale"});
                  setPendingPin(false);setPinModal({item:null,view:"pin_form"});
                }}/>}
                {pendingPin&&<div style={{position:"absolute",inset:0,background:"rgba(212,160,23,.08)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,pointerEvents:"none"}}>
                  <div style={{background:"rgba(0,0,0,.8)",color:C.gold,padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600}}>Clicca sulla mappa per posizionare il pin</div>
                </div>}
              </div>
              :<div style={{height:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
                <div style={{fontSize:40,opacity:.3}}>🗺️</div>
                <div style={{fontSize:13,color:C.textMuted}}>{maps.length===0?"Nessuna mappa caricata":"Carica un'immagine per questa mappa"}</div>
              </div>}
          </div>
          {isAuth&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {curMap&&<label style={{background:C.bg2,border:`1px solid ${C.border2}`,color:C.textDim,fontWeight:600,fontSize:12,padding:"7px 14px",borderRadius:8,cursor:"pointer"}}>
              {mapImg?"🗺️ Cambia immagine":"📷 Carica immagine"}
              <input type="file" accept="image/*" onChange={async e=>{
                const f=e.target.files[0];if(!f)return;
                setMapUploading(true);
                const path=`maps/${Date.now()}.${f.name.split(".").pop()}`;
                const {error:upErr}=await supabase.storage.from("map-images").upload(path,f,{upsert:true});
                if(upErr){alert("Errore: "+upErr.message);setMapUploading(false);return;}
                const {data:urlData}=supabase.storage.from("map-images").getPublicUrl(path);
                await supabase.from("map_config").update({map_path:urlData.publicUrl}).eq("id",curMap.id);
                setMapUploading(false);loadAll();
              }} style={{display:"none"}}/>
            </label>}
            {mapImg&&<Btn primary onClick={()=>setPendingPin(true)}>+ Aggiungi Pin</Btn>}
            {curMap&&maps.length>1&&isAuth&&<Btn onClick={async()=>{if(!window.confirm("Eliminare questa mappa?"))return;await supabase.from("map_config").delete().eq("id",curMap.id);setSelectedMap(null);loadAll();}}>🗑 Elimina mappa</Btn>}
          </div>}
          {mapUploading&&<div style={{fontSize:12,color:C.gold,marginTop:8}}>Caricamento in corso...</div>}
          {/* Modal nuova mappa */}
          {mapNameModal&&<div onClick={()=>setMapNameModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:380,width:"92%",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>🗺️ Nuova Mappa</div>
              <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim,marginBottom:4}}>Nome</label>
              <input value={newMapName} onChange={e=>setNewMapName(e.target.value)} placeholder="es. Mappa del Mondo, Città di Arenmar..." style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",boxSizing:"border-box",marginBottom:16}}/>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <Btn onClick={()=>setMapNameModal(false)}>Annulla</Btn>
                <Btn primary onClick={async()=>{
                  if(!newMapName.trim())return;
                  const {data:newMap}=await supabase.from("map_config").insert({name:newMapName.trim(),map_path:""}).select().single();
                  setMapNameModal(false);
                  if(newMap){setSelectedMap(newMap);}
                  loadAll();
                }}>Crea</Btn>
              </div>
            </div>
          </div>}
        </div>;
      }

      case "mercato": return <MercatoView isAuth={isAuth} data={data.mercato} onUpdate={loadAll}/>;
      case "bestiario": return <BestiaryView isAuth={isAuth} data={data.bestiario} onUpdate={loadAll}/>;

      case "bastioni": return <BastioniView isAuth={isAuth} onUpdate={loadAll}/>;

      default:
        if(view.startsWith("player_") && selectedPlayer){
          return <DmPlayerView player={selectedPlayer} onUpdate={loadAll}/>;
        }
        return <EmptyState msg="In costruzione"/>;
    }
  };

  const navItems=[
    {v:"sessioni",icon:"📜",label:"Sessioni"},{v:"gilda",icon:"🏴",label:"Gilda"},
    {v:"npc",icon:"👤",label:"NPC"},{v:"mappa",icon:"🗺️",label:"Mappa"},
    {v:"fazioni",icon:"⚔️",label:"Fazioni"},{v:"mondo",icon:"🌍",label:"Fogli del Mondo"},
    {v:"cronologia",icon:"⏳",label:"Cronologia"},{v:"mercato",icon:"🪙",label:"Mercato"},
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
        <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>Party</div>
        <div onClick={()=>nav("bastioni")} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,color:view==="bastioni"?C.gold:C.textDim,background:view==="bastioni"?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view==="bastioni"?C.gold:"transparent"}`}}>
          <span style={{fontSize:14,width:18,textAlign:"center"}}>⚓</span>Bastioni
        </div>
        <div onClick={()=>nav("bestiario")} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,color:view==="bestiario"?C.gold:C.textDim,background:view==="bestiario"?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view==="bestiario"?C.gold:"transparent"}`}}>
          <span style={{fontSize:14,width:18,textAlign:"center"}}>🐉</span>Bestiario Scoperto
        </div>
      </div>
      {players.length>0&&<>
        <div style={{height:1,background:C.border,margin:"6px 18px"}}/>
        <div style={{padding:"14px 0 6px"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>La Compagnia</div>
          {players.map((p,i)=>{
            const vkey = `player_${p.id}`;
            const name = p.name || "Player";
            return <div key={i} onClick={()=>{setSelectedPlayer(p);nav(vkey);}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",cursor:"pointer",background:view===vkey?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view===vkey?C.gold:"transparent"}`}}>
              <span style={{fontSize:14,flexShrink:0}}>{partyIcon(name)}</span>
              <div style={{fontSize:13,color:view===vkey?C.gold:C.textDim,fontWeight:view===vkey?500:400}}>{name}</div>
              <div style={{marginLeft:"auto",fontSize:10,color:C.textMuted}}>{p.hp}/{p.max_hp}</div>
            </div>;
          })}
        </div>
      </>}
      <div style={{marginTop:"auto",padding:"14px 18px",borderTop:`1px solid ${C.border}`}}>
        <Btn onClick={handleLogout} style={{width:"100%"}}>Esci</Btn>
      </div>
    </aside>
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px",borderBottom:`1px solid ${C.border}`,background:C.bg2,gap:10,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"none",border:`1px solid ${C.border2}`,borderRadius:8,color:C.textDim,fontSize:16,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>☰</button>
          <div style={{width:26,height:26,borderRadius:"50%",background:`radial-gradient(circle at 35% 35%,${C.gold},${C.goldDim})`,boxShadow:`0 0 10px ${C.goldGlow}`,flexShrink:0}}/>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.gold,letterSpacing:".06em"}}>{TITLES[view]||(view.startsWith("player_")&&selectedPlayer?selectedPlayer.name:view)}</span>
        </div>
        {(TABLE_MAP[view]||view==="npc")&&<button onClick={openAdd} style={{fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:8,background:C.gold,color:"#0b1120",border:"none",cursor:"pointer"}}>+ Aggiungi</button>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>{renderContent()}</div>
    </div>
    <NpcPanel npc={npcOpen} onClose={()=>setNpcOpen(null)}/>
    {npcModal&&<NpcFormModal npc={npcModal?.id?npcModal:null} onClose={()=>setNpcModal(null)} onSaved={()=>{setNpcModal(null);loadAll();}}/>}
    {genericModal&&<GenericModal
      title={genericModal.item?"Modifica":"Aggiungi"}
      fields={TABLE_MAP[genericModal.view]?.fields||[]}
      vals={genericVals}
      onClose={()=>setGenericModal(null)}
      onSave={saveGeneric}
      saving={saving}
      onChange={(id,val)=>setGenericVals(v=>({...v,[id]:val}))}
      hasImage={TABLE_MAP[genericModal.view]?.hasImage||false}
      imageBucket={TABLE_MAP[genericModal.view]?.imageBucket||""}
      imageField={TABLE_MAP[genericModal.view]?.imageField||"image_path"}
    />}
    {pinModal?.view==="pin_detail"&&pinModal.item&&<div onClick={()=>setPinModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:640,padding:"20px 20px 32px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:C.gold}}>{pinModal.item.name}</span>
          <button onClick={()=>setPinModal(null)} style={{background:"none",border:"none",fontSize:22,color:C.textDim,cursor:"pointer"}}>✕</button>
        </div>
        {pinModal.item.status&&<Tag t={pinModal.item.status}/>}
        {pinModal.item.description&&<div style={{fontSize:14,color:C.textDim,lineHeight:1.75,marginTop:10}}>{pinModal.item.description}</div>}
        {isAuth&&<div style={{display:"flex",gap:8,marginTop:16}}>
          <Btn onClick={()=>{setPinVals({...pinModal.item});setPinModal({item:pinModal.item,view:"pin_form"});}}>✏ Modifica</Btn>
          <Btn onClick={async()=>{if(!window.confirm("Eliminare?"))return;await supabase.from("map_pins").delete().eq("id",pinModal.item.id);setPinModal(null);loadAll();}}>✕ Elimina</Btn>
        </div>}
      </div>
    </div>}
    {pinModal?.view==="pin_form"&&<div onClick={()=>setPinModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:16,maxWidth:440,width:"92%",padding:20,boxShadow:`0 0 40px ${C.goldGlow}`}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:C.gold,marginBottom:16}}>{pinModal.item?"Modifica Pin":"Nuovo Pin"}</div>
        {[{id:"name",l:"Nome",ph:"Es. Città di Arenmar"},{id:"description",l:"Descrizione",ph:"...",ta:true}].map(f=>(
          <div key={f.id} style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim}}>{f.l}</label>
            {f.ta?<textarea value={pinVals[f.id]||""} onChange={e=>setPinVals(v=>({...v,[f.id]:e.target.value}))} placeholder={f.ph} style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,minHeight:80,resize:"vertical",boxSizing:"border-box"}}/>
              :<input value={pinVals[f.id]||""} onChange={e=>setPinVals(v=>({...v,[f.id]:e.target.value}))} placeholder={f.ph} style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,boxSizing:"border-box"}}/>}
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".15em",textTransform:"uppercase",color:C.textDim}}>Stato</label>
          <select value={pinVals.status||"neutrale"} onChange={e=>setPinVals(v=>({...v,status:e.target.value}))} style={{width:"100%",background:C.bg,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontFamily:"inherit",fontSize:14,padding:"8px 12px",outline:"none",marginTop:4,cursor:"pointer"}}>
            {["neutrale","alleato","nemico","sconosciuto"].map(o=><option key={o} value={o} style={{background:C.bg2}}>{o}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setPinModal(null)}>Annulla</Btn>
          <Btn primary onClick={async()=>{
            const obj={name:pinVals.name,description:pinVals.description,status:pinVals.status,x_percent:parseFloat(pinVals.x_percent)||0,y_percent:parseFloat(pinVals.y_percent)||0};
            if(pinModal.item?.id){await supabase.from("map_pins").update(obj).eq("id",pinModal.item.id);}
            else{await supabase.from("map_pins").insert(obj);}
            setPinModal(null);loadAll();
          }}>Salva</Btn>
        </div>
      </div>
    </div>}
  </div>;
}
