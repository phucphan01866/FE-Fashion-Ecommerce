// // utils/fetchWithAuth.ts
// import Cookies from 'js-cookie';
// import { authService } from '@/service/auth.service';

// export const ogFetch = globalThis.fetch.bind(globalThis);

// const isTokenExpired = (token: string) => {
//   try {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     return payload.exp * 1000 < Date.now();
//   } catch {
//     return true;
//   }
// };

// async function refreshAccessToken(): Promise<string> {
//   const refreshToken = Cookies.get('refreshToken');
//   if (!refreshToken) throw new Error('No refresh token');

//   const res = await authService.refresh();
//   Cookies.set('accessToken', res.accessToken, { expires: 1, secure: true, sameSite: 'strict' });
//   return res.accessToken;
// }

// // check có token -> hết hạn -> refresh
// // check có token -> không hết hạn -> 

// export const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
//   let accessToken = Cookies.get('accessToken') || '';
//   // console.log("input: ", input);
//   // Nếu có token và đã hết hạn → refresh trước
//   if (accessToken && isTokenExpired(accessToken)) {
//     try {
//       accessToken = await refreshAccessToken();
//     } catch (err) {
//       // Nếu lỗi -> logout
//       Cookies.remove('accessToken');
//       Cookies.remove('refreshToken');
//       accessToken = '';
//     }
//   }

//   const headers = new Headers(init?.headers);
//   // if (accessToken) {
//   //   headers.set('Authorization', `Bearer ${accessToken}`);
//   // }

//   try {
//     const response = await ogFetch(input, { ...init, headers });
//     // Nếu vẫn 401 sau khi đã cố refresh → token không hợp lệ -> goTo login
//     if (response.status === 401 && accessToken) {
//       Cookies.remove('accessToken');
//       Cookies.remove('refreshToken');
//     }

//     return response;
//   } catch (error) {
//     console.log(error);
//   }
// };

// // Tự động thay thế fetch toàn cục
// if (typeof window !== 'undefined') {
//   // @ts-ignore
//   window.fetch = fetchWithAuth;
// }