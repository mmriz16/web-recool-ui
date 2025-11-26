type CardProps = {
    children: React.ReactNode;
    className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`bg-white p-6 rounded-2xl w-full h-full ${className}`}>
            {children}
        </div>
    );
}