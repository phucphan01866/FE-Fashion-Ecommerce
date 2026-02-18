'use client'
import BaseAuthForm, { Button, InputField } from '@/app/ui/authentication/BaseAuthForm';
import Link from 'next/link';
import React from 'react';
import { useState } from 'react';
import { useNotificateArea } from '@/context/NotificateAreaContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { authService, RegisterData } from '@/service/auth.service';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


export default function RegisterForm() {
  const router = useRouter();
  const handleGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };
  const { setNotification } = useNotificateArea();
  const [isInputOTP, setIsInputOTP] = useState<boolean>(false);
  const [isSubmittingData, setIsSubmittingData] = useState<boolean>(false);
  const [registerData, setRegisterData] = useState<RegisterData>();
  interface ValidationErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string
  }
  const [errors, setErrors] = useState<ValidationErrors>({});
  function validate(fullName: string, email: string, phone: string, password: string, confirmPassword: string) {
    const newErrors: ValidationErrors = {};

    if (!fullName || !fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống!";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự!";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName.trim())) {
      newErrors.fullName = "Họ và tên chỉ được chứa chữ cái!";
    }

    if (!email || !email.trim()) {
      newErrors.email = "Email không được để trống!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email không hợp lệ!";
    }

    if (!phone || !phone.trim()) {
      newErrors.phone = "SĐT không được để trống!";
    } else {
      const cleanPhone = phone.replace(/[\s.,/]/g, '');

      if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
        newErrors.phone = "SĐT không hợp lệ!";
      }
    }

    if (!password || !password.trim()) {
      newErrors.password = "Mật khẩu không được để trống!";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu tối thiểu 8 ký tự!";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ thường!";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa!";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 1 chữ số!";
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu!";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
    }
    return newErrors;
  }

  async function submitFormData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmittingData(true);
    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string)?.trim() || '';
    const email = (formData.get("email") as string)?.trim() || '';
    const phone = (formData.get("phone") as string)?.trim() || '';
    const password = (formData.get("password") as string)?.trim() || '';
    const confirmPassword = (formData.get("confirmPassword") as string)?.trim() || '';
    const newErrors = validate(fullName, email, phone, password, confirmPassword);
    setErrors(newErrors);
    try {
      if (Object.keys(newErrors).length > 0) {
        throw new Error("Thông tin đăng ký không hợp lệ!");
      }
      const regData: RegisterData = {
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
      }
      setRegisterData(regData);
      setNotification(await authService.sendOTPRegister(regData));
      setIsInputOTP(true);
    } catch (err) {
      let message = "Đăng ký không thành công!";
      if (err instanceof Error)
        if (err.message === "Email already exists") {
          message = "Email đã được sử dụng!";
        }
      setNotification(message);
    }
    setIsSubmittingData(false);
  }
  function validateOTP(OTP: string) {
    if (!OTP) {
      throw new Error("Vui lòng nhập mã OTP!")
    }

    if (!/^\d+$/.test(OTP)) {
      throw new Error("OTP chỉ được chứa số!")
    }

    if (OTP.length !== 6) {
      throw new Error("OTP phải có đúng 6 chữ số!")
    }
  }

  async function submitOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const OTP = (formData.get("otp") as string)?.trim() || "";
    try {
      validateOTP(OTP);
      if (registerData) {
        const res = await authService.verifyOTPAndRegister(registerData, OTP);
        setNotification("Tạo tài khoản thành công!");
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof Error) setNotification(err.message);
    }
    return null;
  }
  if (!isInputOTP) {
    return (
      <BaseAuthForm
        formBonusCSS='max-w-[600px]'
        type='register'
        socialButtons={
          <>
            <Button imgSrc="/icon/Google.svg" altText="Đăng ký Google" onClick={handleGoogle}>Đăng ký bằng Google</Button>
          </>
        }
        footerContents={
          <p className="text-center">
            Bạn đã có tài khoản?<span> </span>
            <Link href="/login" className='hover:text-orange-500'>
              Đăng nhập ngay!
            </Link>
          </p>
        }
      >
        <form onSubmit={submitFormData} className='flex flex-col gap-4'>
          <InputField
            id="fullName"
            label="Họ và tên"
            type='text'
            placeholder="VD: Phan Văn A"
            error={errors.fullName}
          />
          <div className='grid grid-cols-[60%_1fr] gap-4'>

            <div className='flex flex-col gap-1'>
              <InputField
                id="email"
                label="Tài khoản E-mail"
                type="email"
                placeholder="VD: your@email.com"
              />
              {errors.email && (
                <label className='fontA5 italic text-red-500' htmlFor="email">{errors.email}</label>
              )}
            </div>
            <div className='flex flex-col gap-1'>
              <InputField
                id="phone"
                label="Số điện thoại"
                type="tel"
                placeholder="0912345678"
              />
              {errors.phone && (
                <label className='fontA5 italic text-red-500' htmlFor="email">{errors.phone}</label>
              )}
            </div>

          </div>
          <InputField
            id="password"
            label="Mật khẩu"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            error={errors.password}
          />
          <InputField
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            error={errors.confirmPassword}
          />
          <button disabled={isSubmittingData} type="submit" className="w-full bg-orange-400 hover:opacity-90 hover:cursor-pointer hover:shadow-sm text-white py-2 rounded">
            {isSubmittingData ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
          </button>
        </form>
      </BaseAuthForm>
    );
  } else {
    return (
      <BaseAuthForm
        formBonusCSS='max-w-[600px]'
        type='register'
        socialButtons={
          null
        }
        footerContents={
          <p className="text-center">
            Bạn đã có tài khoản?<span> </span>
            <Link href="/login" className='hover:text-orange-500'>
              Đăng nhập ngay!
            </Link>
          </p>
        }
      >
        <form onSubmit={submitOtp} className='flex flex-col gap-4'>
          <InputField
            id="otp"
            label="Nhập mã OTP được gửi đến e-mail của bạn"
            type="text"
            placeholder="Nhập OTP"
            autofill='off'
          />
          <button type="submit" className="w-full bg-orange-400 hover:opacity-90 hover:cursor-pointer hover:shadow-sm text-white py-2 rounded">
            Xác nhận OTP
          </button>
        </form>
      </BaseAuthForm>
    );
  }

}