import React, { useRef, useState, useEffect } from 'react';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label?: string;
  confirmedLabel?: string;
  isConfirmed?: boolean;
  disabled?: boolean;
}

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  onConfirm,
  label = 'Swipe to Confirm Delivery',
  confirmedLabel = 'Delivery Confirmed ✓',
  isConfirmed = false,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(isConfirmed);

  useEffect(() => {
    setCompleted(isConfirmed);
    if (!isConfirmed) {
      setDragX(0);
    }
  }, [isConfirmed]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || completed) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled || completed || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const maxDrag = rect.width - 56;
    const newX = Math.max(0, Math.min(e.clientX - rect.left - 24, maxDrag));
    setDragX(newX);

    if (newX >= maxDrag * 0.88) {
      setDragX(maxDrag);
      setIsDragging(false);
      setCompleted(true);
      onConfirm();
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || completed) return;
    setIsDragging(false);
    setDragX(0);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-14 w-full rounded-2xl select-none overflow-hidden transition-colors ${
        completed
          ? 'bg-[#E7F5EF] text-[#27866F]'
          : 'bg-[#E7F5EF] border border-[#E5ECE8]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background track fill progress */}
      <div
        className="absolute inset-y-0 left-0 bg-[#35A88A]/25 transition-[width] pointer-events-none"
        style={{
          width: `${
            completed
              ? 100
              : (dragX / ((containerRef.current?.offsetWidth || 300) - 56)) * 100
          }%`,
        }}
      />

      {/* Label in the center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`font-['Manrope'] text-[13px] font-bold tracking-wide transition-opacity ${
            dragX > 60 ? 'opacity-30' : 'opacity-90'
          } ${completed ? 'text-[#27866F]' : 'text-[#26352F]'}`}
        >
          {completed ? confirmedLabel : label}
        </span>
      </div>

      {/* Draggable thumb */}
      {!completed ? (
        <div
          onPointerDown={handlePointerDown}
          style={{ transform: `translateX(${dragX}px)` }}
          className={`absolute top-1 left-1 w-12 h-12 rounded-xl bg-[#27866F] text-white flex items-center justify-center shadow-md touch-none transition-transform ${
            isDragging ? 'scale-105 shadow-lg' : 'transition-[transform] duration-200 ease-out'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            arrow_forward
          </span>
        </div>
      ) : (
        <div className="absolute top-1 right-1 w-12 h-12 rounded-xl bg-[#27866F] text-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[24px]">check</span>
        </div>
      )}
    </div>
  );
};
