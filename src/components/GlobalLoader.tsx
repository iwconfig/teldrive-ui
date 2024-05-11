import * as React from "react"
import { memo, useEffect } from "react"
import { useRouterState } from "@tanstack/react-router"
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar"

export const GlobalLoader = memo(() => {
  const ref = React.useRef<LoadingBarRef>(null)

  const status = useRouterState({ select: (s) => s.status })

  useEffect(() => {
    if (status === "pending") ref?.current?.continuousStart()
    if (status === "idle") ref?.current?.complete()
  }, [status])

  return (
    <LoadingBar
      className="!bg-primary"
      shadow={false}
      ref={ref}
      waitingTime={200}
    />
  )
})
