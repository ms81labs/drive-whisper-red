import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "white"
}

export const LoadingSpinner = ({ 
  className, 
  size = "md", 
  variant = "default" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  const variantClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    white: "text-white"
  }
  
  return (
    <div className={cn("animate-spin", sizeClasses[size], variantClasses[variant], className)}>
      <svg
        className="w-full h-full"
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
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
}

export const LoadingOverlay = ({ isLoading, children, message }: LoadingOverlayProps) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" variant="primary" />
            {message && (
              <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}