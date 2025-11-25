export default function Button({ children, variant = "primary", ...props }: { children: React.ReactNode, variant?: "primary" | "secondary" }) {
  return <button className={`text-foreground px-4 py-2 border border-black/10 rounded-xl ${variant === "primary" ? "bg-primary text-foreground" : "bg-secondary text-foreground"}`} {...props}>{children}</button>;
}