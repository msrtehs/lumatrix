
import React, { useState, useMemo, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { firebaseService } from "./services/firebaseService";
import { Logo, MOCK_PROPERTIES } from './constants';
import { Property, PropertyType, ListingMode, ValuationResult } from './types';
import PropertyCard from './components/PropertyCard';
import GeminiChatbot from './components/GeminiChatbot';
import { geminiService } from './services/geminiService';
import { ibgeService } from './services/ibgeService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'buy' | 'sell' | 'dashboard' | 'login'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [buyerInsight, setBuyerInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [mapMode, setMapMode] = useState<'map' | 'streetview'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', minArea: '', maxArea: '', type: 'all', mode: 'all' });
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Otimização: Iniciamos com MOCK_PROPERTIES para que o catálogo apareça INSTANTANEAMENTE ao abrir a aba "buy"
  const [dbProperties, setDbProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  
  const apiKey = process.env.API_KEY || "";

  const filteredProperties = useMemo(() => {
    return dbProperties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) || property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.type === 'all' || property.type === filters.type;
      return matchesSearch && matchesType;
    });
  }, [dbProperties, searchTerm, filters]);
  
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const [listingForm, setListingForm] = useState({
    title: '', description: '', aiDetails: '', price: 0, phone: '', cep: '', street: '', number: '', neighborhood: '', complement: '', referencePoint: '', city: '', state: '', area: '', ibgeCode: '', type: PropertyType.LAND, listingMode: ListingMode.SELL
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [isValuating, setIsValuating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) loadUserData(user.uid);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    const userProps = await firebaseService.getPropertiesByUser(uid);
    setMyProperties(userProps);
  };

  const loadAllProperties = async () => {
    try {
      const props = await firebaseService.getProperties();
      if (props && props.length > 0) {
        setDbProperties(props);
      }
    } catch (e) {
      console.error("Erro ao carregar propriedades do banco:", e);
    }
  };

  useEffect(() => { 
    loadAllProperties(); 
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      setIsLoadingInsight(true);
      geminiService.getBuyerInsight(selectedProperty).then(insight => {
        setBuyerInsight(insight);
        setIsLoadingInsight(false);
      });
    }
  }, [selectedProperty]);

  const handleCEPBlur = async () => {
    if (listingForm.cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${listingForm.cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setListingForm(prev => ({ 
            ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf, ibgeCode: data.ibge 
          }));
        }
      } catch (e) {}
    }
  };

  const handleValuation = async () => {
    setIsValuating(true);
    const ibgeData = await ibgeService.getCityMetrics(listingForm.ibgeCode);
    const res = await geminiService.estimateValue(listingForm, ibgeData);
    setValuation(res);
    setIsValuating(false);
  };

  const handlePublish = async () => {
    if (!currentUser) { setActiveTab('login'); return; }
    setIsPublishing(true);
    try {
      const fullAddress = `${listingForm.street}, ${listingForm.number}, ${listingForm.neighborhood}, ${listingForm.city}, ${listingForm.state}`;
      const coords = await geminiService.getCoordinates(fullAddress);
      
      await firebaseService.addProperty({
        title: listingForm.title,
        description: listingForm.description,
        price: Number(listingForm.price),
        location: `${listingForm.city}, ${listingForm.state}`,
        address: {
          cep: listingForm.cep, street: listingForm.street, number: listingForm.number,
          neighborhood: listingForm.neighborhood, city: listingForm.city, state: listingForm.state,
          complement: listingForm.complement, referencePoint: listingForm.referencePoint
        },
        phone: listingForm.phone || "",
        type: listingForm.type,
        listingMode: listingForm.listingMode,
        area: Number(listingForm.area),
        images: [],
        features: [],
        sellerName: currentUser.displayName || "Lumatrix Partner",
        sellerId: currentUser.uid,
        rating: 5.0,
        coordinates: coords
      }, selectedFiles);
      alert("Ativo publicado na rede Lumatrix.");
      setActiveTab('dashboard');
      loadAllProperties();
    } catch (e) { alert("Erro ao publicar."); }
    finally { setIsPublishing(false); }
  };

  const renderContent = () => {
    if (isAuthLoading && (activeTab === 'dashboard' || activeTab === 'sell')) {
      return <div className="py-48 text-center animate-pulse"><Logo size="w-16 h-16 mx-auto mb-10" /></div>;
    }

    if (activeTab === 'login') return (
      <div className="flex flex-col items-center justify-center py-24 animate-in zoom-in-95">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 max-w-md w-full mx-4">
          <Logo size="w-16 h-16 mx-auto mb-8" />
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10">
            <button onClick={() => setLoginMode('login')} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${loginMode === 'login' ? 'bg-white text-[#1a365d] shadow-sm' : 'text-slate-400'}`}>Acessar</button>
            <button onClick={() => setLoginMode('signup')} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${loginMode === 'signup' ? 'bg-white text-[#1a365d] shadow-sm' : 'text-slate-400'}`}>Cadastrar</button>
          </div>
          <div className="space-y-4">
            {loginMode === 'signup' && <input type="text" placeholder="Nome Completo" className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-2 border-transparent focus:border-[#c19a5b]" value={authName} onChange={e => setAuthName(e.target.value)} />}
            <input type="email" placeholder="E-mail" className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-2 border-transparent focus:border-[#c19a5b]" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
            <input type="password" placeholder="Senha" className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-2 border-transparent focus:border-[#c19a5b]" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
            <button onClick={async () => {
              setIsAuthSubmitting(true);
              try {
                if(loginMode === 'signup') {
                  const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                  await updateProfile(cred.user, { displayName: authName });
                  await firebaseService.saveUser({ uid: cred.user.uid, name: authName, email: authEmail });
                } else { await signInWithEmailAndPassword(auth, authEmail, authPassword); }
                setActiveTab('home');
              } catch(e: any) { alert(e.message); }
              finally { setIsAuthSubmitting(false); }
            }} className="w-full bg-[#1a365d] text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">{isAuthSubmitting ? 'Validando...' : 'Entrar'}</button>
          </div>
        </div>
      </div>
    );

    if (activeTab === 'home') return (
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover brightness-[0.3]" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter mb-8 text-shadow-xl">Lumatrix<span className="text-[#c19a5b]">.</span></h1>
          <p className="text-xl md:text-3xl text-slate-200 mb-16 font-light">Ativos imobiliários com inteligência analítica.</p>
          <div className="flex gap-6 justify-center">
            <button onClick={() => setActiveTab('buy')} className="bg-[#c19a5b] text-[#1a365d] px-16 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl">Explorar</button>
            <button onClick={() => setActiveTab('sell')} className="bg-white/10 backdrop-blur-xl border-2 border-white/20 px-16 py-6 rounded-2xl font-black text-xl hover:bg-white/20 transition-all">Anunciar</button>
          </div>
        </div>
      </section>
    );

    if (selectedProperty) {
      const addressString = encodeURIComponent(`${selectedProperty.address.street}, ${selectedProperty.address.number}, ${selectedProperty.address.neighborhood}, ${selectedProperty.address.city}, ${selectedProperty.address.state}`);
      const mapUrl = mapMode === 'map' 
        ? `https://www.google.com/maps?q=${addressString}&output=embed&z=17` 
        : `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${selectedProperty.coordinates.lat},${selectedProperty.coordinates.lng}&heading=210&pitch=10&fov=90`;

      return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-300">
          <button onClick={() => setSelectedProperty(null)} className="mb-12 font-black uppercase text-[10px] tracking-[0.4em] text-[#c19a5b] flex items-center gap-3 hover:text-[#1a365d] transition-all">
            ← Voltar ao Catálogo
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-10">
              <div className="rounded-[4rem] overflow-hidden shadow-2xl border-b-[12px] border-[#c19a5b] h-[550px]">
                <img src={selectedProperty.images[0]} className="w-full h-full object-cover" alt={selectedProperty.title} />
              </div>
              
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-[#1a365d] uppercase tracking-widest text-xs flex items-center gap-2">Geolocalização</h3>
                  <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button onClick={() => setMapMode('map')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapMode === 'map' ? 'bg-white shadow-md text-[#1a365d]' : 'text-slate-400'}`}>Mapa</button>
                    <button onClick={() => setMapMode('streetview')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapMode === 'streetview' ? 'bg-white shadow-md text-[#1a365d]' : 'text-slate-400'}`}>Street View</button>
                  </div>
                </div>
                <div className="w-full h-[450px] rounded-[3rem] overflow-hidden border-2 border-slate-50 bg-slate-100 relative">
                  <iframe width="100%" height="100%" frameBorder="0" src={mapUrl} allowFullScreen className="absolute inset-0"></iframe>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <div className="flex gap-3 mb-2">
                  <span className="bg-[#1a365d] text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedProperty.type}</span>
                </div>
                <h1 className="text-7xl font-black text-[#1a365d] tracking-tighter leading-[0.9]">{selectedProperty.title}</h1>
                <p className="text-6xl font-black text-[#c19a5b] tracking-tighter">R$ {selectedProperty.price.toLocaleString('pt-BR')}</p>
              </div>

              <div className="bg-[#1a365d] p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                <h3 className="text-[#c19a5b] font-black uppercase text-[10px] tracking-[0.4em] mb-8 flex items-center gap-3">Lumatrix IA Insight</h3>
                <div className="text-slate-100 font-medium text-lg leading-relaxed italic border-l-4 border-[#c19a5b] pl-6 py-2">
                  {isLoadingInsight ? "Analisando..." : `"${buyerInsight}"`}
                </div>
              </div>

              <div className="text-xl leading-relaxed text-slate-600 font-medium p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                {selectedProperty.description}
              </div>

              <div className="flex gap-6 sticky bottom-8 z-20">
                <button className="flex-1 bg-[#1a365d] text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-105 transition-all">Contatar Vendedor</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'sell') return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-in slide-in-from-right-10 duration-300">
        <h1 className="text-6xl font-black text-[#1a365d] mb-12 tracking-tighter">Listar Novo Ativo</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* 1. CLASSIFICAÇÃO */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-xl font-black text-[#1a365d] uppercase tracking-widest text-[10px]">1. Classificação do Ativo</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setListingForm({...listingForm, type: PropertyType.LAND})} 
                  className={`py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${listingForm.type === PropertyType.LAND ? 'bg-[#1a365d] text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400'}`}
                >Terreno</button>
                <button 
                  onClick={() => setListingForm({...listingForm, type: PropertyType.HOUSE})} 
                  className={`py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${listingForm.type !== PropertyType.LAND ? 'bg-[#1a365d] text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400'}`}
                >Imóvel Construído</button>
              </div>
            </div>

            {/* 2. LOCALIZAÇÃO */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-xl font-black text-[#1a365d] uppercase tracking-widest text-[10px]">2. Logística e Localização</h2>
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">CEP</label>
                  <input type="text" maxLength={8} onBlur={handleCEPBlur} className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#c19a5b]" value={listingForm.cep} onChange={e => setListingForm({...listingForm, cep: e.target.value})} />
                </div>
                <div className="col-span-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Logradouro</label>
                  <input type="text" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.street} onChange={e => setListingForm({...listingForm, street: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Número</label>
                  <input type="text" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.number} onChange={e => setListingForm({...listingForm, number: e.target.value})} />
                </div>
                <div className="col-span-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Bairro</label>
                  <input type="text" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.neighborhood} onChange={e => setListingForm({...listingForm, neighborhood: e.target.value})} />
                </div>
                <div className="col-span-4">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Referência / Complemento</label>
                  <input type="text" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.complement} onChange={e => setListingForm({...listingForm, complement: e.target.value})} />
                </div>
              </div>
            </div>

            {/* 3. DADOS PÚBLICOS */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-xl font-black text-[#1a365d] uppercase tracking-widest text-[10px]">3. Exibição Pública</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Título do Anúncio</label>
                  <input type="text" placeholder="Ex: Terreno com Vista para o Vale" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.title} onChange={e => setListingForm({...listingForm, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Área Total (m²)</label>
                    <input type="number" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.area} onChange={e => setListingForm({...listingForm, area: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Telefone de Contato</label>
                    <input type="text" placeholder="(00) 00000-0000" className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.phone} onChange={e => setListingForm({...listingForm, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-2 block">Descrição Comercial</label>
                  <textarea rows={4} className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none" value={listingForm.description} onChange={e => setListingForm({...listingForm, description: e.target.value})} />
                </div>
              </div>
              
              <div className="border-4 border-dashed border-slate-100 p-12 rounded-[2.5rem] text-center bg-slate-50/50 relative hover:bg-slate-100 transition-all cursor-pointer">
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setSelectedFiles(Array.from(e.target.files || []))} />
                <p className="text-[#c19a5b] font-black uppercase text-[10px] tracking-widest">{selectedFiles.length > 0 ? `${selectedFiles.length} fotos anexadas` : "Anexar Fotos do Ativo"}</p>
              </div>
            </div>

            {/* 4. DOSSIÊ IA */}
            <div className="bg-[#f8fafc] p-12 rounded-[3.5rem] border border-[#1a365d]/5 shadow-inner space-y-8">
              <h2 className="text-xl font-black text-[#1a365d] uppercase tracking-widest text-[10px]">4. Dossiê Sigiloso IA</h2>
              <p className="text-xs text-slate-400">Informações confidenciais que ajudam a IA a calcular o valor real (ex: dívidas, reformas necessárias, vizinhança).</p>
              <textarea placeholder="Ex: Precisa de reforma no muro lateral, documentação 100%, vizinhança silenciosa..." rows={4} className="w-full bg-white p-5 rounded-2xl font-bold outline-none border border-slate-100" value={listingForm.aiDetails} onChange={e => setListingForm({...listingForm, aiDetails: e.target.value})} />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-[#1a365d] p-12 rounded-[4rem] text-white shadow-2xl sticky top-32 space-y-8 border-b-[12px] border-[#c19a5b]">
              <h3 className="text-[#c19a5b] font-black uppercase text-[10px] tracking-[0.4em] mb-4">Painel Analítico</h3>
              <button onClick={handleValuation} disabled={isValuating} className="w-full bg-[#c19a5b] text-[#1a365d] py-6 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 transition-all active:scale-95">
                {isValuating ? 'Analisando Ativo...' : 'Solicitar Preço IA'}
              </button>
              {valuation && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[9px] uppercase font-black text-white/40 mb-1 tracking-widest">Avaliação Sugerida</p>
                    <p className="text-4xl font-black text-[#c19a5b]">R$ {valuation.maxProfit.max.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-white/40 tracking-widest">Preço de Anúncio</label>
                    <input type="number" className="w-full bg-white/10 p-5 rounded-2xl text-white font-black outline-none border border-white/20 focus:border-[#c19a5b]" value={listingForm.price} onChange={e => setListingForm({...listingForm, price: Number(e.target.value)})} />
                  </div>
                  <button onClick={handlePublish} disabled={isPublishing} className="w-full bg-white text-[#1a365d] py-6 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl">
                    {isPublishing ? 'Publicando...' : 'Confirmar e Listar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );

    if (activeTab === 'buy') return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in duration-200">
        <h1 className="text-6xl font-black text-[#1a365d] mb-16 tracking-tighter text-center">Catálogo Premium</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          {filteredProperties.length > 0 ? (
            filteredProperties.map(p => <PropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />)
          ) : (
            <div className="col-span-full py-24 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum ativo encontrado</div>
          )}
        </div>
      </div>
    );

    if (activeTab === 'dashboard') return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-300">
        <h2 className="text-5xl font-black text-[#1a365d] mb-12 tracking-tighter">Meus Ativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {myProperties.length > 0 ? (
            myProperties.map(p => <PropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />)
          ) : (
            <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">Você ainda não listou nenhum ativo</p>
              <button onClick={() => setActiveTab('sell')} className="bg-[#1a365d] text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Anunciar Agora</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white selection:bg-[#c19a5b] selection:text-[#1a365d]">
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 h-28 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 flex justify-between items-center">
          <div onClick={() => {setActiveTab('home'); setSelectedProperty(null);}} className="flex items-center gap-4 cursor-pointer group">
            <Logo size="w-14 h-14" />
            <span className="text-4xl font-black tracking-tighter text-[#1a365d] group-hover:text-[#c19a5b] transition-colors">lumatrix<span className="text-[#c19a5b]">.</span></span>
          </div>
          
          <div className="hidden lg:flex gap-14 items-center">
            <button onClick={() => {setActiveTab('buy'); setSelectedProperty(null);}} className={`font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'buy' ? 'text-[#c19a5b] border-b-2 border-[#c19a5b]' : 'text-slate-400 hover:text-[#1a365d]'}`}>Ativos</button>
            {currentUser && (
              <button onClick={() => setActiveTab('dashboard')} className={`font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'text-[#c19a5b] border-b-2 border-[#c19a5b]' : 'text-slate-400 hover:text-[#1a365d]'}`}>Meu Painel</button>
            )}
            <button onClick={() => setActiveTab('sell')} className={`bg-[#1a365d] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#c19a5b] hover:text-[#1a365d] shadow-xl transition-all ${activeTab === 'sell' ? 'bg-[#c19a5b] text-[#1a365d]' : ''}`}>Anunciar</button>
            {currentUser ? (
              <button onClick={() => signOut(auth)} className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:brightness-75 transition-all">Sair</button>
            ) : (
              <button onClick={() => setActiveTab('login')} className="text-[10px] font-black uppercase text-[#1a365d] tracking-widest hover:text-[#c19a5b] transition-all">Acessar</button>
            )}
          </div>
        </div>
      </nav>
      <main className="pb-24">{renderContent()}</main>
      <GeminiChatbot />
    </div>
  );
};

export default App;
