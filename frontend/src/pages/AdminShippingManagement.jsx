import React, { useEffect, useMemo, useState, useRef } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { adminSettingsService } from '../services/adminSettingsService';
import { CheckCircle, Globe2, MapPin, Package, Plus, Save, Settings2, ShipWheel, Trash2, Truck } from 'lucide-react';

const resourceConfig = {
  countries: {
    title: 'Countries',
    subtitle: 'Enable or disable markets and set billing currency.',
    fields: [
      { name: 'name', label: 'Country Name', type: 'text' },
      { name: 'code', label: 'Country Code', type: 'text' },
      { name: 'currency', label: 'Currency', type: 'text' },
      { name: 'flag', label: 'Flag URL', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      { name: 'isDomestic', label: 'Domestic', type: 'checkbox' },
    ],
    defaults: { name: '', code: '', currency: 'INR', flag: '', status: 'active', isDomestic: false },
  },
  states: {
    title: 'Indian States',
    subtitle: 'Maintain domestic delivery coverage.',
    fields: [
      { name: 'name', label: 'State Name', type: 'text' },
      { name: 'code', label: 'State Code', type: 'text' },
      { name: 'country', label: 'Country ID', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
    defaults: { name: '', code: '', country: '', status: 'active' },
  },
  ports: {
    title: 'Ports',
    subtitle: 'Add domestic and international logistics points.',
    fields: [
      { name: 'name', label: 'Port Name', type: 'text' },
      { name: 'code', label: 'Port Code', type: 'text' },
      { name: 'country', label: 'Country ID', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
    defaults: { name: '', code: '', country: '', status: 'active' },
  },
  shippingmethods: {
    title: 'Shipping Methods',
    subtitle: 'Domestic and international service types.',
    fields: [
      { name: 'name', label: 'Method Name', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: ['domestic', 'international', 'both'] },
      { name: 'mode', label: 'Mode', type: 'select', options: ['road', 'rail', 'sea', 'air', 'container', 'lcl', 'ftl', 'ptl', 'other'] },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
    defaults: { name: '', category: 'both', mode: 'other', status: 'active' },
  },
  shippingrates: {
    title: 'Shipping Rates',
    subtitle: 'Country-wise route pricing and transit time.',
    fields: [
      { name: 'originCountry', label: 'Origin Country ID', type: 'text' },
      { name: 'destinationCountry', label: 'Destination Country ID', type: 'text' },
      { name: 'shippingMethod', label: 'Method ID', type: 'text' },
      { name: 'shippingCost', label: 'Shipping Cost', type: 'number' },
      { name: 'transitTimeDays', label: 'Transit Time Days', type: 'number' },
      { name: 'minOrderQuantity', label: 'Minimum Qty', type: 'number' },
      { name: 'maxOrderQuantity', label: 'Maximum Qty', type: 'number' },
      { name: 'currency', label: 'Currency', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
    defaults: { originCountry: '', destinationCountry: '', shippingMethod: '', shippingCost: 0, transitTimeDays: 0, minOrderQuantity: 0, maxOrderQuantity: 0, currency: 'INR', status: 'active' },
  },
  containercharges: {
    title: 'Container Charges',
    subtitle: 'Freight, handling, documentation and customs charges.',
    fields: [
      { name: 'country', label: 'Origin Country ID', type: 'text' },
      { name: 'destinationCountry', label: 'Destination Country ID', type: 'text' },
      { name: 'containerType', label: 'Container Type', type: 'select', options: ['20FT FCL', '40FT FCL', 'LCL'] },
      { name: 'baseFreightCost', label: 'Base Freight Cost', type: 'number' },
      { name: 'portHandlingCharges', label: 'Port Handling Charges', type: 'number' },
      { name: 'documentationCharges', label: 'Documentation Charges', type: 'number' },
      { name: 'customClearanceCharges', label: 'Custom Clearance Charges', type: 'number' },
      { name: 'currency', label: 'Currency', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
    defaults: { country: '', destinationCountry: '', containerType: '20FT FCL', baseFreightCost: 0, portHandlingCharges: 0, documentationCharges: 0, customClearanceCharges: 0, currency: 'USD', status: 'active' },
  },
  exportcharges: {
    title: 'Export Charges',
    subtitle: 'Documentation, certificate and customs fees.',
    fields: [
      { name: 'name', label: 'Charge Name', type: 'text' },
      { name: 'feeType', label: 'Fee Type', type: 'select', options: ['export_documentation', 'certificate', 'customs_handling', 'inspection', 'other'] },
      { name: 'country', label: 'Country ID (optional)', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'currency', label: 'Currency', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
    defaults: { name: '', feeType: 'other', country: '', amount: 0, currency: 'USD', status: 'active' },
  },
  shippingzones: {
    title: 'Shipping Zones',
    subtitle: 'Define origin-to-destination lanes and port coverage.',
    fields: [
      { name: 'name', label: 'Zone Name', type: 'text' },
      { name: 'originCountry', label: 'Origin Country ID', type: 'text' },
      { name: 'destinationCountry', label: 'Destination Country ID', type: 'text' },
      { name: 'states', label: 'State IDs comma-separated', type: 'text' },
      { name: 'ports', label: 'Port IDs comma-separated', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
    defaults: { name: '', originCountry: '', destinationCountry: '', states: '', ports: '', status: 'active' },
  },
};

const resourceOrder = ['countries', 'states', 'ports', 'shippingmethods', 'shippingrates', 'containercharges', 'exportcharges', 'shippingzones'];

export default function AdminShippingManagement() {
  const [activeTab, setActiveTab] = useState('countries');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [formData, setFormData] = useState(resourceConfig.countries.defaults);
  const latestTab = useRef(activeTab);

  useEffect(() => {
    latestTab.current = activeTab;
  }, [activeTab]);

  const activeConfig = resourceConfig[activeTab];

  const renderTitle = (item, tab) => {
    if (tab === 'shippingrates') return `${item.originCountry?.name || 'Unknown'} → ${item.destinationCountry?.name || 'Unknown'}`;
    if (tab === 'containercharges') return `${item.country?.name || 'Unknown'} → ${item.destinationCountry?.name || 'Unknown'} (${item.containerType || 'Any'})`;
    if (tab === 'shippingzones') return item.name || `${item.originCountry?.name || 'Unknown'} → ${item.destinationCountry?.name || 'Unknown'}`;
    if (tab === 'exportcharges') return `${item.name} (${item.country ? item.country.name : 'Global'})`;
    if (tab === 'ports') return `${item.name} (${item.country?.name || 'Unknown'})`;
    return item.name || item.country?.name || item.code || item.containerType || item.feeType || 'Unnamed Record';
  };

  const renderSubtitle = (item, tab) => {
    if (tab === 'shippingrates') return `${item.shippingMethod?.name || 'Any Method'} - ${item.currency || 'USD'} ${item.shippingCost || 0} (${item.transitTimeDays || 0} Days)`;
    if (tab === 'containercharges') return `Base Freight: ${item.currency || 'USD'} ${item.baseFreightCost || 0}`;
    if (tab === 'exportcharges') return `Type: ${item.feeType} - ${item.currency || 'USD'} ${item.amount || 0}`;
    if (tab === 'shippingmethods') return `${item.category} - ${item.mode}`;
    return item.code || item.currency || item.mode || item.containerType || item.amount || item.shippingCost || '';
  };

  const loadResource = async (resource = activeTab) => {
    setLoading(true);
    try {
      const res = await adminSettingsService.listShippingResource(resource);
      if (resource === latestTab.current) {
        setItems(res.data || []);
      }
    } catch (err) {
      if (resource === latestTab.current) {
        setError(err.response?.data?.message || 'Failed to load shipping data');
      }
    } finally {
      if (resource === latestTab.current) {
        setLoading(false);
      }
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await adminSettingsService.getShippingAnalytics();
      setAnalytics(res.data);
    } catch {
      setAnalytics(null);
    }
  };

  useEffect(() => {
    loadResource(activeTab);
    loadAnalytics();
  }, [activeTab]);

  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => { setSuccess(''); setError(''); }, 5000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(activeConfig.defaults);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    const next = { ...activeConfig.defaults };
    activeConfig.fields.forEach((field) => {
      if (field.type === 'checkbox') {
        next[field.name] = Boolean(item[field.name]);
      } else if (field.name === 'states' || field.name === 'ports') {
        next[field.name] = Array.isArray(item[field.name]) ? item[field.name].map((value) => value?._id || value).join(',') : '';
      } else {
        let val = item[field.name];
        if (val && typeof val === 'object' && !Array.isArray(val) && val._id) {
          val = val._id;
        }
        next[field.name] = val ?? next[field.name];
      }
    });
    setEditingId(item._id);
    setFormData(next);
    setFormOpen(true);
  };

  const saveRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (activeTab === 'shippingzones') {
        payload.states = payload.states ? String(payload.states).split(',').map((value) => value.trim()).filter(Boolean) : [];
        payload.ports = payload.ports ? String(payload.ports).split(',').map((value) => value.trim()).filter(Boolean) : [];
      }
      if (activeTab === 'countries') payload.isDomestic = Boolean(payload.isDomestic);

      const writer = editingId
        ? adminSettingsService.updateShippingResource(activeTab, editingId, payload)
        : adminSettingsService.createShippingResource(activeTab, payload);
      await writer;
      setSuccess(`${activeConfig.title.slice(0, -1)} saved successfully`);
      setFormOpen(false);
      setEditingId(null);
      loadResource(activeTab);
      loadAnalytics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record');
    }
  };

  const removeRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await adminSettingsService.deleteShippingResource(activeTab, id);
      setSuccess('Record deleted successfully');
      loadResource(activeTab);
      loadAnalytics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto pb-10 space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white p-6 md:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">
                <ShipWheel size={14} /> Global Shipping & Export
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight">Shipping Management Console</h1>
              <p className="mt-2 text-sm text-slate-300 max-w-3xl">Manage countries, ports, routes, container fees, export charges, and shipping lanes from one compact dashboard.</p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2.5 text-sm font-black shadow-lg hover:bg-emerald-50">
              <Plus size={16} /> Add {activeConfig.title.slice(0, -1)}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          {resourceOrder.map((resource) => {
            const cfg = resourceConfig[resource];
            return (
              <button key={resource} onClick={() => { setActiveTab(resource); setFormOpen(false); }} className={`rounded-2xl px-3 py-3 text-left border transition ${activeTab === resource ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}>
                <div className="text-[10px] uppercase tracking-[0.28em] font-black opacity-70">{cfg.title}</div>
                {activeTab === resource && <div className="mt-1 text-xs font-semibold opacity-90">{items.length} records</div>}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">{activeConfig.title}</h2>
                <p className="text-sm text-slate-500">{activeConfig.subtitle}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold">{loading ? 'Loading...' : `${items.length} items`}</div>
            </div>

            {formOpen ? (
              <form onSubmit={saveRecord} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeConfig.fields.map((field) => (
                    <div key={field.name} className={field.type === 'checkbox' ? 'md:col-span-2' : ''}>
                      <label className="block text-xs font-black uppercase tracking-[0.24em] text-slate-500 mb-2">{field.label}</label>
                      {field.type === 'select' ? (
                        <select value={formData[field.name] ?? ''} onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500">
                          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <input type="checkbox" checked={Boolean(formData[field.name])} onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                          <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                        </label>
                      ) : (
                        <input type={field.type} value={formData[field.name] ?? ''} onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder={field.label} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700">
                    <Save size={16} /> Save
                  </button>
                  <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Record</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Status</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{renderTitle(item, activeTab)}</div>
                          <div className="text-xs text-slate-500">{renderSubtitle(item, activeTab)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            <CheckCircle size={12} /> {item.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(item)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                              <Settings2 size={16} />
                            </button>
                            <button onClick={() => removeRecord(item._id)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!items.length && (
                      <tr>
                        <td colSpan="3" className="px-6 py-10 text-center text-sm text-slate-500">No records yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-4 xl:sticky xl:top-6 h-fit">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-[0.22em] text-[10px]">
                <Globe2 size={14} /> Shipping Analytics
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Domestic Orders</span><div className="text-lg font-black text-slate-900">{analytics?.domesticOrders ?? 0}</div></div>
                <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">International Orders</span><div className="text-lg font-black text-slate-900">{analytics?.internationalOrders ?? 0}</div></div>
                <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Average Shipping Cost</span><div className="text-lg font-black text-slate-900">{analytics?.averageShippingCost ?? 0}</div></div>
                <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Container Utilization</span><div className="text-lg font-black text-slate-900">{analytics?.containerUtilization ?? 0}%</div></div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-[0.22em] text-[10px]"><Package size={14} /> Quick Setup</div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2"><Truck size={14} className="mt-0.5 text-emerald-600" /> Add India as domestic origin and enable states for local delivery.</li>
                <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-emerald-600" /> Add ports for export lanes and route them through shipping zones.</li>
                <li className="flex items-start gap-2"><Settings2 size={14} className="mt-0.5 text-emerald-600" /> Configure rates, charges, and container fees to power checkout quotes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
