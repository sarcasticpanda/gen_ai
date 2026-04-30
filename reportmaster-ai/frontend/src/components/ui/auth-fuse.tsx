"use client";
// Forced re-save to resolve Vite parse error

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Eye, EyeOff, Circle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

interface SignInFormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
}

function SignInForm({ onSubmit, loading }: SignInFormProps) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to sign in</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Password" />
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

interface SignUpFormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
}

function SignUpForm({ onSubmit, loading }: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Your request will be sent to the admin for approval</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Password"/>
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </div>
    </form>
  );
}

interface PendingViewProps {
  email?: string;
  onCheckStatus?: () => void;
  onSignOut?: () => void;
  checking?: boolean;
  approved?: boolean;
}

function PendingView({ email, onCheckStatus, onSignOut, checking, approved }: PendingViewProps) {
  return (
    <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="p-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
        <Circle className="size-8 text-primary fill-primary/20" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{approved ? "Account Approved" : "Account pending approval"}</h1>
        <p className="text-sm text-muted-foreground max-w-[300px]">
          {approved 
            ? "Your request has been approved! Redirecting you to your dashboard now..." 
            : "Your request has been submitted and is currently under review. You'll be able to access the dashboard once approved."
          }
        </p>
      </div>
      
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-xs text-secondary-foreground font-medium">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        {email || 'user@example.com'}
      </div>

      <div className="w-full space-y-4">
        <Button 
          variant={approved ? "default" : "outline"}
          className={cn("w-full transition-all duration-500", approved && "bg-green-500 hover:bg-green-600 border-none")}
          onClick={onCheckStatus} 
          disabled={checking || approved}
        >
          {approved ? "Approved!" : checking ? "Checking..." : "Refresh Status"}
        </Button>
        {!approved && (
          <Button variant="ghost" className="w-full text-xs" onClick={onSignOut}>
            Sign out
          </Button>
        )}
      </div>
    </div>
  );
}

function AuthFormContainer({ 
  mode, 
  onToggle, 
  onSignInSubmit, 
  onSignUpSubmit,
  onCheckStatus,
  onSignOut,
  loading,
  checking,
  approved,
  email
}: { 
  mode: "signin" | "signup" | "pending"; 
  onToggle: (mode: "signin" | "signup") => void; 
  onSignInSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onSignUpSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onCheckStatus?: () => void;
  onSignOut?: () => void;
  loading?: boolean;
  checking?: boolean;
  approved?: boolean;
  email?: string;
}) {
    return (
        <div className="mx-auto grid w-[350px] gap-6 relative">
            {/* Dynamic decorative element */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
            
            <div className="relative z-10">
                {mode === "signin" && <SignInForm onSubmit={onSignInSubmit} loading={loading} />}
                {mode === "signup" && <SignUpForm onSubmit={onSignUpSubmit} loading={loading} />}
                {mode === "pending" && (
                  <PendingView 
                    email={email} 
                    onCheckStatus={onCheckStatus} 
                    onSignOut={onSignOut} 
                    checking={checking} 
                    approved={approved}
                  />
                )}

                {mode !== "pending" && (
                  <>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                      <button
                        type="button"
                        onClick={() => onToggle(mode === "signin" ? "signup" : "signin")}
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                      >
                        {mode === "signin" ? "Register" : "Sign In"}
                      </button>
                    </p>

                    {mode === "signin" && (
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Admin Access</p>
                        <div className="space-y-2">
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors">
                            <div>
                              <p className="text-xs text-white/60">Super Admin</p>
                              <p className="text-sm text-white/90">clumsypanda6o9@gmail.com</p>
                            </div>
                            <code className="text-xs px-2 py-1 bg-white/10 rounded text-white/80">ADMIN@1234</code>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-colors">
                            <div>
                              <p className="text-xs text-white/60">System Admin</p>
                              <p className="text-sm text-white/90">admin@reportmaster.ai</p>
                            </div>
                            <code className="text-xs px-2 py-1 bg-white/10 rounded text-white/80">Admin@1234</code>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
            </div>
        </div>
    )
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
    pendingContent?: AuthContentProps;
    initialMode?: "signin" | "signup" | "pending";
    onSignInSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    onSignUpSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    onCheckStatus?: () => void;
    onSignOut?: () => void;
    onToggle?: (mode: "signin" | "signup") => void;
    loading?: boolean;
    checking?: boolean;
    approved?: boolean;
    email?: string;
}

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
        alt: "Modern architecture skyscraper"
    },
    quote: {
        text: "Welcome Back! The journey continues.",
        author: "EaseMize UI"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1974&auto=format&fit=crop",
        alt: "Vibrant modern office building"
    },
    quote: {
        text: "Register your account. A new chapter awaits.",
        author: "EaseMize UI"
    }
};

const defaultPendingContent = {
    image: {
        src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
        alt: "Minimalist modern interior"
    },
    quote: {
        text: "Patience is the key to paradise.",
        author: "EaseMize UI"
    }
};

export function AuthUI({ 
  signInContent = {}, 
  signUpContent = {}, 
  pendingContent = {},
  initialMode = "signin",
  onSignInSubmit,
  onSignUpSubmit,
  onCheckStatus,
  onSignOut,
  onToggle,
  loading,
  checking,
  approved,
  email
}: AuthUIProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "pending">(initialMode);
  
  // Update state if initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const toggleForm = (newMode: "signin" | "signup") => {
    setMode(newMode);
    if (onToggle) onToggle(newMode);
  };

  const finalSignInContent = {
      image: { ...defaultSignInContent.image, ...signInContent.image },
      quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
      image: { ...defaultSignUpContent.image, ...signUpContent.image },
      quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };
  const finalPendingContent = {
      image: { ...defaultPendingContent.image, ...pendingContent.image },
      quote: { ...defaultPendingContent.quote, ...pendingContent.quote },
  };

  const currentContent = mode === "signin" 
    ? finalSignInContent 
    : mode === "signup" 
      ? finalSignUpContent 
      : finalPendingContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
      </div>

      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12 relative z-10">
        <AuthFormContainer 
          mode={mode} 
          onToggle={toggleForm} 
          onSignInSubmit={onSignInSubmit}
          onSignUpSubmit={onSignUpSubmit}
          onCheckStatus={onCheckStatus}
          onSignOut={onSignOut}
          loading={loading}
          checking={checking}
          approved={approved}
          email={email}
        />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out z-10"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-12">
            <blockquote className="space-y-2 text-center text-foreground max-w-lg px-8">
              <p className="text-xl font-medium drop-shadow-sm">
                “<Typewriter
                    key={currentContent.quote.text}
                    text={currentContent.quote.text}
                    speed={60}
                  />”
              </p>
              <cite className="block text-sm font-light text-muted-foreground not-italic">
                  — {currentContent.quote.author}
              </cite>
            </blockquote>
        </div>
      </div>
    </div>
  );
}
