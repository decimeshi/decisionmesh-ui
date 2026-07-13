import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * YouTube embed, done properly.
 *
 * TWO DELIBERATE CHOICES:
 *
 * 1. Facade pattern — renders a thumbnail, and only loads YouTube's iframe when the
 *    user actually clicks play. A raw <iframe> pulls ~1.5 MB of player JS on every
 *    page load, whether or not anyone watches. On a landing page that is most of your
 *    Lighthouse score, gone, for a video 90% of visitors never start.
 *
 * 2. youtube-nocookie.com — YouTube's privacy-enhanced domain. No tracking cookies
 *    are set until playback begins. This matters more for you than for most: a product
 *    that sells "control what data leaves the building" should not quietly ship
 *    third-party tracking to every visitor before they consent. Prospects in
 *    compliance roles do check.
 */
export default function VideoEmbed({
  videoId,
  title = 'DecisionMesh — product overview',
  className = '',
}) {
  const [playing, setPlaying] = useState(false);

  // maxres isn't guaranteed to exist; hqdefault always does. Fall back on error.
  const [thumb, setThumb] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-slate-900 ${className}`}
      style={{ aspectRatio: '16 / 9' }}
    >
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <img
            src={thumb}
            onError={() => setThumb(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />

          {/* Dark scrim so the play button reads on any thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform group-hover:scale-110">
              <Play size={24} className="ml-1 fill-slate-900 text-slate-900" />
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-left">
            <p className="text-sm font-medium text-white drop-shadow">{title}</p>
          </div>
        </button>
      )}
    </div>
  );
}
