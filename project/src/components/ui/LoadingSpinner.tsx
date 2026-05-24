export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );
}
