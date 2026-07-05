export const Separator = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={`border-t border-gray-200 dark:border-gray-700 my-2 ${className || ''}`} {...props} />
);
