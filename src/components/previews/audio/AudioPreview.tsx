import { memo, useEffect } from "react"

import { audioActions, useAudioStore } from "@/utils/stores/audio"

import { AudioPlayer } from "./AudioPlayer"

interface AudioPreviewProps {
  nextItem: (previewType: string) => void
  prevItem: (previewType: string) => void
  assetUrl: string
  name: string
}

const unloadAudio = (audio: HTMLAudioElement) => {
  audio.pause()
  audio.src = ""
  audio.load()
  audio.remove()
}

const AudioPreview = ({
  assetUrl,
  name,
  nextItem,
  prevItem,
}: AudioPreviewProps) => {
  const actions = useAudioStore(audioActions)

  const audio = useAudioStore((state) => state.audio)

  useEffect(() => {
    return () => {
      if (audio) {
        unloadAudio(audio)
        actions.reset()
      }
    }
  }, [audio])

  useEffect(() => {
    actions.setHandlers({
      prevItem,
      nextItem,
    })
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("nexttrack", () =>
        nextItem("audio")
      )
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        prevItem("audio")
      )
    }
    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("nexttrack", null)
        navigator.mediaSession.setActionHandler("previoustrack", null)
      }
    }
  }, [prevItem, nextItem])

  useEffect(() => {
    if (assetUrl) actions.loadAudio(assetUrl, name)
  }, [assetUrl])

  return <AudioPlayer />
}

export default memo(AudioPreview)
