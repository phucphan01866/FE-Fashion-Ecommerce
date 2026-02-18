'use client';
import BaseAuthForm, { InputField, Button } from '@/app/ui/authentication/BaseAuthForm';
import Link from 'next/link';
import React from 'react';
import { useState } from 'react';
import { useNotificateArea } from '@/context/NotificateAreaContext';
import { useRouter } from 'next/navigation';
import { authService, ResetPWData } from '@/service/auth.service';

export default function Reset() {
  const router = useRouter();
  const { setNotification } = useNotificateArea();

  interface FormPWValidationErrors {
    newPassword?: string,
    confirmNewPassword?: string
  }



  const [submittedEmail, setSubmittedEmail] = useState<string>();
  const [submittingOTP, setSubmittingOTP] = useState<string>();
  const [submittedOTP, setSubmittedOTP] = useState<string>();
  const [isSubmittingData, setIsSubmittingData] = useState<boolean>(false);
  const [submittedNewPW, setSubmittedNewPW] = useState<string>();
  const [resetToken, setResetToken] = useState<string>();

  const [emailError, setEmailError] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [PWErrors, setPWErrors] = useState<FormPWValidationErrors>({});

  function onChangeOTP(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const newValue = value.replace(/[^0-9]/g, '').slice(0, 6); //Loại các ký tự !== 0-9 và chỉ lấy 6 ký tự đầu
    setSubmittingOTP(newValue);
  }

  function validateEmail(email?: string) {
    let err: string = "";
    // Email
    if (!email) {
      err = "Email không được để trống!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err = "Email không hợp lệ!";
    }
    setEmailError(err);
    return err.length;
  }

  function validateOTP(otp?: string) {
    let err: string = "";
    // Email
    if (!otp) {
      err = "Mã OTP không được để trống!";
    }
    setOtpError(err);
  }

  function validatePW(newPW: string, confirmNewPW: string) {
    const newErrors: FormPWValidationErrors = {};

    if (!newPW || !newPW.trim()) {
      newErrors.newPassword = "Mật khẩu không được để trống!";
    } else if (newPW.length < 8) {
      newErrors.newPassword = "Mật khẩu tối thiểu 8 ký tự!";
    } else if (!/(?=.*[a-z])/.test(newPW)) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 1 chữ thường!";
    } else if (!/(?=.*[A-Z])/.test(newPW)) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 1 chữ hoa!";
    } else if (!/(?=.*\d)/.test(newPW)) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 1 chữ số!";
    }

    if (!confirmNewPW || !confirmNewPW.trim()) {
      newErrors.confirmNewPassword = "Vui lòng xác nhận mật khẩu!";
    } else if (newPW !== confirmNewPW) {
      newErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp!";
    }
    return newErrors;
  }

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = (formData.get("email") as string).trim() || '';

    setIsSubmittingData(true);
    try {
      if (validateEmail(email) > 0) {
        throw new Error("Cú pháp Email không hợp lệ!");
      }
      const res = await authService.resetPW.sendOTP(email);
      setNotification(res);
      setSubmittedEmail(email);
    } catch (err) {
      if (err instanceof Error) {
        setNotification(err.message);
      }
    }
    setIsSubmittingData(false);
  }

  async function handleVerifyOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const otp = (formData.get("otp") as string).trim() || '';

    validateOTP(otp);
    console.log(otp);

    setIsSubmittingData(true);
    try {
      if (otpError.length > 0) {
        throw new Error("Mã OTP không hợp lệ!");
      }
      const res = await authService.resetPW.verifyOTP({ email: submittedEmail || "", otp });
      setNotification(res.message);
      setResetToken(res.resetToken);
      console.log(res);
      setSubmittedOTP(otp);
    } catch (err) {
      if (err instanceof Error) setNotification(err.message);
    }
    setIsSubmittingData(false);
  }

  async function handleSubmitNewPW(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);


    const newPW = (formData.get("newPW") as string).trim() || '';
    const confirmNewPW = (formData.get("confirmNewPW") as string).trim() || '';

    const formPWErrors = validatePW(newPW, confirmNewPW);
    setPWErrors(formPWErrors);

    setIsSubmittingData(true);
    const data: ResetPWData = {
      resetToken: resetToken || "",
      newPassword: newPW,
    }
    try {
      if (Object.keys(formPWErrors).length > 0) {
        throw new Error("Thông tin đăng nhập không hợp lệ!");
      }
      const res = await authService.resetPW.setNewPW(data);
      setNotification(res);
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) setNotification(err.message);
    }
    setIsSubmittingData(false);
  }

  function resetForm() {
    setSubmittedEmail(undefined);
    setSubmittedOTP(undefined);
    setSubmittedNewPW(undefined);
  }

  return (
    <BaseAuthForm
      type="forgotPassword"
    >
      <form className='flex flex-col gap-4' onSubmit={
        !submittedEmail ? handleSendOTP :
          !submittedOTP ? handleVerifyOTP :
            handleSubmitNewPW
      }>
        {!submittedOTP && (
          <>
            <InputField
              disabled={submittedEmail !== undefined}
              id='email'
              label='Nhập Email cần phục hồi :'
              type='email'
              placeholder='Chúng tôi sẽ gửi OTP đến Email này của bạn'
              error={emailError || ""} />
          </>
        )}
        {submittedEmail !== undefined && (
          <div className='flex justify-start'>
            <button onClick={resetForm} className='hover:text-orange-500 fontA5 italic cursor-pointer'>Nhập lại Email</button>
          </div>
        )}
        {(submittedEmail && !submittedOTP) && (
          <>
            <InputField
              id='otp'
              label='Nhập mã OTP :'
              type='text'
              maxLength={6}
              placeholder={`Nhập 6 chữ số OTP được gửi đến ${submittedEmail}`}
              onChange={onChangeOTP}
              value={submittingOTP || ""}
              error={otpError}
            />
          </>
        )}
        {(submittedEmail && submittedOTP) && (
          <>
            <InputField
              id='newPW'
              label='Mật khẩu mới :'
              type='password'
              placeholder='Nhập mật khẩu mới của bạn'
              error={PWErrors.newPassword || ""} />
            <InputField
              id='confirmNewPW'
              label='Nhập lại mật khẩu mới :'
              type='password'
              placeholder='Nhập lại mật khẩu mới của bạn'
              error={PWErrors.confirmNewPassword || ""} />
          </>
        )}
        <div className='flex justify-end'>
          <Link href="/login" className='hover:text-orange-500 fontA5 italic'>Quay lại trang đăng nhập!</Link>
        </div>

        <button type="submit" className="w-full bg-orange-400 hover:opacity-90 hover:cursor-pointer hover:shadow-sm text-white py-2 rounded">
          {!isSubmittingData ? "Gửi OTP" : "Đang gửi OTP..."}

        </button>
      </form>
    </BaseAuthForm>
  );
}