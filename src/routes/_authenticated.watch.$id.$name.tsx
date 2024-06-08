import { createFileRoute } from "@tanstack/react-router"

import { VideoSoloPreview } from "@/components/previews/video/VideoSoloPreview"

export const Route = createFileRoute("/_authenticated/watch/$id/$name")({
  component: VideoSoloPreview,
})
