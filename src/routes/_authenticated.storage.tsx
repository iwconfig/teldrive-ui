import { createFileRoute } from "@tanstack/react-router"

import { StorageView } from "@/components/StorageView"
import {
  categoryStorageQueryOptions,
  uploadStatsQueryOptions,
} from "@/utils/queryOptions"

export const Route = createFileRoute("/_authenticated/storage")({
  wrapInSuspense: true,
  component: StorageView,
  loader: async ({ context: { queryClient }, preload }) => {
    if (preload) {
      await Promise.all([
        queryClient.prefetchQuery(uploadStatsQueryOptions(7)),
        queryClient.prefetchQuery(categoryStorageQueryOptions),
      ])
    } else {
      queryClient.prefetchQuery(uploadStatsQueryOptions(7))
      queryClient.prefetchQuery(categoryStorageQueryOptions)
    }
  },
})
