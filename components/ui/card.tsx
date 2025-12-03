export default function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl w-full ${className}`}>
            {children}
        </div>
    );
}