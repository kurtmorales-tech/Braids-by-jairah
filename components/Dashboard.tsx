
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Edit2, 
  Save, 
  X,
  Plus,
  Trash2,
  Search,
  Filter,
  Cloud,
  Shield,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Upload,
  Server,
  Key,
  Globe
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Service, Booking } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  services: Service[];
  bookings: Booking[];
  onUpdateService: (service: Service) => void;
  onLogout: () => void;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ services, bookings, onUpdateService, onLogout, onRefresh }) => {
  const [activeView, setActiveView] = useState<'overview' | 'services' | 'bookings' | 'settings'>('overview');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Storage State
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({
    aws: 'idle',
    gcp: 'idle'
  });

  const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.paymentStatus === 'PAID' ? curr.paymentAmount : 0), 0);
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;

  const handleEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setEditForm({ ...service });
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setEditForm({ ...booking });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `service-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('services')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('services')
        .getPublicUrl(filePath);

      setEditForm({ ...editForm, image: data.publicUrl });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveService = async () => {
    setIsSyncing(true);
    if (editingServiceId && editForm) {
      const updatedService = { ...services.find(s => s.id === editingServiceId), ...editForm } as Service;
      onUpdateService(updatedService);
      setEditingServiceId(null);
    }
    setIsSyncing(false);
  };

  const handleAddNewService = async () => {
    setIsSyncing(true);
    const newService = {
      name: editForm.name || 'New Protocol',
      description: editForm.description || '',
      price: editForm.price || 0,
      duration: editForm.duration || 60,
      image: editForm.image || 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=800'
    };

    const { error } = await supabase.from('services').insert([newService]);
    if (!error) {
      onRefresh();
      setIsAddingService(false);
      setEditForm({});
    }
    setIsSyncing(false);
  };

  const handleSaveBooking = async () => {
    setIsSyncing(true);
    if (editingBookingId && editForm) {
      const { error } = await supabase.from('bookings').update(editForm).eq('id', editingBookingId);
      if (!error) {
        onRefresh();
        setEditingBookingId(null);
      }
    }
    setIsSyncing(false);
  };

  const simulateConnection = async (provider: 'aws' | 'gcp') => {
    setConnectionStatus(prev => ({ ...prev, [provider]: 'loading' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnectionStatus(prev => ({ ...prev, [provider]: 'success' }));
    setTimeout(() => setConnectionStatus(prev => ({ ...prev, [provider]: 'idle' })), 3000);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeView, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveView(id);
        setIsAddingService(false);
        setEditingServiceId(null);
        setEditingBookingId(null);
      }}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
        activeView === id 
          ? 'bg-braid-primary text-white shadow-soft' 
          : 'text-braid-muted dark:text-braid-dark-muted hover:bg-braid-primary/10 hover:text-braid-primary'
      }`}
    >
      <Icon size={20} className={activeView === id ? 'text-white' : 'text-braid-muted group-hover:text-braid-primary'} />
      <span className="font-medium tracking-wide text-sm uppercase">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-braid-bg dark:bg-braid-dark-bg text-braid-text dark:text-braid-dark-text font-sans">
      <aside className="w-80 bg-white/80 dark:bg-braid-dark-panel/80 backdrop-blur-xl border-r border-braid-primary/10 dark:border-white/5 flex flex-col p-8 z-20">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-braid-primary rounded-full flex items-center justify-center text-white shadow-soft">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="font-serif italic text-2xl font-bold">Admin Suite</h1>
        </div>

        <nav className="flex-grow space-y-4">
          <SidebarItem id="overview" icon={TrendingUp} label="Overview" />
          <SidebarItem id="services" icon={Edit2} label="Services" />
          <SidebarItem id="bookings" icon={Users} label="Clientele" />
          <SidebarItem id="settings" icon={Settings} label="Settings" />
        </nav>

        <button onClick={onLogout} className="flex items-center gap-4 p-4 rounded-2xl text-braid-muted hover:text-red-500 hover:bg-red-50 transition-colors mt-auto">
          <LogOut size={20} />
          <span className="font-medium text-sm uppercase">Sign Out</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 relative">
         <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-4xl font-serif italic mb-2 capitalize">{activeView}</h2>
                <p className="text-braid-muted text-sm">Secure Artisan Dashboard • Connected to Supabase</p>
              </div>
              <div className="flex items-center gap-4">
                {activeView === 'services' && !isAddingService && (
                  <Button onClick={() => {
                    setIsAddingService(true);
                    setEditForm({ price: 0, duration: 60, image: '', name: '', description: '' });
                  }} className="h-10 text-[10px] px-6">
                    <Plus size={14} /> New Protocol
                  </Button>
                )}
                <button 
                  onClick={onRefresh} 
                  className={`p-3 bg-white dark:bg-braid-dark-panel rounded-full border border-braid-primary/10 hover:bg-braid-primary/5 transition-all ${isSyncing ? 'animate-spin' : ''}`}
                  title="Refresh Cloud Data"
                >
                  <RefreshCw size={18} className="text-braid-primary" />
                </button>
              </div>
            </header>

            {activeView === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Settled Revenue', value: `$${(totalRevenue / 100).toLocaleString()}`, icon: DollarSign, change: 'Real-time Sync' },
                  { label: 'Active Sessions', value: confirmedBookings, icon: Users, change: 'Upcoming' },
                  { label: 'Available Protocols', value: services.length, icon: CalendarIcon, change: 'Active' }
                ].map((stat, i) => (
                  <GlassCard key={i} className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-braid-primary/10 rounded-xl text-braid-primary">
                        <stat.icon size={24} />
                      </div>
                      <span className="text-[9px] font-bold text-braid-primary uppercase">{stat.change}</span>
                    </div>
                    <h3 className="text-4xl font-serif italic mb-1">{stat.value}</h3>
                    <p className="text-[10px] font-bold text-braid-muted uppercase tracking-widest">{stat.label}</p>
                  </GlassCard>
                ))}
              </div>
            )}

            {activeView === 'services' && (
              <div className="space-y-6">
                <AnimatePresence>
                  {isAddingService && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <GlassCard className="border-braid-primary/30">
                        <div className="flex justify-between items-center mb-8">
                          <h3 className="text-2xl font-serif italic">New Service Protocol</h3>
                          <button onClick={() => setIsAddingService(false)} className="text-braid-muted hover:text-red-500 transition-colors">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-2">Protocol Name</label>
                            <input 
                              placeholder="e.g. Knotless Matrix"
                              value={editForm.name}
                              onChange={e => setEditForm({...editForm, name: e.target.value})}
                              className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-2xl p-4 outline-none focus:border-braid-primary transition-all"
                            />
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-2">Description</label>
                            <textarea 
                              placeholder="Describe the artistry..."
                              value={editForm.description}
                              onChange={e => setEditForm({...editForm, description: e.target.value})}
                              className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-2xl p-4 outline-none focus:border-braid-primary transition-all h-32"
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-2">Price (Cents)</label>
                                <input 
                                  type="number"
                                  value={editForm.price}
                                  onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})}
                                  className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-2xl p-4 outline-none focus:border-braid-primary transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-2">Duration (Mins)</label>
                                <input 
                                  type="number"
                                  value={editForm.duration}
                                  onChange={e => setEditForm({...editForm, duration: parseInt(e.target.value)})}
                                  className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-2xl p-4 outline-none focus:border-braid-primary transition-all"
                                />
                              </div>
                            </div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-2">Service Image</label>
                            <div 
                              className="relative h-40 border-2 border-dashed border-braid-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-braid-primary/5 transition-all overflow-hidden"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              {editForm.image ? (
                                <img src={editForm.image} className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <>
                                  <Upload className="text-braid-primary/40" size={32} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-braid-muted">
                                    {uploading ? 'Uploading...' : 'Drop image or click to upload'}
                                  </span>
                                </>
                              )}
                              <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                           <Button variant="ghost" onClick={() => setIsAddingService(false)}>Cancel</Button>
                           <Button onClick={handleAddNewService} disabled={isSyncing || uploading}>
                             {isSyncing ? <Loader2 className="animate-spin" size={16} /> : 'Save Protocol'}
                           </Button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-4">
                  {services.map(service => {
                    const isEditing = editingServiceId === service.id;
                    return (
                      <GlassCard key={service.id} className={`transition-all ${isEditing ? 'border-braid-primary' : ''}`}>
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <input 
                                  value={editForm.name}
                                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                                  className="bg-transparent border-b border-braid-primary/30 outline-none font-serif text-xl w-full"
                                />
                                <textarea 
                                  value={editForm.description}
                                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                                  className="w-full bg-transparent border border-braid-primary/10 rounded-xl p-3 text-sm outline-none focus:border-braid-primary h-24"
                                />
                              </div>
                              <div className="space-y-4">
                                <div className="flex gap-4">
                                  <input 
                                    type="number"
                                    value={editForm.price}
                                    onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})}
                                    className="bg-transparent border-b border-braid-primary/30 outline-none w-full text-sm"
                                    placeholder="Price"
                                  />
                                  <input 
                                    type="number"
                                    value={editForm.duration}
                                    onChange={e => setEditForm({...editForm, duration: parseInt(e.target.value)})}
                                    className="bg-transparent border-b border-braid-primary/30 outline-none w-full text-sm"
                                    placeholder="Duration"
                                  />
                                </div>
                                <div 
                                  className="relative h-24 border-2 border-dashed border-braid-primary/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-braid-primary/5 transition-all"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  {uploading ? (
                                    <Loader2 className="animate-spin text-braid-primary" size={20} />
                                  ) : (
                                    <span className="text-[10px] font-bold uppercase text-braid-muted">Change Image</span>
                                  )}
                                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button onClick={handleSaveService} className="text-green-500 hover:scale-110 transition-transform"><Save size={18} /></button>
                              <button onClick={() => setEditingServiceId(null)} className="text-braid-muted hover:scale-110 transition-transform"><X size={18} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <img src={service.image} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                              <div>
                                <h4 className="font-serif italic text-lg">{service.name}</h4>
                                <p className="text-[10px] text-braid-muted uppercase tracking-widest">${service.price / 100} • {service.duration} mins</p>
                              </div>
                            </div>
                            <button onClick={() => handleEditService(service)} className="text-braid-muted hover:text-braid-primary transition-colors">
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            )}

            {activeView === 'bookings' && (
              <GlassCard className="p-0 overflow-hidden">
                 <div className="p-6 border-b border-braid-primary/10 bg-braid-bg/30 flex justify-between items-center">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-braid-muted" size={16} />
                      <input placeholder="Search records..." className="pl-12 pr-4 py-3 bg-white dark:bg-black/20 rounded-xl text-sm outline-none w-64" />
                    </div>
                 </div>
                 <div className="w-full overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-braid-primary/10 text-[10px] font-bold text-braid-muted uppercase tracking-widest bg-braid-bg/30">
                         <th className="p-6">Guest Identity</th>
                         <th className="p-6">Protocol</th>
                         <th className="p-6">Investment</th>
                         <th className="p-6">State</th>
                         <th className="p-6 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-braid-primary/5">
                       {bookings.map((booking) => {
                         const isEditing = editingBookingId === booking.id;
                         const service = services.find(s => s.id === booking.serviceId);
                         return (
                           <tr key={booking.id} className="hover:bg-braid-primary/5 transition-colors">
                             <td className="p-6">
                               {isEditing ? (
                                 <input 
                                  className="bg-transparent border-b border-braid-primary/30 outline-none w-full font-serif italic" 
                                  value={editForm.clientName}
                                  onChange={e => setEditForm({...editForm, clientName: e.target.value})}
                                 />
                               ) : (
                                 <>
                                   <div className="font-serif italic text-lg">{booking.clientName}</div>
                                   <div className="text-[10px] text-braid-muted">{booking.clientEmail}</div>
                                 </>
                               )}
                             </td>
                             <td className="p-6">
                               <span className="text-sm font-medium">{service?.name || 'Protocol Unknown'}</span>
                             </td>
                             <td className="p-6">
                               <div className="flex flex-col">
                                  <span className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-tighter ${booking.paymentStatus === 'PAID' ? 'text-green-500' : 'text-amber-500'}`}>
                                    {booking.paymentStatus === 'PAID' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                    {booking.paymentStatus} • ${(booking.paymentAmount / 100).toFixed(2)}
                                  </span>
                               </div>
                             </td>
                             <td className="p-6">
                               {isEditing ? (
                                 <select 
                                  className="bg-braid-bg dark:bg-black/40 border rounded-lg text-[10px] p-1"
                                  value={editForm.status}
                                  onChange={e => setEditForm({...editForm, status: e.target.value})}
                                 >
                                   <option value="PENDING">PENDING</option>
                                   <option value="CONFIRMED">CONFIRMED</option>
                                   <option value="CANCELLED">CANCELLED</option>
                                 </select>
                               ) : (
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                   booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                                   booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                 }`}>
                                   {booking.status}
                                 </span>
                               )}
                             </td>
                             <td className="p-6 text-right">
                               {isEditing ? (
                                 <div className="flex justify-end gap-2">
                                   <button onClick={handleSaveBooking} className="text-green-500 hover:scale-110 transition-transform"><Save size={18} /></button>
                                   <button onClick={() => setEditingBookingId(null)} className="text-braid-muted hover:scale-110 transition-transform"><X size={18} /></button>
                                 </div>
                               ) : (
                                 <button onClick={() => handleEditBooking(booking)} className="text-braid-muted hover:text-braid-primary"><Edit2 size={16} /></button>
                               )}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
              </GlassCard>
            )}

            {activeView === 'settings' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <GlassCard className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-braid-primary/10 pb-4">
                        <Cloud className="text-braid-primary" size={24} />
                        <h3 className="text-xl font-serif italic">Supabase Cluster</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-braid-muted uppercase font-bold tracking-widest">Database State</span>
                          <span className="text-green-500 font-bold uppercase">Operational</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-braid-muted uppercase font-bold tracking-widest">Auth Protocol</span>
                          <span className="text-braid-primary font-bold uppercase">JWT Secured</span>
                        </div>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard className="space-y-10">
                   <div className="flex items-center gap-4 border-b border-braid-primary/10 pb-6">
                      <Server className="text-braid-primary" size={24} />
                      <div className="space-y-1">
                        <h3 className="text-2xl font-serif italic">Cloud Provider Integration</h3>
                        <p className="text-[10px] text-braid-muted uppercase tracking-[0.2em]">Synchronize with external storage infrastructures</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* AWS Integration */}
                      <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                               <Server size={18} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest">Amazon Web Services (S3)</span>
                         </div>
                         <div className="space-y-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold text-braid-muted ml-2 uppercase">Access Key ID</label>
                               <div className="relative">
                                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-braid-primary/30" size={14} />
                                  <input type="password" placeholder="AKIA..." className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-xl p-3 pl-12 text-xs outline-none focus:border-braid-primary" />
                               </div>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold text-braid-muted ml-2 uppercase">Secret Access Key</label>
                               <div className="relative">
                                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-braid-primary/30" size={14} />
                                  <input type="password" placeholder="••••••••••••" className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-xl p-3 pl-12 text-xs outline-none focus:border-braid-primary" />
                               </div>
                            </div>
                            <Button 
                              variant="outline" 
                              fullWidth 
                              className="h-10 text-[9px]"
                              onClick={() => simulateConnection('aws')}
                              disabled={connectionStatus.aws === 'loading'}
                            >
                              {connectionStatus.aws === 'loading' ? <Loader2 className="animate-spin" size={14} /> : 
                               connectionStatus.aws === 'success' ? 'Connected' : 'Establish AWS Handshake'}
                            </Button>
                         </div>
                      </div>

                      {/* GCP Integration */}
                      <div className="space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                               <Globe size={18} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest">Google Cloud Platform</span>
                         </div>
                         <div className="space-y-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold text-braid-muted ml-2 uppercase">Project ID</label>
                               <div className="relative">
                                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-braid-primary/30" size={14} />
                                  <input type="text" placeholder="artistry-core-..." className="w-full bg-braid-bg dark:bg-black/20 border-2 border-braid-primary/10 rounded-xl p-3 pl-12 text-xs outline-none focus:border-braid-primary" />
                               </div>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold text-braid-muted ml-2 uppercase">Service Account Key (JSON)</label>
                               <div 
                                className="w-full h-24 bg-braid-bg dark:bg-black/20 border-2 border-dashed border-braid-primary/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-braid-primary/5 transition-all"
                               >
                                  <Upload size={18} className="text-braid-primary/30 mb-2" />
                                  <span className="text-[9px] font-bold uppercase text-braid-muted tracking-widest">Drop JSON file</span>
                               </div>
                            </div>
                            <Button 
                              variant="outline" 
                              fullWidth 
                              className="h-10 text-[9px]"
                              onClick={() => simulateConnection('gcp')}
                              disabled={connectionStatus.gcp === 'loading'}
                            >
                              {connectionStatus.gcp === 'loading' ? <Loader2 className="animate-spin" size={14} /> : 
                               connectionStatus.gcp === 'success' ? 'Connected' : 'Establish GCP Handshake'}
                            </Button>
                         </div>
                      </div>
                   </div>
                </GlassCard>
              </div>
            )}
         </div>
      </main>
    </div>
  );
};
