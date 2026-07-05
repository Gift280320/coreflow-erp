export const Select = ({ children, name, defaultValue }: any) => (
  <select name={name} defaultValue={defaultValue} className="w-full p-2 border rounded">
    {children}
  </select>
);
export const SelectTrigger = ({ children }: any) => <>{children}</>;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;
export const SelectValue = ({ placeholder }: any) => <option value="">{placeholder}</option>;
