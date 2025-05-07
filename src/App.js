import React, { useState, useEffect } from 'react';

// بيانات العملاء الافتراضية
const defaultClients = [
  {
    id: 1,
    name: 'أحمد خالد',
    companyName: 'شركة المثال',
    businessActivity: 'تجارة إلكترونية',
    phone: '0555551111',
    location: 'الرياض',
    bankAccounts: 'SA1234567890123456789012',
    totalDeposits: 150000,
    depositType: 'تحويل',
    legalEntity: 'شركة',
    companyType: 'سعودية',
    loanAmount: 50000,
    paid: 30000,
    files: [],
    completed: false,
    type: 'عميل'
  }
];
const defaultUsers = [{ username: 'admin', password: 'admin' }];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [deletedClients, setDeletedClients] = useState([]);
  const [section, setSection] = useState('العملاء');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', companyName: '', businessActivity: '', phone: '', location: '', bankAccounts: '', totalDeposits: '', depositType: '', legalEntity: 'مؤسسة', companyType: '', loanAmount: '', paid: '', files: [], type: 'عميل' });
  const [selectedClient, setSelectedClient] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newCred, setNewCred] = useState({ username: '', password: '' });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('loanAppUsers'));
    setUsers(u && u.length ? u : defaultUsers);
    const d = JSON.parse(localStorage.getItem('clientsData'));
    if (d) { setClients(d.clients); setDeletedClients(d.deletedClients); } 
    else setClients(defaultClients);
  }, []);
  useEffect(() => { localStorage.setItem('loanAppUsers', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('clientsData', JSON.stringify({ clients, deletedClients })); }, [clients, deletedClients]);

  const handleLogin = () => { if (users.some(u => u.username === loginUser && u.password === loginPass)) setLoggedIn(true); else alert('بيانات دخول خاطئة'); };
  const addUser = () => { if (newCred.username && newCred.password) { setUsers(prev => [...prev, { ...newCred }]); setNewCred({ username: '', password: '' }); } };
  const removeUser = username => setUsers(prev => prev.filter(u => u.username !== username));

  const handleFormChange = (f, v) => setFormData(prev => ({ ...prev, [f]: v }));
  const handleFormFile = e => { const files = Array.from(e.target.files).map(f => ({ name: f.name, type: f.type, url: URL.createObjectURL(f) })); setFormData(prev => ({ ...prev, files: [...prev.files, ...files] })); };
  const openAddForm = () => { setFormData({ id: null, name: '', companyName: '', businessActivity: '', phone: '', location: '', bankAccounts: '', totalDeposits: '', depositType: '', legalEntity: 'مؤسسة', companyType: '', loanAmount: '', paid: '', files: [], type: 'عميل' }); setIsEditing(false); setShowForm(true); setSelectedClient(null); };
  const openEditForm = c => { setFormData(c); setIsEditing(true); setShowForm(true); setSelectedClient(null); };
  const saveForm = () => { const entry = { ...formData, totalDeposits: +formData.totalDeposits||0, loanAmount:+formData.loanAmount||0, paid:+formData.paid||0 }; if (isEditing) setClients(prev => prev.map(c=>c.id===entry.id?entry:c)); else { entry.id=Date.now(); entry.completed=false; setClients(prev=>[...prev,entry]); } setShowForm(false); };
  const cancelForm = () => setShowForm(false);

  const deleteClient = id => { const c=clients.find(x=>x.id===id); setClients(prev=>prev.filter(x=>x.id!==id)); if(c) setDeletedClients(prev=>[...prev,c]); setSelectedClient(null); };
  const restoreClient = id => { const c=deletedClients.find(x=>x.id===id); setDeletedClients(prev=>prev.filter(x=>x.id!==id)); if(c) setClients(prev=>[...prev,c]); };
  const permDeleteClient = id=>setDeletedClients(prev=>prev.filter(x=>x.id!==id));
  const markCompleted = id=>setClients(prev=>prev.map(c=>c.id===id?{...c,completed:true}:c));
  const undoCompleted = id=>setClients(prev=>prev.map(c=>c.id===id?{...c,completed:false}:c));

  const openDetails = c=>{ setSelectedClient(c); setShowForm(false); };
  const deleteFile = i=>{ if(!selectedClient) return; setSelectedClient(prev=>{ const f=[...prev.files]; f.splice(i,1); return{...prev,files:f}; }); setClients(prev=>prev.map(c=>c.id===selectedClient.id?{...c,files:c.files.filter((_,idx)=>idx!==i)}:c)); };

  const navSections=['العملاء','الموظفين','المنتهين','المحذوفين','الإعدادات'];
  const filtered = section==='المحذوفين'?deletedClients:clients.filter(c=>{ if(section==='العملاء') return c.type==='عميل'&&!c.completed; if(section==='الموظفين') return c.type==='موظف'; if(section==='المنتهين') return c.type==='عميل'&&c.completed; return true; });
  const btn={margin:'0.5rem',padding:'0.5rem 1rem',border:'none',borderRadius:'0.5rem',cursor:'pointer'};

  if(!loggedIn) return(
    <div style={{display:'flex',height:'100vh',justifyContent:'center',alignItems:'center',background:'#f1f5f9'}}>
      <div style={{background:'#fff',padding:'2rem',borderRadius:'1rem',boxShadow:'0 2px 6px rgba(0,0,0,0.1)'}}>
        <h2>تسجيل الدخول</h2>
        <p>admin / admin</p>
        <input placeholder="اسم المستخدم" value={loginUser} onChange={e=>setLoginUser(e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/>
        <input type="password" placeholder="كلمة المرور" value={loginPass} onChange={e=>setLoginPass(e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/>
        <button onClick={handleLogin} style={{...btn,background:'#3b82f6',color:'#fff',width:'100%'}}>دخول</button>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:'Segoe UI',background:'#f1f5f9',minHeight:'100vh'}}>
      <nav style={{background:'#1e293b',padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{color:'#fff'}}>مشارف الجنان</h1>
        <div>{navSections.map(s=><button key={s} onClick={()=>{setSection(s);setShowSettings(s==='الإعدادات');setShowForm(false);setSelectedClient(null);}} style={{...btn,background:(s===section||(s==='الإعدادات'&&showSettings))?'#3b82f6':'transparent',color:'#fff'}}>{s}</button>)}</div>
      </nav>
      {showSettings?(<div style={{padding:'2rem'}}><h2>إدارة المستخدمين</h2><input placeholder="اسم المستخدم" value={newCred.username} onChange={e=>setNewCred(prev=>({...prev,username:e.target.value}))} style={{width:'100%',margin:'0.5rem 0'}}/><input type="password" placeholder="كلمة المرور" value={newCred.password} onChange={e=>setNewCred(prev=>({...prev,password:e.target.value}))} style={{width:'100%',margin:'0.5rem 0'}}/><button onClick={addUser} style={{...btn,background:'#10b981',color:'#fff'}}>إضافة مستخدم</button><ul style={{listStyle:'none',padding:0}}>{users.map(u=><li key={u.username}>{u.username} <button onClick={()=>removeUser(u.username)} style={{...btn,background:'#ef4444',color:'#fff'}}>حذف</button></li>)}</ul></div>):(
        <main style={{padding:'2rem'}}>
          <button onClick={openAddForm} style={{...btn,background:'#10b981',color:'#fff'}}>إضافة جديد</button>
          {showForm&&(<div style={{background:'#fff',padding:'1rem',borderRadius:'1rem',margin:'1rem 0',maxWidth:'500px'}}><h3>{isEditing?`تعديل ${formData.type}`:`إضافة ${formData.type}`}</h3><input placeholder="الاسم" value={formData.name} onChange={e=>handleFormChange('name',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="اسم الشركة" value={formData.companyName} onChange={e=>handleFormChange('companyName',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="نشاط تجاري" value={formData.businessActivity} onChange={e=>handleFormChange('businessActivity',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="الجوال" value={formData.phone} onChange={e=>handleFormChange('phone',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="الموقع" value={formData.location} onChange={e=>handleFormChange('location',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="الحسابات البنكية" value={formData.bankAccounts} onChange={e=>handleFormChange('bankAccounts',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="إجمالي الإيداعات" type="number" value={formData.totalDeposits} onChange={e=>handleFormChange('totalDeposits',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="نوع الإيداع" value={formData.depositType} onChange={e=>handleFormChange('depositType',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><select value={formData.legalEntity} onChange={e=>handleFormChange('legalEntity',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}><option value="مؤسسة">مؤسسة</option><option value="شركة">شركة</option></select><input placeholder="نوع الشركة" value={formData.companyType} onChange={e=>handleFormChange('companyType',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><select value={formData.type} onChange={e=>handleFormChange('type',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}><option value="عميل">عميل</option><option value="موظف">موظف</option></select>{formData.type==='عميل'&&(<><input placeholder="المقترض" type="number" value={formData.loanAmount} onChange={e=>handleFormChange('loanAmount',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/><input placeholder="المدفوع" type="number" value={formData.paid} onChange={e=>handleFormChange('paid',e.target.value)} style={{width:'100%',margin:'0.5rem 0'}}/></>)}<input type="file" multiple onChange={handleFormFile} style={{margin:'0.5rem 0'}}/><div style={{display:'flex',justifyContent:'flex-end',gap:'0.5rem'}}><button onClick={saveForm} style={{...btn,background:'#3b82f6',color:'#fff'}}>{isEditing?'حفظ':'إضافة'}</button><button onClick={cancelForm} style={{...btn,background:'#9ca3af',color:'#fff'}}>إلغاء</button></div></div>)}
          <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1rem'}}>
            {filtered.map(c=>(
              <div key={c.id} onClick={()=>openDetails(c)} style={{background:'#fff',padding:'1rem',borderRadius:'1rem',boxShadow:'0 2px 6px rgba(0,0,0,0.1)',cursor:'pointer'}}>
                <h3>{c.name}</h3>
                <p><strong>شركة:</strong> {c.companyName}</p>
                <p><strong>نشاط:</strong> {c.businessActivity}</p>
                <p><strong>جوال:</strong> {c.phone}</p>
                <p><strong>الموقع:</strong> {c.location}</p>
                <p><strong>حسابات بنكية:</strong> {c.bankAccounts}</p>
                <p><strong>إجمالي الإيداعات:</strong> {c.totalDeposits}</p>
                <p><strong>نوع الإيداع:</strong> {c.depositType}</p>
                <p><strong>الكيان القانوني:</strong> {c.legalEntity}</p>
                <p><strong>نوع الشركة:</strong> {c.companyType}</p>
                <div onClick={e=>e.stopPropagation()} style={{display:'flex',justifyContent:'flex-end',gap:'0.5rem'}}>
                  {section==='المحذوفين'?(
                    <><button onClick={()=>restoreClient(c.id)} style={{...btn,background:'#3b82f6',color:'#fff'}}>استعادة</button><button onClick={()=>permDeleteClient(c.id)} style={{...btn,background:'#ef4444',color:'#fff'}}>حذف نهائي</button></>
                  ):(
                    <><button onClick={()=>openEditForm(c)} style={{...btn,background:'#6366f1',color:'#fff'}}>تعديل</button><button onClick={()=>deleteClient(c.id)} style={{...btn,background:'#ef4444',color:'#fff'}}>حذف</button>{!c.completed&&c.type==='عميل'&&<button onClick={()=>markCompleted(c.id)} style={{...btn,background:'#22c55e',color:'#fff'}}>إنهاء</button>}{c.completed&&<button onClick={()=>undoCompleted(c.id)} style={{...btn,background:'#facc15',color:'#000'}}>تراجع</button>}</>
                  )}
                </div>
              </div>
            ))}
          </section>
          {selectedClient&&(
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center'}}>
              <div style={{background:'#fff',padding:'2rem',borderRadius:'1rem',width:'90%',maxWidth:'600px'}}>
                <h2>تفاصيل {selectedClient.name}</h2>
                <div style={{display:'flex',justifyContent:'flex-end',gap:'0.5rem'}}>
                  <button onClick={()=>openEditForm(selectedClient)} style={{...btn,background:'#6366f1',color:'#fff'}}>تعديل</button>
                  <button onClick={()=>window.print()} style={{...btn,background:'#6b7280',color:'#fff'}}>طباعة</button>
                </div>
                <div style={{marginTop:'1rem'}}>
                  <p><strong>شركة:</strong> {selectedClient.companyName}</p>
                  <p><strong>نشاط:</strong> {selectedClient.businessActivity}</p>
                  <p><strong>جوال:</strong> {selectedClient.phone}</p>
                  <p><strong>الموقع:</strong> {selectedClient.location}</p>
                  <p><strong>حسابات بنكية:</strong> {selectedClient.bankAccounts}</p>
                  <p><strong>إجمالي الإيداعات:</strong> {selectedClient.totalDeposits}</p>
                  <p><strong>نوع الإيداع:</strong> {selectedClient.depositType}</p>
                  <p><strong>الكيان القانوني:</strong> {selectedClient.legalEntity}</p>
                  <p><strong>نوع الشركة:</strong> {selectedClient.companyType}</p>
                  {selectedClient.files.length>0&&(
                    <div>
                      <h4>الملفات:</h4>
                      <ul style={{listStyle:'none',padding:0}}>
                        {selectedClient.files.map((f,i)=>(
                          <li key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem',margin:'0.5rem 0'}}>
                            {f.type.startsWith('image/')?<img src={f.url} alt={f.name} style={{maxWidth:'100px',maxHeight:'100px',objectFit:'cover',cursor:'pointer'}}/>:<a href={f.url} download style={{textDecoration:'underline',color:'#3b82f6'}}>{f.name}</a>}
                            <button onClick={()=>deleteFile(i)} style={{...btn,background:'#ef4444',color:'#fff'}}>حذف ملف</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button onClick={()=>setSelectedClient(null)} style={{...btn,background:'#9ca3af',color:'#fff',marginTop:'1rem'}}>إغلاق</button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
