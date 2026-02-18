'use client';
import BaseAuthForm, { InputField, Button } from '@/app/ui/authentication/BaseAuthForm';
import Link from 'next/link';
import React from 'react';
import { useState } from 'react';
import { useNotificateArea } from '@/context/NotificateAreaContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Login() {
  const router = useRouter();
  const handleGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };
  interface ValidationErrors {
    email?: string,
    password?: string,
  }
  const { setNotification } = useNotificateArea();
  const { login } = useAuth();
  const [errors, setErrors] = useState<ValidationErrors>({});
  function validate(email: string, password: string) {
    const newErrors: ValidationErrors = {};
    if (!email) {
      newErrors.email = "Email không được để trống!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không được chứa ký tự đặc biệt!";
    }
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống!";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu tối thiểu 8 ký tự!";
    }
    return newErrors;
  }
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("userInfo") as string).trim() || '';
    const password = (formData.get("password") as string) || '';
    const newErrors = validate(email, password);
    setErrors(newErrors);
    try {
      if (Object.keys(newErrors).length > 0) {
        throw new Error("Thông tin đăng nhập không hợp lệ!");
      }
      await login(email, password);
      setNotification("Đăng nhập thành công!");
      router.push("/");
    } catch (err) {
      if (err instanceof Error) setNotification(err.message);
    }
  }

  return (
    <BaseAuthForm
      type="login"
      socialButtons={
        <>
          <Button imgSrc="/icon/Google.svg" altText="Login with Google" onClick={handleGoogle}>
            Đăng nhập bằng Google
          </Button>
        </>
      }
      footerContents={
        <p className="mt-4 text-center">
          Bạn chưa có tài khoản? <span> </span>
          <Link href="/register" className='hover:text-orange-500'>Đăng ký ở đây!</Link>
        </p>
      }
    >
      <form className='flex flex-col gap-4' onSubmit={handleLogin}>
        <InputField
          id="userInfo"
          label="Email đăng nhập"
          type="email"
          placeholder="example@mail.com"
          error={errors.email}
        />
        <InputField
          id="password"
          label="Mật khẩu đăng nhập"
          type="password"
          placeholder="Mật khẩu tối thiểu 8 ký tự"
          error={errors.password}
        />
        <div className='flex justify-end'>
          <Link href="/reset-password" className='hover:text-orange-500 fontA5 italic'>Quên mật khẩu?</Link>
        </div>

        <button type="submit" className="w-full bg-orange-400 hover:opacity-90 hover:cursor-pointer hover:shadow-sm text-white py-2 rounded">
          Đăng nhập
        </button>
      </form>
    </BaseAuthForm>
  );
}
