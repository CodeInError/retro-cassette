import { useRef, useState, useEffect } from "react";
import YouTube from "react-youtube";
import { Radio } from "lucide-react";

import {
  MoreHorizontal,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Square,
} from "lucide-react";

import "./App.css";


// ============================================================
// YOUTUBE PLAYLIST ID
// ============================================================

const YOUTUBE_PLAYLIST_ID =
  "PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4";


function App() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [isPlaying, setIsPlaying] = useState(false);

  const [currentSong, setCurrentSong] = useState({
    title: "Good Times",
    artist: "Retro Cassette",
  });

  // Actual YouTube progress
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [clockTime, setClockTime] = useState(new Date());


  // ==========================================================
  // YOUTUBE PLAYER REFERENCE
  // ==========================================================

  const playerRef = useRef(null);

  // Used while dragging the volume knob.
  const volumeDragStartRef = useRef(null);

  // Used to update progress every 500ms
  const progressIntervalRef = useRef(null);


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (seconds) => {

    if (!seconds || isNaN(seconds)) {
      return "00:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };


  // ==========================================================
  // UPDATE YOUTUBE PROGRESS
  // ==========================================================

  const updateProgress = () => {

    if (!playerRef.current) {
      return;
    }

    try {

      const current =
        playerRef.current.getCurrentTime();

      const total =
        playerRef.current.getDuration();

      setCurrentTime(current || 0);

      setDuration(total || 0);

    } catch (error) {

      console.log(
        "Unable to get YouTube progress",
        error
      );

    }
  };

  const seekSong = (event) => {
    if (!playerRef.current || !duration) {
      return;
    }

    const track = event.currentTarget;
    const rect = track.getBoundingClientRect();

    const clickX = event.clientX - rect.left;

    const percentage = Math.max(
      0,
      Math.min(clickX / rect.width, 1)
    );

    const newTime = percentage * duration;

    playerRef.current.seekTo(newTime, true);

    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (event) => {
  event.preventDefault();

  setIsDragging(true);

  seekSong(event);
};


const handleProgressMouseMove = (event) => {
  if (!isDragging) {
    return;
  }

  seekSong(event);
};

// Volume Control
const changeVolume = (newVolume) => {
  const nextVolume = Math.max(
    0,
    Math.min(100, Math.round(newVolume))
  );

  setVolume(nextVolume);

  if (playerRef.current) {
    try {
      playerRef.current.setVolume(nextVolume);
    } catch (error) {
      console.log("Unable to change YouTube volume", error);
    }
  }
};

const handleVolumePointerDown = (event) => {
  event.preventDefault();

  setIsVolumeDragging(true);
};

// ..................................................
const handleProgressMouseUp = () => {
  setIsDragging(false);
};


  // ==========================================================
  // START PROGRESS TRACKING
  // ==========================================================

  const startProgressTracking = () => {

    // Avoid creating multiple intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Immediately update
    updateProgress();

    // Update every 500ms
    progressIntervalRef.current =
      setInterval(() => {
        updateProgress();
      }, 500);
  };


  // ==========================================================
  // STOP PROGRESS TRACKING
  // ==========================================================

  const stopProgressTracking = () => {

    if (progressIntervalRef.current) {

      clearInterval(
        progressIntervalRef.current
      );

      progressIntervalRef.current = null;
    }

    // Get final position
    updateProgress();
  };


  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {

    return () => {

      if (progressIntervalRef.current) {

        clearInterval(
          progressIntervalRef.current
        );

        progressIntervalRef.current = null;
      }

    };

  }, []);

  useEffect(() => {
  const handleMouseMove = (event) => {
    if (!isDragging) {
      return;
    }

    const track = document.querySelector(".progress-track");

    if (!track || !playerRef.current || !duration) {
      return;
    }

    const rect = track.getBoundingClientRect();

    const clickX = event.clientX - rect.left;

    const percentage = Math.max(
      0,
      Math.min(clickX / rect.width, 1)
    );

    const newTime = percentage * duration;

    playerRef.current.seekTo(newTime, true);

    setCurrentTime(newTime);
  };


  const handleMouseUp = () => {
    setIsDragging(false);
  };


  document.addEventListener(
    "mousemove",
    handleMouseMove
  );

  document.addEventListener(
    "mouseup",
    handleMouseUp
  );


  return () => {
    document.removeEventListener(
      "mousemove",
      handleMouseMove
    );

    document.removeEventListener(
      "mouseup",
      handleMouseUp
    );
  };

}, [isDragging, duration]);

useEffect(() => {
  const timer = setInterval(() => {
    setClockTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);
  // ==========================================================
  // VOLUME KNOB DRAGGING
  // ==========================================================

  useEffect(() => {
  const handleVolumePointerMove = (event) => {
    if (!isVolumeDragging) {
      return;
    }

    const knob = document.querySelector(".volume-knob");

    if (!knob) {
      return;
    }

    const rect = knob.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    // Calculate angle from mouse position
    let angle =
      Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Convert angle so top = 0 degrees
    angle += 90;

    if (angle < 0) {
      angle += 360;
    }

    // Our knob range:
    // 0 volume   = -135 degrees
    // 100 volume = +135 degrees
    //
    // Convert to 0 - 270 range
    let normalizedAngle;

    if (angle >= 0 && angle <= 135) {
      normalizedAngle = angle + 135;
    } else if (angle >= 225 && angle <= 360) {
      normalizedAngle = angle - 225;
    } else {
      // Dead zone at the bottom
      return;
    }

    const newVolume =
      (normalizedAngle / 270) * 100;

    changeVolume(newVolume);
  };

  const handleVolumePointerUp = () => {
    setIsVolumeDragging(false);
  };

  window.addEventListener(
    "pointermove",
    handleVolumePointerMove
  );

  window.addEventListener(
    "pointerup",
    handleVolumePointerUp
  );

  return () => {
    window.removeEventListener(
      "pointermove",
      handleVolumePointerMove
    );

    window.removeEventListener(
      "pointerup",
      handleVolumePointerUp
    );
  };
}, [isVolumeDragging]);

  // ==========================================================
  // YOUTUBE PLAYER READY
  // ==========================================================

  const onPlayerReady = (event) => {

    playerRef.current = event.target;

    console.log("YouTube player ready");

    // Initial volume
    event.target.setVolume(volume);

    /*
     * Load your playlist.
     *
     * We don't autoplay here.
     * User needs to click Play.
     */

    event.target.loadPlaylist({
      list: YOUTUBE_PLAYLIST_ID,
      listType: "playlist",
      index: 0,
    });

  };


  // ==========================================================
  // GET CURRENT YOUTUBE SONG
  // ==========================================================

  const updateCurrentSong = () => {

    if (!playerRef.current) {
      return;
    }

    const videoData =
      playerRef.current.getVideoData();

    if (!videoData) {
      return;
    }

    setCurrentSong({
      title:
        videoData.title ||
        "Unknown Song",

      artist:
        videoData.author ||
        "YouTube",
    });

  };


  // ==========================================================
  // YOUTUBE PLAYER STATE CHANGE
  // ==========================================================

  const onPlayerStateChange = (event) => {

    /*
     * YouTube states:
     *
     * 0 = ENDED
     * 1 = PLAYING
     * 2 = PAUSED
     * 3 = BUFFERING
     * 5 = CUED
     */

    if (event.data === 1) {

      // ======================================================
      // PLAYING
      // ======================================================

      setIsPlaying(true);

      updateCurrentSong();

      startProgressTracking();

    }

    else if (event.data === 2) {

      // ======================================================
      // PAUSED
      // ======================================================

      setIsPlaying(false);

      stopProgressTracking();

    }

    else if (event.data === 0) {

      // ======================================================
      // ENDED
      // ======================================================

      setIsPlaying(false);

      stopProgressTracking();

      setCurrentTime(0);

      // Because playlist loop is enabled,
      // YouTube will continue with playlist behavior.

    }

    else if (event.data === 3) {

      // ======================================================
      // BUFFERING
      // ======================================================

      // Keep the cassette visually playing
      // while YouTube is buffering.
      setIsPlaying(true);

      updateProgress();

    }

  };


  // ==========================================================
  // PLAY / PAUSE
  // ==========================================================

  const togglePlayPause = () => {

    if (!playerRef.current) {

      console.log(
        "YouTube player is not ready yet"
      );

      return;
    }

    if (isPlaying) {

      // PAUSE
      playerRef.current.pauseVideo();

    }

    else {

      // PLAY
      playerRef.current.playVideo();

    }

  };


  // ==========================================================
  // PREVIOUS SONG
  // ==========================================================

  const previousSong = () => {

    if (!playerRef.current) {
      return;
    }

    // Reset UI progress immediately
    setCurrentTime(0);
    setDuration(0);

    playerRef.current.previousVideo();

    /*
     * Wait for YouTube to change the video,
     * then update our UI.
     */

    setTimeout(() => {

      updateCurrentSong();

      updateProgress();

    }, 700);

  };


  // ==========================================================
  // NEXT SONG
  // ==========================================================

  const nextSong = () => {

    if (!playerRef.current) {
      return;
    }

    // Reset UI progress immediately
    setCurrentTime(0);
    setDuration(0);

    playerRef.current.nextVideo();

    setTimeout(() => {

      updateCurrentSong();

      updateProgress();

    }, 700);

  };


  // ==========================================================
  // STOP
  // ==========================================================

  const stopSong = () => {

    if (!playerRef.current) {
      return;
    }

    playerRef.current.stopVideo();

    setIsPlaying(false);

    setCurrentTime(0);

    stopProgressTracking();

  };


  // ==========================================================
  // YOUTUBE OPTIONS
  // ==========================================================

  const youtubeOptions = {

    width: "480",

    height: "270",

    playerVars: {

      // Don't autoplay
      autoplay: 0,

      // Show YouTube controls while testing
      controls: 1,

      // Mobile inline playback
      playsinline: 1,

      // Don't show unrelated videos
      rel: 0,

      // Playlist
      listType: "playlist",

      list: YOUTUBE_PLAYLIST_ID,

      // Loop playlist
      loop: 1,

    },

  };


  // ==========================================================
  // CALCULATE PROGRESS PERCENTAGE
  // ==========================================================

  const progressPercentage =
    duration > 0
      ? Math.min(
          (currentTime / duration) * 100,
          100
        )
      : 0;


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="retro-app">


      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="red-glow" />

      <div className="grain" />


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="top-bar">

        <div className="time">
          {clockTime.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>


        <div className="playlist-status">

          <span className="live-dot" />

          Good Times Playlist से

        </div>


        <button className="more-button">

          <MoreHorizontal size={26} />

        </button>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="main-content">


        {/* ====================================================
            BRANDING
        ==================================================== */}

        <section className="branding">

          <div className="est">

            <span />

            EST. 1990

            <span />

          </div>


          <h1>

            RETRO

            <br />

            CASSETTE

          </h1>

        </section>


        {/* ====================================================
            CASSETTE
        ==================================================== */}

        <section className="cassette-area">

          <div
            className={
              `old-cassette ${
                isPlaying
                  ? "cassette-playing"
                  : ""
              }`
            }
          >


            {/* SCREWS */}

            <div className="screw screw-1">
              +
            </div>

            <div className="screw screw-2">
              +
            </div>

            <div className="screw screw-3">
              +
            </div>

            <div className="screw screw-4">
              +
            </div>


            {/* ==================================================
                CASSETTE LABEL
            ================================================== */}

            <div className="cassette-label">

              <div className="side-label">
                S
              </div>


              <div className="flex items-center gap-2 font-marker text-xl font-bold tracking-widest text-neutral-900">

                <Radio className="w-6 h-6" />

                <span>
                  FLASHBACK
                </span>

              </div>


              <div className="heart">
                ♥
              </div>

            </div>


            {/* ==================================================
                RED STRIP
            ================================================== */}

            <div className="red-stripes">

              <span />
              <span />
              <span />
              <span />

            </div>


            {/* ==================================================
                TAPE WINDOW
            ================================================== */}

            <div className="tape-window">


              {/* LEFT REEL */}

              <div className="tape-reel left">

                <div className="reel-metal-ring">

                  <div className="reel-spokes">

                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />

                  </div>


                  <div className="reel-hub">

                    <div className="reel-hub-inner" />

                  </div>

                </div>

              </div>


              {/* ==================================================
                  CENTER TAPE
              ================================================== */}

              <div className="cassette-tape">

                <div className="tape-roll-left" />


                <div className="tape-strip">

                  <span />
                  <span />
                  <span />
                  <span />

                </div>


                <div className="tape-roll-right" />

              </div>


              {/* ==================================================
                  RIGHT REEL
              ================================================== */}

              <div className="tape-reel right">

                <div className="reel-metal-ring">

                  <div className="reel-spokes">

                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />

                  </div>


                  <div className="reel-hub">

                    <div className="reel-hub-inner" />

                  </div>

                </div>

              </div>


            </div>


            {/* ==================================================
                TAPE SCALE
            ================================================== */}

            <div className="tape-scale">

              <span>
                100
              </span>

              <span>
                50
              </span>

              <span>
                0
              </span>

            </div>


            {/* ==================================================
                CASSETTE BOTTOM
            ================================================== */}

            <div className={`cassette-bottom ${isPlaying ? "cassette-playing" : "cassette-stopped"}`}>

              <div className="bottom-hole" />

              <div className="bottom-hole" />

              <div className="bottom-hole" />

              <div className="bottom-hole" />

            </div>

          </div>

        </section>


        {/* ====================================================
            SONG INFORMATION
        ==================================================== */}

        <section className="song-section">

          <div className="now-playing">

            {isPlaying
              ? "अभी चल रहा है"
              : "पॉज़ किया गया"}

          </div>


          <h2
            className="song-title"
            title={currentSong.title}
          >
            {currentSong.title}
          </h2>


          <p>
            {currentSong.artist}
          </p>


          {/* ==================================================
              VISUALIZER
          ================================================== */}

          <div
            className={
              `visualizer ${
                isPlaying
                  ? "visualizer-playing"
                  : ""
              }`
            }
          >

            {Array.from({
              length: 32
            }).map((_, index) => (

              <span
                key={index}

                style={{
                  animationDelay:
                    `${index * 0.04}s`,

                  height:
                    `${8 + ((index * 13) % 24)}px`,
                }}
              />

            ))}

          </div>


          {/* ==================================================
              REAL YOUTUBE PROGRESS
          ================================================== */}

       <div className="progress">

        <div
          className="progress-track"
          onClick={seekSong}
        >

          <div
            className="progress-value"
            style={{
              width: `${progressPercentage}%`,
            }}
          />

          <div
            className="progress-dot"
            style={{
              left: `${progressPercentage}%`,
            }}
            onMouseDown={handleProgressMouseDown}
          />

      </div>


  <div className="progress-time">

    <span>
      {formatTime(currentTime)}
    </span>

    <span>
      {duration > 0
        ? formatTime(duration)
        : "YouTube"}
    </span>

  </div>

</div>

        </section>

      </main>


      {/* ======================================================
          YOUTUBE PLAYER
          
          KEEP THIS VISIBLE WHILE TESTING.
      ====================================================== */}

      <div className="youtube-player-wrapper">

        <YouTube

          videoId={undefined}

          opts={youtubeOptions}

          onReady={onPlayerReady}

          onStateChange={onPlayerStateChange}

        />

      </div>


      {/* ======================================================
          PLAYER PANEL
      ====================================================== */}

      <section className="player-panel">


        {/* ====================================================
            VOLUME
        ==================================================== */}

        <div className="knob-section">

          <label>
            VOLUME
          </label>

          <div
            className={`knob volume-knob ${
              isVolumeDragging ? "knob-dragging" : ""
            }`}
            onPointerDown={handleVolumePointerDown}
            title={`Volume: ${volume}% — drag up/down`}
            style={{
              touchAction: "none",
              userSelect: "none",
              cursor: isVolumeDragging ? "grabbing" : "grab",
            }}
          >

            <div
              className="knob-indicator"
              style={{
                transform: `
                  translate(-50%, -100%)
                  rotate(${-135 + (volume / 100) * 270}deg)
                `,
              }}
            />

          </div>

          <div className="knob-values">
            <button
              type="button"
              onClick={() => changeVolume(volume - 5)}
              className="volume-button"
            >
              −
            </button>

            <span className="volume-value">
              {volume}
            </span>

            <button
              type="button"
              onClick={() => changeVolume(volume + 5)}
              className="volume-button"
            >
              +
            </button>
          </div>

        </div>


        {/* ====================================================
            CONTROLS
        ==================================================== */}

        <div className="controls">


          {/* PREVIOUS */}

          <button
            onClick={previousSong}
            className="retro-control"
          >

            <span className="control-label">
              रीवाइंड
            </span>

            <SkipBack />

          </button>


          {/* PLAY / PAUSE */}

          <button
            onClick={togglePlayPause}
            className={
              `retro-control play-control ${
                isPlaying
                  ? "active"
                  : ""
              }`
            }
          >

            <span className="control-label">
              प्ले / पॉज़
            </span>


            {isPlaying
              ? <Pause />
              : <Play />
            }

          </button>


          {/* NEXT */}

          <button
            onClick={nextSong}
            className="retro-control"
          >

            <span className="control-label">
              फॉरवर्ड
            </span>

            <SkipForward />

          </button>


          {/* STOP */}

          <button
            onClick={stopSong}
            className="retro-control"
          >

            <span className="control-label">
              स्टॉप
            </span>

            <Square />

          </button>


        </div>


        {/* ====================================================
            BALANCE
        ==================================================== */}

        <div className="knob-section balance">

          <label>
            BALANCE
          </label>


          <div className="knob">

            <div className="knob-indicator" />

          </div>


          <div className="knob-values">

            <span>
              L
            </span>

            <span>
              R
            </span>

          </div>

        </div>


      </section>


    </div>
  );
}


export default App;