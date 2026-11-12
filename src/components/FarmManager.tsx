// KissanDost AI — Farm Profile & Crop Recovery Timeline Manager
import React, { useState } from 'react';
import {
  Plus,
  Sprout,
} from 'lucide-react';
import { Language, Farm, TimelineEvent, RecommendationResult } from '../types';

interface FarmManagerProps {
  language: Language;
  farms: Farm[];
  activeFarmId: string;
  onSelectFarm: (id: string) => void;
  onAddFarm: (farm: Omit<Farm, 'id' | 'createdAt'>) => void;
  timelineEvents: TimelineEvent[];
  scanHistory: RecommendationResult[];
  onSelectScan: (scan: RecommendationResult) => void;
}

export const FarmManager: React.FC<FarmManagerProps> = ({
  language,
  farms,
  activeFarmId,
  onSelectFarm,
  onAddFarm,
  timelineEvents,
  scanHistory,
  onSelectScan,
}) => {
  const [isAddingFarm, setIsAddingFarm] = useState<boolean>(false);
  const [newFarmName, setNewFarmName] = useState<string>('');
  const [newDistrict, setNewDistrict] = useState<string>('Mardan');
  const [newVillage, setNewVillage] = useState<string>('');
  const [newCropType, setNewCropType] = useState<string>('Tomato');
  const [newArea, setNewArea] = useState<number>(4);
  const [newPlantingDate, setNewPlantingDate] = useState<string>('2026-09-15');

  const handleCreateFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName.trim()) return;

    onAddFarm({
      name: newFarmName,
      district: newDistrict,
      village: newVillage || 'Main Valley',
      cropType: newCropType,
      areaAcres: Number(newArea) || 1,
      plantingDate: newPlantingDate,
    });

    setIsAddingFarm(false);
    setNewFarmName('');
    setNewVillage('');
  };

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0];
  const currentFarmTimeline = timelineEvents.filter((ev) => ev.farmId === activeFarm?.id);

  const getCropLocalized = (crop: string) => {
    const c = crop.toLowerCase();
    if (language === 'ur') {
      if (c.includes('wheat')) return 'گندم';
      if (c.includes('maize')) return 'مکئی';
      return 'ٹماٹر';
    }
    if (language === 'ps') {
      if (c.includes('wheat')) return 'غنم';
      if (c.includes('maize')) return 'جوار';
      return 'رومیان';
    }
    return crop;
  };

  const getDistrictLocalized = (dist: string) => {
    const mapUr: Record<string, string> = {
      Mardan: 'مردان',
      Swabi: 'صوابی',
      Charsadda: 'چارسدہ',
      Peshawar: 'پشاور',
      Nowshera: 'نوشہرہ',
      Malakand: 'ملاکنڈ',
    };
    const mapPs: Record<string, string> = {
      Mardan: 'مردان',
      Swabi: 'صوابۍ',
      Charsadda: 'چارسده',
      Peshawar: 'پېښور',
      Nowshera: 'نوښار',
      Malakand: 'ملاکنډ',
    };
    if (language === 'ur') return mapUr[dist] || dist;
    if (language === 'ps') return mapPs[dist] || dist;
    return dist;
  };

  return (
    <div className="space-y-8 animate-card-fade">
      {/* Section Header + Add Farm Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#17231F] leading-tight">
            {language === 'ur'
              ? 'میرا کھیت اور فصل کا ریکارڈ'
              : language === 'ps'
              ? 'زما پټی او د فصل ریکارډ'
              : 'My Farms & Crop History'}
          </h2>
          <p className="text-[16px] font-normal text-[#6B7280] mt-1">
            {language === 'ur'
              ? 'اپنے کھیت کا انتخاب کریں یا نیا کھیت شامل کریں'
              : language === 'ps'
              ? 'خپل پټی وټاکئ یا نوی پټی اضافه کړئ'
              : 'Select your active field or add a new farm parcel'}
          </p>
        </div>

        <button
          onClick={() => setIsAddingFarm(!isAddingFarm)}
          className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#0F6B4B] hover:bg-[#0A4D36] text-white font-semibold text-[16px] flex items-center gap-2 shadow-[0_8px_24px_rgba(15,107,75,0.2)] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>
            {language === 'ur' ? 'نیا کھیت شامل کریں' : language === 'ps' ? 'نوی پټی شامل کړئ' : 'Add New Farm'}
          </span>
        </button>
      </div>

      {/* Add Farm Form */}
      {isAddingFarm && (
        <form
          onSubmit={handleCreateFarm}
          className="p-6 rounded-[20px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6"
        >
          <h3 className="font-semibold text-[20px] text-[#17231F]">
            {language === 'ur' ? 'نیا کھیت درج کریں' : language === 'ps' ? 'نوی پټی ثبت کړئ' : 'Register New Farm'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[15px]">
            <div>
              <label className="font-semibold text-[13px] text-[#6B7280] block mb-1.5">Farm Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mardan Block B"
                value={newFarmName}
                onChange={(e) => setNewFarmName(e.target.value)}
                className="w-full min-h-[56px] bg-[#F7F8F6] rounded-[14px] px-4 py-3 font-normal text-[#17231F] focus:bg-white focus:ring-2 focus:ring-[#0F6B4B] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-[13px] text-[#6B7280] block mb-1.5">District (KP)</label>
              <select
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                className="w-full min-h-[56px] bg-[#F7F8F6] rounded-[14px] px-4 py-3 font-normal text-[#17231F] focus:bg-white focus:ring-2 focus:ring-[#0F6B4B] focus:outline-hidden"
              >
                <option value="Mardan">Mardan</option>
                <option value="Swabi">Swabi</option>
                <option value="Charsadda">Charsadda</option>
                <option value="Nowshera">Nowshera</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Malakand">Malakand</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[13px] text-[#6B7280] block mb-1.5">Crop</label>
              <select
                value={newCropType}
                onChange={(e) => setNewCropType(e.target.value)}
                className="w-full min-h-[56px] bg-[#F7F8F6] rounded-[14px] px-4 py-3 font-normal text-[#17231F] focus:bg-white focus:ring-2 focus:ring-[#0F6B4B] focus:outline-hidden"
              >
                <option value="Tomato">Tomato</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddingFarm(false)}
              className="min-h-[56px] px-6 py-3 rounded-[16px] bg-[#F7F8F6] text-[#6B7280] text-[15px] font-semibold hover:bg-stone-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[56px] px-8 py-3 rounded-[16px] bg-[#0F6B4B] text-white text-[15px] font-semibold hover:bg-[#0A4D36] cursor-pointer"
            >
              Save Farm
            </button>
          </div>
        </form>
      )}

      {/* Spacious Unbordered Farm Cards: 🌱 ↓ Farm ↓ Crop ↓ District */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {farms.map((f) => {
          const isSelected = activeFarmId === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFarm(f.id)}
              className={`p-6 rounded-[20px] text-start transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-[#0F6B4B] text-white shadow-[0_8px_24px_rgba(15,107,75,0.22)]'
                  : 'bg-white text-[#17231F] shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-2px]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-[22px] ${
                    isSelected ? 'bg-white/15 text-white' : 'bg-[#EBF5F0] text-[#0F6B4B]'
                  }`}
                >
                  🌱
                </div>
                {isSelected && (
                  <span className="text-[12px] font-semibold px-3 py-1 rounded-[12px] bg-[#F6B81A] text-[#17231F]">
                    {language === 'ur' ? 'منتخب کھیت' : language === 'ps' ? 'غوره شوی' : 'Active'}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className={`text-[20px] font-semibold leading-snug ${isSelected ? 'text-white' : 'text-[#17231F]'}`}>
                  {f.name}
                </div>
                <div className={`text-[16px] font-normal ${isSelected ? 'text-white/90' : 'text-[#17231F]'}`}>
                  {getCropLocalized(f.cropType)}
                </div>
                <div className={`text-[13px] font-normal ${isSelected ? 'text-white/75' : 'text-[#6B7280]'}`}>
                  {getDistrictLocalized(f.district)} • {f.areaAcres} {language === 'ur' ? 'ایکڑ' : language === 'ps' ? 'ایکړه' : 'Acres'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Historical Scans List with 72x72 Thumbnails, Severity & Confidence */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div>
          <h3 className="text-[20px] font-semibold text-[#17231F]">
            {language === 'ur'
              ? 'پچھلے معائنوں کا ریکارڈ'
              : language === 'ps'
              ? 'د مخکینیو کتنو ریکارډ'
              : 'Recent Leaf Diagnoses'}
          </h3>
          <p className="text-[13px] font-normal text-[#6B7280] mt-1">
            {language === 'ur'
              ? 'کسی بھی معائنے پر ہاتھ لگا کر مکمل تفصیل دیکھیں'
              : language === 'ps'
              ? 'پر هرې کتنې ګوته کېږدئ او تفصیل وګورئ'
              : 'Tap any previous scan to review the full recommendation'}
          </p>
        </div>

        {scanHistory.length === 0 ? (
          <div className="p-6 rounded-[16px] bg-[#F7F8F6] text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <p className="text-[15px] font-semibold text-[#17231F]">
              {language === 'ur'
                ? 'ابھی تک کوئی اسکین محفوظ نہیں ہے'
                : language === 'ps'
                ? 'تراوسه کوم سکین نه دی ثبت شوی'
                : 'No scans recorded yet'}
            </p>
            <p className="text-[13px] text-[#6B7280]">
              {language === 'ur'
                ? 'جب آپ پتے کی تصویر اسکین کریں گے تو وہ یہاں نظر آئے گی۔'
                : language === 'ps'
                ? 'کله چې تاسو د پاڼې تصویر سکین کړئ، دلته به ښکاره شي.'
                : 'Scanned leaves will appear here for quick reference.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scanHistory.map((scan) => {
              const dot =
                scan.severity === 'Healthy'
                  ? '🟢'
                  : scan.severity === 'Severe'
                  ? '🔴'
                  : '🟡';
              const localizedDisease =
                language === 'ur' && scan.translations?.ur?.disease
                  ? scan.translations.ur.disease
                  : language === 'ps' && scan.translations?.ps?.disease
                  ? scan.translations.ps.disease
                  : scan.disease;

              return (
                <div
                  key={scan.scanId}
                  onClick={() => onSelectScan(scan)}
                  className="p-4 rounded-[20px] bg-[#F7F8F6] hover:bg-[#EBF5F0] transition-all flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {scan.imageUrl ? (
                      <img
                        src={scan.imageUrl}
                        alt={scan.crop}
                        className="w-[72px] h-[72px] rounded-[16px] object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-[16px] bg-[#EBF5F0] text-[#0F6B4B] flex items-center justify-center shrink-0">
                        <Sprout className="w-8 h-8" />
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <div className="font-semibold text-[#17231F] text-[16px] truncate">
                        {localizedDisease}
                      </div>
                      <div className="text-[13px] font-normal text-[#6B7280] flex items-center gap-2">
                        <span>{dot} {scan.severity}</span>
                        <span>•</span>
                        <span>{getDistrictLocalized(scan.district)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <span className="text-[13px] font-semibold text-[#0F6B4B] bg-white px-3 py-1 rounded-[12px] shadow-2xs">
                      {scan.crop}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Crop Recovery Timeline */}
      <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[12px] font-normal text-[#6B7280] block">
              ✓ Crop Recovery Tracker
            </span>
            <h3 className="text-[20px] font-semibold text-[#17231F] mt-0.5">
              {activeFarm.name}
            </h3>
          </div>
          <span className="text-[13px] font-semibold text-[#0F6B4B] bg-[#EBF5F0] px-3.5 py-1.5 rounded-[12px]">
            {getCropLocalized(activeFarm.cropType)}
          </span>
        </div>

        <div className="space-y-4">
          {currentFarmTimeline.map((item) => (
            <div key={item.id} className="p-5 rounded-[16px] bg-[#F7F8F6] space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded-[10px] bg-[#EBF5F0] text-[#0F6B4B]">
                    {item.dayLabel}
                  </span>
                  <h4 className="font-semibold text-[#17231F] text-[16px]">{item.title}</h4>
                </div>
                <span className="text-[12px] font-normal text-[#6B7280]">{item.date}</span>
              </div>

              <p className="text-[15px] font-normal text-[#6B7280]">{item.description}</p>

              {item.pesticideUsed && (
                <div className="pt-1 text-[13px] font-semibold text-[#0F6B4B]">
                  ✓ {item.pesticideUsed}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
