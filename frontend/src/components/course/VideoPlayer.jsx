import React from 'react';

/**
 * VideoPlayer component — handles responsive YouTube video embeds and HTML5 local video uploads.
 */
const VideoPlayer = ({ videoUrl, videoType, title }) => {
  if (!videoUrl) return null;

  // Transform standard YouTube watch URL (youtube.com/watch?v=XYZ) to embed format (youtube.com/embed/XYZ)
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtube.com/watch')) {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isYouTube = videoType === 'YOUTUBE' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  return (
    <div style={{
      marginTop: '16px',
      marginBottom: '20px',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      backgroundColor: '#000000',
    }}>
      {isYouTube ? (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            src={getEmbedUrl(videoUrl)}
            title={title || 'Video Lesson'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        </div>
      ) : (
        <video
          controls
          controlsList="nodownload"
          style={{ width: '100%', maxHeight: '500px', display: 'block' }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support HTML5 video playback.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
