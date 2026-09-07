import React, { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function InputOtpDemo() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
      <div className="text-center">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Verification Code
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter the 6-digit one-time password sent to your device
        </p>
      </div>

      <InputOTP
        maxLength={6}
        value={value}
        onChange={(val) => setValue(val)}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
        {value ? `Current Value: ${value}` : "Awaiting input..."}
      </div>
    </div>
  );
}

export default InputOtpDemo;
