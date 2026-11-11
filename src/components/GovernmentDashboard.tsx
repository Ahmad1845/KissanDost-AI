import React, { useState } from 'react';
import {
  Building2,
  Download,
  Send,
  BarChart3,
  MapPin,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Printer,
  Users,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { KP_DISTRICTS_SURVEILLANCE } from '../data/knowledgeBase';

interface GovernmentDashboardProps {
  language: Language;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [broadcastDistrict, setBroadcastDistrict] = useState<string>('Mardan');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'URGENT ADVISORY: Tomato Early Blight outbreak cluster detected across Gujar Garhi & Toru. Delay spraying if rain is forecasted. Apply approved Mancozeb 75 WP during morning dry window only.'
  );
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  const diseaseFrequencies = [
    { name: 'Tomato Early Blight', percent: 45, color: 'bg-red-500' },
    { name: 'Wheat Stripe Rust', percent: 26, color: 'bg-amber-500' },
    { name: 'Northern Corn Leaf Blight', percent: 18, color: 'bg-teal-500' },
    { name: 'Powdery Mildew & Other', percent: 11, color: 'bg-stone-400' },
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 4000);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Officer Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-white flex items-center justify-center shrink-0 shadow-md">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {t.govTitle}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {t.govBadge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Khyber Pakhtunkhwa Disease Surveillance & Decision Support Unit • Extension Officer: <strong>Ayesha Khan</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>{t.exportReportBtn}</span>
            </button>
          </div>
        </div>

        {/* High-Level Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 font-medium block mb-1">Piloting Farmers</span>
            <div className="text-2xl font-black text-stone-900">540+</div>
            <span className="text-[11px] text-emerald-700 font-semibold">Mardan & Swabi cluster</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 font-medium block mb-1">Pesticide Reduction</span>
            <div className="text-2xl font-black text-emerald-800">18.4%</div>
            <span className="text-[11px] text-emerald-700 font-semibold">Avoided unnecessary sprays</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 font-medium block mb-1">Avg Recommendation Latency</span>
            <div className="text-2xl font-black text-stone-900">4.2s</div>
            <span className="text-[11px] text-stone-500 font-semibold">Gemini 3.8 Flash Vision</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-xs text-stone-500 font-medium block mb-1">Surveillance Uptime</span>
            <div className="text-2xl font-black text-emerald-800">99.8%</div>
            <span className="text-[11px] text-stone-500 font-semibold">All KP servers operational</span>
          </div>
        </div>
      </div>

      {/* Disease Distribution & District Outbreak Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Frequency Bar Chart (PRD Chapter 11.7) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">{t.diseaseDistribution}</h3>
            <span className="text-xs text-stone-500">Last 30 Days</span>
          </div>

          <div className="space-y-4 pt-2">
            {diseaseFrequencies.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-800">{d.name}</span>
                  <span className="text-stone-900 font-bold">{d.percent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200 mt-4">
            <strong>Key Finding:</strong> Tomato Early Blight in Mardan continues to drive 45% of crop health inquiries, triggered by unseasonable morning showers and high night humidity.
          </div>
        </div>

        {/* District Matrix Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base">{t.districtOverview}</h3>
            <span className="text-xs text-stone-500">Surveillance Status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">District</th>
                  <th className="py-2.5 px-3 font-bold">Primary Pathogen</th>
                  <th className="py-2.5 px-3 font-bold">Active Cases</th>
                  <th className="py-2.5 px-3 font-bold">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {KP_DISTRICTS_SURVEILLANCE.map((row) => (
                  <tr key={row.district} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-bold text-stone-900">{row.district}</td>
                    <td className="py-2.5 px-3 text-stone-600">{row.primaryDisease}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800">{row.activeOutbreaks}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.riskLevel === 'High Risk'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : row.riskLevel === 'Watch'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {row.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Broadcast Alert to District Farmers (FR-015 Notifications) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-stone-900 text-base">{t.broadcastModalTitle}</h3>
        </div>
        <p className="text-xs text-stone-500">
          Push early warning notifications directly to registered farmers in high-risk union councils.
        </p>

        <form onSubmit={handleBroadcast} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Target District</label>
              <select
                value={broadcastDistrict}
                onChange={(e) => setBroadcastDistrict(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs font-medium"
              >
                <option value="Mardan">Mardan (High Risk)</option>
                <option value="Swabi">Swabi (Watch)</option>
                <option value="Charsadda">Charsadda (Watch)</option>
                <option value="Nowshera">Nowshera (Watch)</option>
                <option value="Peshawar">Peshawar (Normal)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1">Advisory Message</label>
              <input
                type="text"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-stone-400">
              Estimated reach: ~320 farmers in {broadcastDistrict} district
            </span>
            <button
              type="submit"
              disabled={isBroadcasting}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? 'Broadcasting...' : t.broadcastAlertBtn}</span>
            </button>
          </div>
        </form>

        {broadcastSent && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Outbreak advisory successfully dispatched to all registered farmers in {broadcastDistrict}!</span>
          </div>
        )}
      </div>
    </div>
  );
};
