export const Avatar = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const AvatarImage = ({ src }: { src?: string }) => <img src={src} alt="Avatar" />;
export const AvatarFallback = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
