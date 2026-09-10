import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Palette, Check, Upload, Image as ImageIcon, Store } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Skeleton } from '../../components/design-system/Skeleton';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: {
    background: string;
    textColor: string;
    cardBg: string;
    accentColor: string;
  };
}

const themePresets: ThemePreset[] = [
  {
    id: 'MINIMAL',
    name: 'Minimal',
    description: 'Clean, light, and spacious with large food imagery.',
    preview: {
      background: '#FFFFFF',
      textColor: '#1E293B',
      cardBg: '#F8FAFC',
      accentColor: '#E85D3D',
    },
  },
  {
    id: 'BISTRO',
    name: 'Bistro',
    description: 'Warm and elegant with refined typography.',
    preview: {
      background: '#FAF7F2',
      textColor: '#3E2C1C',
      cardBg: '#FFFFFF',
      accentColor: '#C4A052',
    },
  },
  {
    id: 'BOLD',
    name: 'Bold',
    description: 'Dark, modern, and high-contrast for a premium feel.',
    preview: {
      background: '#0F172A',
      textColor: '#FFFFFF',
      cardBg: '#1E293B',
      accentColor: '#E85D3D',
    },
  },
];

export const ThemesPage: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState('MINIMAL');
  const [accentColor, setAccentColor] = useState('#E85D3D');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentTheme, isLoading } = useQuery({
    queryKey: ['theme'],
    queryFn: () => apiRequest('GET', '/themes'),
  });

  useEffect(() => {
    if (currentTheme?.data) {
      setSelectedTheme(currentTheme.data.themePreset || 'MINIMAL');
      setAccentColor(currentTheme.data.accentColor || '#E85D3D');
      setLogoUrl(currentTheme.data.logoUrl || '');
      setCoverUrl(currentTheme.data.coverUrl || '');
    }
  }, [currentTheme]);

  const updateThemeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/themes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme'] });
      toast.success('Theme updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update theme');
    },
  });

  const handleSave = () => {
    updateThemeMutation.mutate({
      themePreset: selectedTheme,
      accentColor,
      logoUrl: logoUrl || undefined,
      coverUrl: coverUrl || undefined,
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiRequest('POST', '/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLogoUrl(response.data.url);
      toast.success('Logo uploaded');
    } catch (error) {
      toast.error('Failed to upload logo');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiRequest('POST', '/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCoverUrl(response.data.url);
      toast.success('Cover image uploaded');
    } catch (error) {
      toast.error('Failed to upload cover image');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Themes</h1>
          <p className="text-sm text-slate-500 mt-1">Customize your customer menu appearance</p>
        </div>
        <Button onClick={handleSave} loading={updateThemeMutation.isPending}>
          Save Changes
        </Button>
      </div>

      {/* Theme Presets */}
      <div className="mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">Choose a Theme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedTheme(preset.id)}
              className={cn(
                'text-left rounded-xl border-2 transition-all p-4 hover:shadow-lg',
                selectedTheme === preset.id
                  ? 'border-[#E85D3D] ring-2 ring-[#E85D3D]/20'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              {/* Preview */}
              <div
                className="rounded-lg overflow-hidden mb-4 h-40"
                style={{ backgroundColor: preset.preview.background }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.preview.accentColor }} />
                    <div>
                      <div className="h-2 w-20 rounded" style={{ backgroundColor: preset.preview.textColor, opacity: 0.8 }} />
                      <div className="h-1.5 w-12 rounded mt-1" style={{ backgroundColor: preset.preview.textColor, opacity: 0.4 }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg p-2" style={{ backgroundColor: preset.preview.cardBg }}>
                      <div className="h-12 rounded mb-1" style={{ backgroundColor: preset.preview.accentColor, opacity: 0.3 }} />
                      <div className="h-2 w-3/4 rounded mb-1" style={{ backgroundColor: preset.preview.textColor, opacity: 0.6 }} />
                      <div className="h-2 w-1/2 rounded" style={{ backgroundColor: preset.preview.textColor, opacity: 0.4 }} />
                    </div>
                    <div className="rounded-lg p-2" style={{ backgroundColor: preset.preview.cardBg }}>
                      <div className="h-12 rounded mb-1" style={{ backgroundColor: preset.preview.accentColor, opacity: 0.3 }} />
                      <div className="h-2 w-3/4 rounded mb-1" style={{ backgroundColor: preset.preview.textColor, opacity: 0.6 }} />
                      <div className="h-2 w-1/2 rounded" style={{ backgroundColor: preset.preview.textColor, opacity: 0.4 }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{preset.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{preset.description}</p>
                </div>
                {selectedTheme === preset.id && (
                  <div className="w-6 h-6 rounded-full bg-[#E85D3D] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accent Color */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Accent Color</h3>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-16 h-16 rounded-lg border-2 border-slate-200 cursor-pointer"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">{accentColor}</p>
              <p className="text-xs text-slate-500 mt-1">Used for buttons and highlights</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {['#E85D3D', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'].map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-all',
                  accentColor === color ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Brand Assets */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Brand Assets</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Restaurant Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Store className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <Button variant="outline" type="button" onClick={() => document.getElementById('logo-upload')?.click()}>
                    <Upload className="w-4 h-4" /> Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="label">Cover Image</label>
              <div className="flex items-center gap-4">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-24 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-24 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <Button variant="outline" type="button" onClick={() => document.getElementById('cover-upload')?.click()}>
                    <Upload className="w-4 h-4" /> Upload Cover
                  </Button>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};