import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { mockAssetsList } from '../data/mockData';

export const AssetsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'character', 'location', 'video', 'voice', 'music', 'sfx'];

  const filtered = mockAssetsList.filter((ast) => {
    const matchCat = activeCategory === 'all' || ast.type === activeCategory;
    const matchSearch = ast.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Film Asset Library
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
            All neural models, audio stems, and environment plates generated for THE LAST SIGNAL.
          </p>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 12px' }}>
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="Filter assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#0F172A', width: '160px' }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: activeCategory === cat ? '#D97706' : '#E2E8F0',
              backgroundColor: activeCategory === cat ? '#FEF3C7' : '#FFFFFF',
              color: activeCategory === cat ? '#92400E' : '#64748B',
              fontSize: '12px',
              fontWeight: activeCategory === cat ? 700 : 500,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Assets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {filtered.map((ast) => (
          <div
            key={ast.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={ast.thumbnailUrl}
                alt={ast.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: '#F8FAFC',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {ast.type}
              </span>
            </div>

            <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px', lineHeight: 1.3 }}>
                  {ast.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px' }}>
                  {ast.format}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>Used in {ast.usedInShotsCount} shots</span>
                {ast.consistencyScore && (
                  <span style={{ color: '#7C3AED', fontWeight: 700 }}>{ast.consistencyScore}% vector</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
