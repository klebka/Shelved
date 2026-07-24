export default function SkeletonCard() {
  return (
    <div className="game-card skeleton-card">
      <div className="cover-wrapper shimmer" />
      <div className="card-body">
        <div className="shimmer skeleton-line w-60" />
        <div className="shimmer skeleton-line w-30" />
        <div className="shimmer skeleton-line w-full h-40" />
      </div>
    </div>
  )
}
