import React, { useState } from 'react';
import {
  Film,
  Download,
  Share2,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Project } from '../types/filmStudio';

interface RenderPageProps {
  project: Project;
}

export const RenderPage: React.FC<RenderPageProps> = ({ project }) => {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendered, setIsRendered] = useState(false);

  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          setIsRendered(true);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
          Master Film Render & Cloud Assembly
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
          FFmpeg Celery worker stitches video clips, normalizes audio stems, and bakes subtitles into a 1080p master cut.
        </p>
      </div>

      {/* Render Spec Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          padding: '28px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              {project.title}
            </h2>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Master Delivery Package</span>
          </div>

          <span
            style={{
              backgroundColor: isRendered ? '#ECFDF5' : '#FEF3C7',
              color: isRendered ? '#065F46' : '#92400E',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '9999px',
              border: isRendered ? '1px solid #A7F3D0' : '1px solid #FDE68A',
            }}
          >
            {isRendered ? '✓ Film Ready for Export' : 'Ready to Render'}
          </span>
        </div>

        {/* Specifications Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Final Duration</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>02:00 (120s)</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Resolution</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>1080p FHD (24fps)</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Aspect Ratio</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>16:9 Widescreen</div>
          </div>
          <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Audio & Subs</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Stereo • Subs On</div>
          </div>
        </div>

        {/* Progress or Render Action */}
        {isRendering ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
              <span style={{ color: '#64748B' }}>FFmpeg stitching audio & video tracks...</span>
              <span style={{ fontWeight: 700, color: '#D97706' }}>{renderProgress}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${renderProgress}%`, height: '100%', backgroundColor: '#D97706', borderRadius: '9999px', transition: 'width 0.2s' }} />
            </div>
          </div>
        ) : isRendered ? (
          <div>
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#16A34A" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>Film Ready</div>
                  <div style={{ fontSize: '12px', color: '#15803D' }}>
                    Uploaded to: <code>s3://film-studio-assets/the_last_signal_master_1080p.mp4</code>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => alert('Playing final rendered master cut...')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Play size={15} fill="#FFFFFF" />
                <span>Play Film</span>
              </button>

              <button
                onClick={() => alert('Downloading MP4 (1080p, 184 MB)...')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Download size={15} />
                <span>Download MP4</span>
              </button>

              <button
                onClick={() => alert('Shareable screening link copied to clipboard!')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={15} />
                <span>Share Screening Link</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleStartRender}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Film size={16} />
              <span>Render Final Film</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
