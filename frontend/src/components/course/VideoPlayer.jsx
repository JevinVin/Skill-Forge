import React from 'react';

/**
 * VideoPlayer component — renders YouTube embeds (with modest branding preventing navigation to YouTube)
 * and HTML5 local video uploads natively on the webpage.
 */
const VideoPlayer = ({ videoUrl, videoType, title, onVideoEnded }) => {
  if (!videoUrl) return null;

  // Transform YouTube URL into clean embedded format without external YouTube links
  const getEmbedUrl = (url) => {
    if (!url) return '';
    let embed = url;
    if (url.includes('youtube.com/watch')) {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      embed = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embed = `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Add parameters modestbranding=1, rel=0, iv_load_policy=3 to keep playback inside website
    const separator = embed.includes('?') ? '&' : '?';
    return `${embed}${separator}modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`;
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
          onEnded={() => {
            if (onVideoEnded) onVideoEnded();
          }}
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
