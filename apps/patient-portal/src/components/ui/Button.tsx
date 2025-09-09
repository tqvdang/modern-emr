import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Slot } from '@radix-ui/react-slot'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  asChild?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '', 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    asChild = false,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transform touch-manipulation'
    
    const variants = {
      primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500',
      secondary: 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500',
      outline: 'border-2 border-primary-600 text-primary-600 bg-white hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-500',
      danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-sm min-h-[44px]',
      lg: 'px-6 py-4 text-base min-h-[52px]'
    }

    const widthClass = fullWidth ? 'w-full' : ''
    
    return (
      <motion.div
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        className={fullWidth ? 'w-full' : 'inline-block'}
      >
        <Comp
          className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            children
          )}
        </Comp>
      </motion.div>
    )
  }
)

Button.displayName = 'Button'

export { Button }