export const Dialog = ({ open, onOpenChange, children }: any) => (
  open ? <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => onOpenChange(false)}>{children}</div> : null
);
export const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>{children}</div>
);
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h2 className="text-xl font-bold">{children}</h2>;
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;

