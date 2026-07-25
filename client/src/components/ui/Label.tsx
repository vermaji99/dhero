
import { LabelHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium text-gray-700 mb-1',
          className,
        )}
        {...props}
      />
    )
  },
)
Label.displayName = 'Label'

export { Label }
