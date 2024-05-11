import { memo, useCallback, useEffect, useRef, useState } from "react"
import { FbIcon, FbIconName } from "@tw-material/file-browser"
import { Button, Slider } from "@tw-material/react"
import IconPauseCircle from "~icons/ic/round-pause-circle"
import IconPlayCircle from "~icons/ic/round-play-circle"
import IconVolume1 from "~icons/lucide/volume-1"
import IconVolume2 from "~icons/lucide/volume-2"
import IconVolumeX from "~icons/lucide/volume-x"
import IconRepeat2Fill from "~icons/ri/repeat-2-fill"
import IconRepeatOneFill from "~icons/ri/repeat-one-fill"
import IconSkipNextBold from "~icons/solar/skip-next-bold"
import IconSkipPreviousBold from "~icons/solar/skip-previous-bold"
import clsx from "clsx"
import { useShallow } from "zustand/react/shallow"

import { formatDuration } from "@/utils/common"
import { audioActions, useAudioStore } from "@/utils/stores"

type SliderValue = number | number[]

const getVolumeIcon = (volume: number, muted: boolean) => {
  if (volume === 0 || muted) return <IconVolumeX />
  if (volume < 0.5) return <IconVolume1 />
  return <IconVolume2 />
}
const AudioCover = memo(() => {
  const metadata = useAudioStore((state) => state.metadata)
  return (
    <div className="relative col-span-6 md:col-span-5 grid">
      <div
        className={clsx(
          "bg-neutral-400 flex justify-center items-center rounded-large aspect-[1/1] row-span-full col-span-full",
          metadata.cover ? "-z-[1]" : "z-10"
        )}
      >
        <FbIcon icon={FbIconName.music} className="size-16" />
      </div>
      <img
        alt="Album cover"
        className={clsx(
          "object-cover rounded-large row-span-full col-span-full transition",
          metadata.cover ? "z-10 opacity-100" : "-z-[1] opacity-0"
        )}
        height={200}
        src={metadata.cover}
        width="100%"
      />
    </div>
  )
})

const AudioInfo = memo(() => {
  const metadata = useAudioStore((state) => state.metadata)
  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-0 min-w-0">
        <h3
          title={metadata.title}
          className="text-small font-semibold truncate"
        >
          {metadata.title}
        </h3>
        <h1
          title={metadata.artist}
          className="text-large font-medium mt-2 truncate"
        >
          {metadata.artist}
        </h1>
      </div>
    </div>
  )
})

const AudioDurationSlider = memo(() => {
  const { audio, duration, currentTime, actions, isPlaying } = useAudioStore(
    useShallow((state) => ({
      audio: state.audio,
      duration: state.duration,
      currentTime: state.currentTime,
      actions: state.actions,
      isPlaying: state.isPlaying,
    }))
  )

  const [isDragging, setIsDragging] = useState(false)

  const sliderRef = useRef<HTMLDivElement>(null)

  const playAnimationRef = useRef<number | null>(null)

  const onPositionChangeEnd = useCallback((value: SliderValue) => {
    actions.seek(value as number)
    setIsDragging(false)
  }, [])

  const onPositionChange = useCallback((value: SliderValue) => {
    setIsDragging(true)
    actions.setCurrentTime(value as number)
  }, [])

  const repeat = useCallback(() => {
    actions.setCurrentTime(audio?.currentTime!)
    playAnimationRef.current = requestAnimationFrame(repeat)
  }, [audio, actions.setCurrentTime])

  useEffect(() => {
    if (isPlaying && !isDragging)
      playAnimationRef.current = requestAnimationFrame(repeat)
    else cancelAnimationFrame(playAnimationRef.current!)
  }, [isPlaying, isDragging, audio, repeat])

  return (
    <>
      <Slider
        ref={sliderRef}
        size="sm"
        aria-label="progress"
        value={currentTime}
        maxValue={duration}
        minValue={0}
        step={1}
        disableThumbScale
        onChangeEnd={onPositionChangeEnd}
        onChange={onPositionChange}
        classNames={{
          thumb: "size-3 after:size-3  after:bg-primary",
          track:
            "data-[thumb-hidden=false]:border-x-[calc(theme(spacing.3)/2)]",
        }}
      />
      <div className="flex justify-between">
        <p className="text-small">{formatDuration(currentTime)}</p>
        <p className="text-small ">{formatDuration(duration)}</p>
      </div>
    </>
  )
})

const VolumeSlider = memo(() => {
  const volume = useAudioStore((state) => state.volume)
  const actions = useAudioStore(audioActions)

  const onVolumeChange = useCallback(
    (value: SliderValue) => actions.setVolume(value as number),
    []
  )

  return (
    <Slider
      aria-label="Volume"
      size="sm"
      value={volume}
      maxValue={1}
      minValue={0}
      onChange={onVolumeChange}
      step={0.01}
      classNames={{
        base: "w-1/3",
        thumb: "size-3 after:size-3 after:bg-primary",
        track: "data-[thumb-hidden=false]:border-x-[calc(theme(spacing.3)/2)]",
      }}
    />
  )
})

const TopControls = memo(() => {
  const { isPlaying, actions, handlers } = useAudioStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
      actions: state.actions,
      handlers: state.handlers,
    }))
  )

  return (
    <div className="flex w-full items-center justify-center gap-3">
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={() => handlers.prevItem("audio")}
      >
        <IconSkipPreviousBold />
      </Button>
      <Button
        variant="text"
        className="text-inherit size-14"
        isIconOnly
        onPress={actions.togglePlay}
      >
        {isPlaying ? (
          <IconPauseCircle className="!size-12" />
        ) : (
          <IconPlayCircle className="!size-12" />
        )}
      </Button>
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={() => handlers.nextItem("audio")}
      >
        <IconSkipNextBold />
      </Button>
    </div>
  )
})

const BottomControls = memo(() => {
  const actions = useAudioStore(audioActions)
  const { volume, muted, looping } = useAudioStore(
    useShallow((state) => ({
      volume: state.volume,
      muted: state.isMuted,
      looping: state.isLooping,
    }))
  )

  return (
    <div className="flex w-full items-center justify-center gap-3">
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={actions.toggleLooping}
      >
        {looping ? <IconRepeatOneFill /> : <IconRepeat2Fill />}
      </Button>
      <Button
        isIconOnly
        className="text-inherit"
        variant="text"
        onPress={actions.toggleMute}
      >
        {getVolumeIcon(volume, muted)}
      </Button>
      <VolumeSlider />
    </div>
  )
})

export const AudioPlayer = memo(() => {
  return (
    <div
      className="flex flex-col relative overflow-hidden height-auto outline-none 
      bg-surface max-w-80 md:max-w-[39rem] rounded-large p-3 m-auto"
    >
      <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 justify-center text-xs text-on-surface">
        <AudioCover />
        <div className="flex flex-col col-span-6 md:col-span-7">
          <AudioInfo />
          <div className="flex flex-col mt-3 gap-1">
            <AudioDurationSlider />
            <TopControls />
            <BottomControls />
          </div>
        </div>
      </div>
    </div>
  )
})
