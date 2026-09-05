import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      fallbackRedirectUrl="/dashboard"
      forceRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "w-full max-w-[400px]",
          cardBox: "w-full shadow-2xl",
          card: "w-full bg-white border-2 border-black rounded-xl shadow-xl p-6 sm:p-7 text-neutral-900",
          headerTitle: "text-xl font-extrabold text-neutral-900 tracking-tight",
          headerSubtitle: "text-xs text-neutral-600 mt-1",
          socialButtonsBlockButton:
            "border border-black bg-[#F5F2EB] text-neutral-900 hover:bg-black/5 font-semibold text-xs rounded-md py-2 transition-colors",
          socialButtonsBlockButtonText: "font-semibold text-neutral-900 text-xs",
          dividerLine: "bg-neutral-200",
          dividerText: "text-[11px] font-mono text-neutral-400 uppercase tracking-wider",
          formFieldLabel: "text-xs font-semibold text-neutral-800",
          formFieldInput:
            "bg-white border border-neutral-300 text-neutral-900 rounded-md text-sm py-2 px-3 focus:border-black focus:ring-1 focus:ring-black transition",
          formButtonPrimary:
            "bg-black text-white hover:bg-neutral-800 font-semibold text-xs py-2.5 rounded-md transition-colors shadow-sm",
          footerActionText: "text-xs text-neutral-500",
          footerActionLink: "text-xs font-semibold text-neutral-900 hover:underline",
          identityPreviewText: "text-xs text-neutral-800 font-medium",
          identityPreviewEditButton: "text-xs text-neutral-600 hover:text-black",
        },
      }}
    />
  );
}
