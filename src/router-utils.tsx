/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react'

export const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen" role="status" aria-label="Loading">
    <div
      className="animate-spin motion-reduce:animate-none rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      aria-hidden="true"
    ></div>
    <span className="sr-only">Loading...</span>
  </div>
)

export function withSuspense<T extends React.ComponentType<any>>(
  Component: T
): React.ComponentType {
  return function SuspenseWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    )
  }
}
