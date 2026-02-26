'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Page() {
  return (
    <Suspense fallback={<div className="font-a5 italic text-center mt-4">Đang xử lý đăng nhập...</div>}>
      <AuthCallback />
    </Suspense>
  );
}

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const BE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

        // If backend returned tokens in URL (dev mode), store them in cookie and call /api/me with Authorization
        const urlAccess = searchParams.get('accessToken');
        const urlRefresh = searchParams.get('refreshToken');

        if (urlAccess) {
          // dev-only: persist tokens (insecure). Replace with proper storage in your app.
          Cookies.set('accessToken', urlAccess, { expires: 1, secure: true, sameSite: 'strict' });
          if (urlRefresh) Cookies.set('refreshToken', urlRefresh, { expires: 7, secure: true, sameSite: 'strict' });

          // call backend /api/me with Authorization header
          const res = await fetch(`${BE}/api/me`, {
            headers: {
              Authorization: `Bearer ${urlAccess}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            console.log('User (from token):', data.user);
            window.location.href = '/'; // Quay lại trang chủ đồng thời reload
            return;
          } else {
            router.replace('/login?error=session_not_found');
            return;
          }
        }

        // Otherwise assume backend set HttpOnly cookie; fetch with credentials
        const res = await fetch(`${BE}/api/me`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          console.log('User (from cookie):', data.user);
          window.location.href = '/';
        } else {
          router.replace('/login?error=session_not_found');
        }
      } catch (err) {
        console.error(err);
        router.replace('/login?error=network');
      }
    };

    if (status === 'success') checkUser();
    else router.replace('/login?error=google_failed');
  }, [router, searchParams, status]);

  return (
    <Suspense fallback={<div className="font-a5 italic text-center mt-4">Đang xử lý đăng nhập...</div>}>
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium">Đăng nhập thành công!</p>
      </div>
    </Suspense>
  );
}