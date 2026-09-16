import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | CODEXA.io",
  description: "Start mastering System Design with CODEXA.io. Create your free account today.",
};

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "w-full max-w-md",
          card: "bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl rounded-2xl",
          headerTitle: "text-white font-bold text-xl",
          headerSubtitle: "text-zinc-400 text-sm",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700/80 text-white font-medium",
          socialButtonsBlockButtonText: "text-zinc-200 font-medium",
          dividerRow: "border-zinc-800",
          dividerText: "text-zinc-500 text-xs",
          formFieldLabel: "text-zinc-300 text-xs font-medium",
          formFieldInput: "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-cx-orange focus:ring-cx-orange/20 rounded-lg",
          formButtonPrimary: "bg-gradient-to-r from-cx-orange to-[#FF8533] hover:opacity-90 text-white font-semibold py-2.5 shadow-lg shadow-cx-orange/25 transition-all",
          footerActionLink: "text-cx-orange hover:text-[#FF8533] font-medium",
          footerActionText: "text-zinc-400 text-xs",
          identityPreviewText: "text-zinc-200",
          formResendCodeLink: "text-cx-orange",
        },
      }}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
    />
  );
}
