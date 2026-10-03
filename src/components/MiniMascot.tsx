import { BUST, POSES, type Pose } from './mascotBust'

/** Mini Jodnoi mascot (bust + a pose) on a soft tile. Decorative: hidden from screen readers. */
export default function MiniMascot({ pose, size = 56 }: { pose: Pose; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e8e4fb]"
      style={{ width: size, height: size }}
    >
      <svg viewBox="30 80 310 330" width={size} height={size}>
        <g dangerouslySetInnerHTML={{ __html: BUST + POSES[pose] }} />
      </svg>
    </span>
  )
}
