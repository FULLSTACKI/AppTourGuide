import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { adminDishesService } from '../../services/adminService';
import type { DishTranslationInput } from '../../types/admin';

const LANGS = [
  { code: 'vi', label: '🇻🇳 Vietnamese' },
  { code: 'en', label: '🇬🇧 English' },
];

function emptyTranslations(): DishTranslationInput[] {
  return LANGS.map(l => ({
    languageCode: l.code,
    name: '',
    description: '',
  }));
}

const DishForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const placeId = searchParams.get('placeId') ?? '';
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState('');
  const [translations, setTranslations] = useState<DishTranslationInput[]>(emptyTranslations());
  const [activeLang, setActiveLang] = useState('vi');
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState('');

  // ─── Load existing dish data ───────────────────────────────
  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        const [vi, en] = await Promise.all([
          adminDishesService.getById(id, 'vi'),
          adminDishesService.getById(id, 'en'),
        ]);

        setImageUrl(vi.imageUrl ?? '');

        setTranslations([
          {
            languageCode: 'vi',
            name: vi.translation?.name ?? '',
            description: vi.translation?.description ?? '',
          },
          {
            languageCode: 'en',
            name: en.translation?.name ?? '',
            description: en.translation?.description ?? '',
          },
        ]);
      } catch {
        setError('Failed to load dish data.');
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [id, isEdit]);

  const currentTrans = translations.find(t => t.languageCode === activeLang)!;

  const setTransField = (field: keyof DishTranslationInput, value: string) => {
    setTranslations(prev =>
      prev.map(t => (t.languageCode === activeLang ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEdit && id) {
        await adminDishesService.update(id, { imageUrl, translations });
      } else {
        await adminDishesService.create({ placeId, imageUrl, translations });
      }
      navigate('/admin/dishes');
    } catch {
      setError('Failed to save dish.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return <div className="text-center py-16 text-gray-400">Loading dish data…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? '✏️ Edit Dish' : '➕ New Dish'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">🖼 Image</h2>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/dish.jpg"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>

        {/* Multilingual tabs */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            🌐 Translations
          </h2>

          <div className="flex border-b border-gray-200 mb-4">
            {LANGS.map(l => (
              <button
                key={l.code}
                type="button"
                onClick={() => setActiveLang(l.code)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
                  ${activeLang === l.code
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Dish Name ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                required
                value={currentTrans.name}
                onChange={e => setTransField('name', e.target.value)}
                placeholder="Dish name…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Description ({activeLang.toUpperCase()})
              </label>
              <textarea
                rows={3}
                value={currentTrans.description}
                onChange={e => setTransField('description', e.target.value)}
                placeholder="Description…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50
                       text-white font-semibold rounded-lg px-6 py-2.5 text-sm
                       shadow-md transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Update Dish' : 'Create Dish'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dishes')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DishForm;
