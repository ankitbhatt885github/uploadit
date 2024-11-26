"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

const OtpModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  //value of OTP
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  //to make typescript understand that event is a mouse event
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    console.log({ accountId, password });

    try {
        //verify the OTP: defined in server actions
        //if OTP is valid it gives sessionID
      const sessionId = await verifySecret({ accountId, password });

      console.log({ sessionId });

      //if sessionID exists move to Homepage
      if (sessionId) router.push("/");
    } catch (error) {
      console.log("Failed to verify OTP", error);
    }

    setIsLoading(false);
  };

  //resend the OTP
  const handleResendOtp = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We&apos;ve sent a code to{" "}
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="text-[40px] font-medium rounded-xl ring-brand shadow-drop-1 text-brand-100 justify-center flex border-2 border-light-300 size-12 md:size-16 gap-5" />
            <InputOTPSlot index={1} className="text-[40px] font-medium rounded-xl ring-brand shadow-drop-1 text-brand-100 justify-center flex border-2 border-light-300 size-12 md:size-16 gap-5" />
            <InputOTPSlot index={2} className="text-[40px] font-medium rounded-xl ring-brand shadow-drop-1 text-brand-100 justify-center flex border-2 border-light-300 size-12 md:size-16 gap-5" />
            <InputOTPSlot index={3} className="text-[40px] font-medium rounded-xl ring-brand shadow-drop-1 text-brand-100 justify-center flex border-2 border-light-300 size-12 md:size-16 gap-5" />
            <InputOTPSlot index={4} className="text-[40px] font-medium rounded-xl ring-brand shadow-drop-1 text-brand-100 justify-center flex border-2 border-light-300 size-12 md:size-16 gap-5" />
            <InputOTPSlot index={5} className="text-[40px] font-medium rounded-xl ring-brand shadow-drop-1 text-brand-100 justify-center flex border-2 border-light-300 size-12 md:size-16 gap-5" />
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              
              className="bg-brand button hover:bg-brand-100 transition-all rounded-full h-12"
              type="button"
              onClick={handleSubmit}
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn&apos;t get a code?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
               onClick={handleResendOtp}
              >
                Click to resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;