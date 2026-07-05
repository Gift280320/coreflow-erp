export const Table = ({ children }: { children: React.ReactNode }) => <table className="min-w-full">{children}</table>;
export const TableHeader = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>;
export const TableBody = ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>;
export const TableRow = ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>;
export const TableHead = ({ children }: { children: React.ReactNode }) => <th className="text-left p-2">{children}</th>;
export const TableCell = ({ children }: { children: React.ReactNode }) => <td className="p-2">{children}</td>;
