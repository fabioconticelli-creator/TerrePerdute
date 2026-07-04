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
  const [campData, setCampData] = useState({sessioni:[],npc:[],gilda:[],fazioni:[],mondo:[],cronologia:[],map_pins:[],map_config:null});
  const [npcOpen, setNpcOpen] = useState(null);

  const charTabs = ["scheda","inventario","famigli","note sessione"];

  const load = async () => {
    const [charRes, invRes, notesRes, npcs, sessions, factions, locations, timeline, map_pins, map_config] = await Promise.all([
      supabase.from("player_characters").select("*").eq("player_id", user.userId).maybeSingle(),
      supabase.from("player_inventory").select("*").eq("player_id", user.userId).order("created_at"),
      supabase.from("player_session_notes").select("*").eq("player_id", user.userId).order("created_at",{ascending:false}),
      supabase.from("npcs").select("*").order("created_at",{ascending:false}),
      supabase.from("sessions").select("*").order("created_at",{ascending:false}),
      supabase.from("factions").select("*").order("created_at",{ascending:false}),
      supabase.from("locations").select("*").order("created_at",{ascending:false}),
      supabase.from("timeline").select("*").order("created_at",{ascending:false}),
      supabase.from("map_pins").select("*").order("created_at",{ascending:false}),
      supabase.from("map_config").select("*").limit(1),
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
      sessioni:sessions.data||[], npc:npcs.data||[], gilda:factions.data||[],
      fazioni:factions.data||[], mondo:locations.data||[], cronologia:timeline.data||[],
      map_pins:map_pins.data||[], map_config:map_config.data?.[0]||null,
    });
    setLoading(false);
  };

  useEffect(()=>{ load(); const i=setInterval(load,30000); return()=>clearInterval(i); },[user.userId]);

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
    {v:"cronologia",icon:"⏳",label:"Cronologia"},
    {v:"gilda",icon:"🏴",label:"Gilda"},
    {v:"fazioni",icon:"⚔️",label:"Fazioni"},
    {v:"npc",icon:"👤",label:"NPC"},
    {v:"mondo",icon:"🌍",label:"Fogli del Mondo"},
    {v:"mappa",icon:"🗺️",label:"Mappa"},
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
      case "gilda": return !campData.gilda.length?<EmptyState msg="Nessuna gilda ancora"/>:
        <div>{campData.gilda.map((g,i)=>(
          <div key={g.id||i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderLeft:`3px solid ${C.gold}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <div style={{width:44,height:44,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{g.icon||"🏴"}</div>
              <div><div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,color:C.text}}>{g.name}</div>{g.rank&&<div style={{fontSize:10,fontWeight:600,letterSpacing:".15em",textTransform:"uppercase",color:C.gold,marginTop:2}}>{g.rank}</div>}</div>
            </div>
            {g.description&&<div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.55}}>{g.description}</div>}
          </div>
        ))}</div>;
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
              {c.image_path&&<img src={c.image_path} alt={c.title} style={{width:"100%",borderRadius:10,border:`1px solid ${C.border2}`,objectFit:"cover",maxHeight:160,marginTop:8,display:"block"}}/>}
            </div>
          ))}
        </div>;
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
      default: return null;
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
            <div key={v} onClick={()=>{setView(v);setSidebarOpen(false);}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:view===v?500:400,color:view===v?C.gold:C.textDim,background:view===v?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view===v?C.gold:"transparent"}`,userSelect:"none"}}>
              <span style={{fontSize:14,width:18,textAlign:"center"}}>{icon}</span>{label}
            </div>
          ))}
        </div>
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
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {[["CA",char.ac||0],["Livello",char.level||1],["Background",char.background||"—"]].map(([l,v])=>(
                      <div key={l} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
                        <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:C.textDim}}>{l}</div>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:typeof v==="number"?22:13,fontWeight:700,color:C.text,marginTop:3}}>{v}</div>
                      </div>
                    ))}
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
                      {ABILITA.map(a=>(
                        <div key={a.n} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 2px"}}>
                          <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${C.border2}`,flexShrink:0}}/>
                          <div style={{fontSize:12,fontWeight:600,color:C.text,width:28}}>{fmtMod(mod(char[a.s]||10))}</div>
                          <div style={{fontSize:11,color:C.textDim,flex:1}}>{a.n}</div>
                        </div>
                      ))}
                    </Card>
                    <Card>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Tiri Salvezza</div>
                      {[["FOR","str"],["DES","dex"],["COS","con"],["INT","int"],["SAG","wis"],["CAR","cha"]].map(([l,k])=>(
                        <div key={k} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 2px"}}>
                          <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${C.border2}`,flexShrink:0}}/>
                          <div style={{fontSize:12,fontWeight:600,color:C.text,width:28}}>{fmtMod(mod(char[k]||10))}</div>
                          <div style={{fontSize:11,color:C.textDim,flex:1}}>{l}</div>
                        </div>
                      ))}
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
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[["CA",char.ac||0],["Livello",char.level||1],["Background",char.background||"—"]].map(([l,v])=>(
            <div key={l} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:C.textDim}}>{l}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:typeof v==="number"?22:13,fontWeight:700,color:C.text,marginTop:3}}>{v}</div>
            </div>
          ))}
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
        <Card style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",color:C.gold,marginBottom:10}}>Abilità</div>
          {ABILITA.map(a=>(
            <div key={a.n} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 2px"}}>
              <div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${C.border2}`,flexShrink:0}}/>
              <div style={{fontSize:12,fontWeight:600,color:C.text,width:28}}>{fmtMod(mod(char[a.s]||10))}</div>
              <div style={{fontSize:11,color:C.textDim,flex:1}}>{a.n}</div>
            </div>
          ))}
        </Card>
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
  sessioni:{table:"sessions",fields:[{id:"num",l:"Numero",ph:"es. I"},{id:"title",l:"Titolo",ph:"Titolo..."},{id:"date",l:"Data",ph:"es. 1 Gen 2025"},{id:"excerpt",l:"Riassunto",ph:"Cosa è successo...",ta:true}]},
  gilda:{table:"factions",fields:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"🏴"},{id:"rank",l:"Rango",ph:"es. Fondatori"},{id:"description",l:"Descrizione",ph:"...",ta:true},{id:"sede",l:"Sede",ph:"es. Porto di Arenmar"},{id:"influence",l:"Potere %",ph:"0-100"}]},
  fazioni:{table:"factions",fields:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"⚔️"},{id:"description",l:"Descrizione",ph:"...",ta:true},{id:"influence",l:"Influenza %",ph:"0-100"}]},
  mondo:{table:"locations",fields:[{id:"name",l:"Nome",ph:"Nome"},{id:"icon",l:"Icona",ph:"🏰"},{id:"sub",l:"Descrizione",ph:"...",ta:true}]},
  cronologia:{table:"timeline",fields:[{id:"date",l:"Data",ph:"Anno 1, Giorno X"},{id:"title",l:"Titolo",ph:"Evento..."},{id:"description",l:"Descrizione",ph:"Cosa accadde...",ta:true}],hasImage:true,imageBucket:"timeline-images",imageField:"image_path"},
};

export default function App(){
  const [user,setUser]=useState(()=>{
    try{
      const s=localStorage.getItem("tp_user");
      return s?JSON.parse(s):null;
    }catch(e){return null;}
  });
  const [data,setData]=useState({sessioni:[],npc:[],gilda:[],fazioni:[],mondo:[],cronologia:[],map_pins:[],map_config:null});
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
  const [pendingPin,setPendingPin]=useState(false);
  const [players,setPlayers]=useState([]);
  const [selectedPlayer,setSelectedPlayer]=useState(null);

  const isAuth = user?.role==="dm";
  const TITLES={sessioni:"Sessioni",npc:"NPC",mappa:"Mappa",gilda:"Gilda",fazioni:"Fazioni",mondo:"Fogli del Mondo",cronologia:"Cronologia"};

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
      const [npcs,sessions,factions,locations,timeline,map_pins,map_config]=await Promise.all([
        supabase.from("npcs").select("*").order("created_at",{ascending:false}),
        supabase.from("sessions").select("*").order("created_at",{ascending:false}),
        supabase.from("factions").select("*").order("created_at",{ascending:false}),
        supabase.from("locations").select("*").order("created_at",{ascending:false}),
        supabase.from("timeline").select("*").order("created_at",{ascending:false}),
        supabase.from("map_pins").select("*").order("created_at",{ascending:false}),
        supabase.from("map_config").select("*").limit(1),
      ]);
      setData(d=>({...d,
        npc:npcs.data||[],sessioni:sessions.data||[],gilda:factions.data||[],
        fazioni:factions.data||[],mondo:locations.data||[],cronologia:timeline.data||[],map_pins:map_pins.data||[],map_config:map_config.data?.[0]||null,
      }));
    }catch(e){console.error(e);}
    setLoading(false);
  };

  useEffect(()=>{
    if(user?.role==="dm"){ loadAll(); const i=setInterval(loadAll,30000); return()=>clearInterval(i); }
  },[user]);

  if(!user) return <LoginScreen onLogin={handleLogin}/>;
  if(user.role==="player") return <PlayerView user={user} onLogout={handleLogout}/>;

  const nav=(v)=>{
    if(!v.startsWith("player_")) setSelectedPlayer(null);
    setView(v);setSidebarOpen(false);
  };

  const openNpcAdd=()=>setNpcModal({});
  const openNpcEdit=(npc)=>setNpcModal(npc);
  const deleteNpc=async(id)=>{if(!window.confirm("Eliminare?"))return;await supabase.from("npcs").delete().eq("id",id);loadAll();};

  const openGenericAdd=()=>{setGenericVals({});setGenericModal({view,item:null});};
  const openGenericEdit=(v,item)=>{setGenericVals({...item});setGenericModal({view:v,item});};
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

      case "gilda":return <div>
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
            {g.description&&<div style={{fontSize:13,color:C.textDim,fontStyle:"italic",lineHeight:1.55,marginBottom:8}}>{g.description}</div>}
            {g.influence!=null&&<><div style={{height:3,background:C.bg3,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${g.influence||0}%`,background:`linear-gradient(90deg,${C.goldDim},${C.gold})`}}/></div><div style={{fontSize:10,color:C.textMuted,marginTop:3}}>Potere: {g.influence||0}%</div></>}
            <EditBtns v="gilda" item={g}/>
          </div>
        ))}
      </div>;

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
              {c.image_path&&<img src={c.image_path} alt={c.title} style={{width:"100%",borderRadius:10,border:`1px solid ${C.border2}`,objectFit:"cover",maxHeight:160,marginTop:8,display:"block"}}/>}
              <EditBtns v="cronologia" item={c}/>
            </div>
          ))}
        </div>;



      case "mappa":{
        const mapImg=data.map_config?.map_path;
        return <div>
          <div style={{position:"relative",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
            {mapImg?<div style={{position:"relative"}}>
                <img src={mapImg} style={{width:"100%",display:"block",borderRadius:12,maxHeight:520,objectFit:"contain"}}/>
                {data.map_pins.map((pin,i)=>(
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
                <div style={{fontSize:13,color:C.textMuted}}>Nessuna mappa caricata</div>
              </div>}
          </div>
          {isAuth&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <label style={{background:mapImg?C.bg2:C.gold,border:mapImg?`1px solid ${C.border2}`:"none",color:mapImg?C.textDim:"#0b1120",fontWeight:600,fontSize:12,padding:"7px 14px",borderRadius:8,cursor:"pointer"}}>
              {mapImg?"🗺️ Cambia mappa":"📷 Carica mappa"}
              <input type="file" accept="image/*" onChange={async e=>{
                const f=e.target.files[0];if(!f)return;
                setMapUploading(true);
                const path=`maps/${Date.now()}.${f.name.split(".").pop()}`;
                const {error:upErr}=await supabase.storage.from("map-images").upload(path,f,{upsert:true});
                if(upErr){alert("Errore: "+upErr.message);setMapUploading(false);return;}
                const {data:urlData}=supabase.storage.from("map-images").getPublicUrl(path);
                await supabase.from("map_config").upsert({id:1,map_path:urlData.publicUrl});
                setMapUploading(false);loadAll();
              }} style={{display:"none"}}/>
            </label>
            {mapImg&&<Btn primary onClick={()=>setPendingPin(true)}>+ Aggiungi Pin</Btn>}
          </div>}
          {mapUploading&&<div style={{fontSize:12,color:C.gold,marginTop:8}}>Caricamento in corso...</div>}
        </div>;
      }

      default:
        if(view.startsWith("player_") && selectedPlayer){
          return <DmPlayerView player={selectedPlayer} onUpdate={loadAll}/>;
        }
        return <EmptyState msg="In costruzione"/>;
    }
  };

  const navItems=[
    {v:"sessioni",icon:"📜",label:"Sessioni"},{v:"cronologia",icon:"⏳",label:"Cronologia"},
    {v:"gilda",icon:"🏴",label:"Gilda"},{v:"fazioni",icon:"⚔️",label:"Fazioni"},
    {v:"npc",icon:"👤",label:"NPC"},{v:"mondo",icon:"🌍",label:"Fogli del Mondo"},
    {v:"mappa",icon:"🗺️",label:"Mappa"},
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

      {players.length>0&&<>
        <div style={{height:1,background:C.border,margin:"6px 18px"}}/>
        <div style={{padding:"14px 0 6px"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",color:C.textMuted,padding:"0 18px 6px"}}>La Compagnia</div>
          {players.map((p,i)=>{
            const vkey = `player_${p.id}`;
            const name = p.name || "Player";
            const hpPct = p.max_hp>0?Math.max(0,Math.min(100,(p.hp/p.max_hp)*100)):0;
            const hpColor = hpPct>60?C.green:hpPct>25?C.yellow:"#f87171";
            return <div key={i} onClick={()=>{setSelectedPlayer(p);nav(vkey);}} style={{padding:"9px 18px",cursor:"pointer",background:view===vkey?`rgba(212,160,23,.08)`:"transparent",borderLeft:`2px solid ${view===vkey?C.gold:"transparent"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:hpColor,flexShrink:0}}/>
                <div style={{fontSize:13,color:view===vkey?C.gold:C.textDim,fontWeight:view===vkey?500:400}}>{name}</div>
                <div style={{marginLeft:"auto",fontSize:10,color:C.textMuted}}>{p.hp}/{p.max_hp}</div>
              </div>
              <div style={{height:3,background:C.bg3,borderRadius:2,overflow:"hidden",marginLeft:16}}>
                <div style={{height:"100%",width:`${hpPct}%`,background:hpColor,borderRadius:2}}/>
              </div>
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
          <span style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:C.gold,letterSpacing:".06em"}}>{TITLES[view]||view}</span>
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
