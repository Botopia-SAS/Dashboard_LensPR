"use client";
import React, { useState } from 'react';
import { SocialLinks } from '@/types/blogs';

type Props = {
  value: SocialLinks | undefined;
  onChange: (val: SocialLinks) => void;
};

const providerIcons: Record<string,string> = {
  tiktok: 'https://res.cloudinary.com/dqay3uml6/image/upload/v1758145152/Tiktok_kwast3.png',
  instagram: 'https://res.cloudinary.com/dqay3uml6/image/upload/v1758144936/Instagram_tb7bnr.png',
  facebook: 'https://res.cloudinary.com/dqay3uml6/image/upload/v1758144935/Facebook_bgssy3.png',
  x: 'https://res.cloudinary.com/dqay3uml6/image/upload/v1758144931/x_j3mqpv.webp',
  linkedin: 'https://res.cloudinary.com/dqay3uml6/image/upload/v1758144930/Linkedin_cp5k1e.png'
};

const providers: { key: keyof SocialLinks; label: string; placeholder: string; icon: string }[] = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/tu_pagina', icon: providerIcons.facebook },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tu_usuario', icon: providerIcons.instagram },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@tu_usuario', icon: providerIcons.tiktok },
  { key: 'x', label: 'X', placeholder: 'https://x.com/tu_usuario', icon: providerIcons.x },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/tu_usuario', icon: providerIcons.linkedin },
];

export default function SocialLinksForm({ value, onChange }: Props){
  const v = value || {};
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const toggle = (key: keyof SocialLinks, enabled: boolean) => {
    const next: SocialLinks = { ...v };
    if (!enabled) {
      delete next[key];
    } else {
      if (key === 'custom') {
        next[key] = [];
      } else {
        (next as Record<string, string>)[key] = '';
      }
    }
    onChange(next);
  };

  const update = (key: keyof SocialLinks, url: string) => {
    onChange({ ...v, [key]: url });
  };

  const addCustom = () => {
    const label = prompt('Nombre del botón personalizado (ej: Behance)');
    if (!label) return;
    const url = prompt('URL completa (incluye https://)');
    if (!url) return;
    const icon_url = prompt('URL del icono (opcional)');
    const list = v.custom ? [...v.custom] : [];
    list.push({ label, url, icon_url: icon_url || undefined });
    onChange({ ...v, custom: list });
  };

  const removeCustom = (idx: number) => {
    const list = (v.custom || []).slice();
    list.splice(idx,1);
    const next: SocialLinks = { ...v };
    if (list.length) next.custom = list; else delete next.custom;
    onChange(next);
  };

  const updateCustom = (idx: number, field: 'label' | 'url' | 'icon_url', val: string | undefined) => {
    const list = (v.custom || []).slice();
    const item = { ...list[idx], [field]: val };
    list[idx] = item;
    onChange({ ...v, custom: list });
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      const resp = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, { method:'POST', body: fd });
      const data = await resp.json();
      return data.secure_url || null;
    } catch (e){
      console.error('Error subiendo icono', e);
      return null;
    }
  };

  const handleIconUpload = async (idx:number, file:File) => {
    setUploadingIndex(idx);
    const url = await uploadToCloudinary(file);
    if (url) updateCustom(idx,'icon_url', url);
    setUploadingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Redes Sociales</h3>
        <p className="text-sm text-gray-600">Selecciona las redes que quieres mostrar y agrega los enlaces.</p>
      </div>

      <div className="space-y-4">
        {providers.map(p => {
          const enabled = typeof v[p.key] === 'string';
          return (
            <div key={p.key} className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={e => toggle(p.key, e.target.checked)}
                />
                <span className="text-sm font-medium flex items-center gap-2">
                  <img src={p.icon} alt={p.label} className="w-4 h-4 object-contain" />
                  {p.label}
                </span>
              </label>
              {enabled && (
                <input
                  type="text"
                  className="border border-gray-300 rounded-md p-2 w-full text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder={p.placeholder}
                  value={(typeof v[p.key] === 'string' ? v[p.key] : '') as string}
                  onChange={e => update(p.key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Personalizados</h4>
          <button
            type="button"
            onClick={addCustom}
            className="px-2 py-1 text-sm border rounded bg-white hover:bg-gray-50"
          >+ Añadir</button>
        </div>
        {(v.custom || []).length === 0 && (
          <p className="text-sm text-gray-500">No hay botones personalizados.</p>
        )}
        <div className="space-y-3">
          {(v.custom || []).map((c, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-md p-3 bg-gray-50/40"
            >
              <div className="grid gap-3 md:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Etiqueta</label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    value={c.label}
                    placeholder="Ej: Behance"
                    onChange={e => updateCustom(idx,'label', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">URL</label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md px-2 py-1.5 w-full text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    value={c.url}
                    placeholder="https://..."
                    onChange={e => updateCustom(idx,'url', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 flex items-center justify-between">
                    <span>Icono</span>
                    <button
                      type="button"
                      onClick={() => removeCustom(idx)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold ml-2"
                      aria-label="Eliminar personalizado"
                    >×</button>
                  </label>
                  <div className="flex items-center gap-2">
                    {c.icon_url ? (
                      <img src={c.icon_url} alt={c.label} className="w-8 h-8 object-contain border rounded" />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-[10px] text-gray-400 border rounded">N/A</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => { const file = e.target.files?.[0]; if(file) handleIconUpload(idx,file); }}
                      className="text-xs"
                    />
                  </div>
                  {uploadingIndex === idx && <p className="text-[11px] text-gray-500 mt-1">Subiendo...</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
