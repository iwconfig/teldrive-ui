import { createFileRoute } from "@tanstack/react-router"
import { AxiosError } from "feaxios"

import { ErrorView } from "@/components/ErrorView"
import { DriveFileBrowser } from "@/components/FileBrowser"
import { extractPathParts } from "@/utils/common"
import { filesQueryOptions } from "@/utils/queryOptions"

const allowedTypes = [
  "my-drive",
  "starred",
  "recent",
  "search",
  "storage",
  "category",
]

export const Route = createFileRoute("/_authenticated/$")({
  beforeLoad: ({ params }) => {
    const { type, path } = extractPathParts(params._splat)
    if (!allowedTypes.includes(type)) {
      throw new Error("invalid path")
    }
    return { queryParams: { type, path } }
  },
  loader: async ({ context: { queryClient, queryParams }, preload }) => {
    if (preload)
      await queryClient.prefetchInfiniteQuery(filesQueryOptions(queryParams))
    else queryClient.fetchInfiniteQuery(filesQueryOptions(queryParams))
  },
  component: DriveFileBrowser,
  errorComponent: ({ error }) => {
    if (error instanceof AxiosError) {
      const err =
        error.response?.status === 404
          ? new Error("invalid path")
          : new Error("server error")
      return <ErrorView error={err} />
    }
    return <ErrorView error={error as Error} />
  },
  wrapInSuspense: true,
})
