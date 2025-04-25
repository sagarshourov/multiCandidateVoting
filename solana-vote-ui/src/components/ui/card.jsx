export function Card({ children, className = "" }) {
    return (
      <div className={`rounded-2xl shadow-md bg-white dark:bg-zinc-900 ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children, className = "" }) {
    return <div className={`p-4 ${className}`}>{children}</div>;
  }
  