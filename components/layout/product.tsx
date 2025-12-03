export default function Product({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col cursor-pointer w-full">
            <img src="/img/cover1.webp" alt="Navtab" className="w-full h-[180px] object-cover rounded-t-xl" />
            <div className="flex flex-col w-full px-4 py-3.5 bg-[var(--bg-primary)] rounded-b-[14px]">
                <div className="flex flex-col gap-1 font-medium">
                    {children}
                </div>
            </div>
        </div>
    );
}