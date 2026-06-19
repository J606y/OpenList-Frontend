// External video-player schemes ("open in other apps"). Shared by the video
// preview's player-links card (VideoPlayerLinks) and the folder context menu.
export const players: {
  icon: string
  name: string
  scheme: string
  platforms: string[]
}[] = [
  {
    icon: "iina",
    name: "IINA",
    scheme: "iina://weblink?url=$edurl",
    platforms: ["MacOS"],
  },
  {
    icon: "potplayer",
    name: "PotPlayer",
    scheme: "potplayer://$durl",
    platforms: ["Windows"],
  },
  {
    icon: "vlc",
    name: "VLC",
    scheme: "vlc://$durl",
    platforms: ["Windows", "MacOS", "Linux", "Android", "iOS"],
  },
  {
    icon: "android",
    name: "Android",
    scheme: "intent:$durl#Intent;type=video/*;S.title=$name;end",
    platforms: ["Android"],
  },
  {
    icon: "nplayer",
    name: "nPlayer",
    scheme: "nplayer-$durl",
    platforms: ["Android", "iOS"],
  },
  {
    icon: "omniplayer",
    name: "OmniPlayer",
    scheme: "omniplayer://weblink?url=$durl",
    platforms: ["MacOS"],
  },
  {
    icon: "figplayer",
    name: "Fig Player",
    scheme: "figplayer://weblink?url=$durl",
    platforms: ["Windows", "MacOS"],
  },
  {
    icon: "infuse",
    name: "Infuse",
    scheme: "infuse://x-callback-url/play?url=$durl",
    platforms: ["MacOS", "iOS"],
  },
  {
    icon: "fileball",
    name: "Fileball",
    scheme: "filebox://play?url=$durl",
    platforms: ["MacOS", "iOS"],
  },
  {
    icon: "mxplayer",
    name: "MX Player",
    scheme:
      "intent:$durl#Intent;package=com.mxtech.videoplayer.ad;S.title=$name;end",
    platforms: ["Android"],
  },
  {
    icon: "mxplayer-pro",
    name: "MX Player Pro",
    scheme:
      "intent:$durl#Intent;package=com.mxtech.videoplayer.pro;S.title=$name;end",
    platforms: ["Android"],
  },
  {
    icon: "iPlay",
    name: "iPlay",
    scheme: "iplay://play/any?type=url&url=$bdurl",
    platforms: ["iOS"],
  },
  {
    icon: "mpv",
    name: "mpv",
    scheme: "mpv://$edurl",
    platforms: ["Windows", "MacOS", "Linux", "Android"],
  },
]
