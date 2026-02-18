'use client';

import { ControllableInputSelect, InputField } from '@/app/ui/general/Input/Input';
import { StatiticProvider, useStatitic } from '@/context/AdminContexts/StatiticContext';
import { ChangeEvent, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PayloadStatistics, PayloadTopProducts } from '@/service/stastitics.service';
import { Title, VoidGeneralButton } from '@/app/ui/user/general/general';

export default function Page(
  { children }: { children: React.ReactNode }
) {

  return (
    <StatiticProvider>
      <AdminRevenueDashboard />
    </StatiticProvider>
  );
};

export function AdminRevenueDashboard() {
  const { saleStatistics, statQuery, updateStatQuery, fetchSaleStatiticData, currentStatQuery } = useStatitic();
  // console.log(JSON.stringify(currentStatQuery) !== JSON.stringify(statQuery));
  // console.log((statQuery.start ? statQuery.start.length === 10 : false));
  // console.log((statQuery.end ? statQuery.end.length === 10 : false));
  console.log(currentStatQuery, statQuery);
  const isUpdateAble = (JSON.stringify(currentStatQuery) !== JSON.stringify(statQuery)) && (statQuery.start ? statQuery.start.length === 10 : false) && (statQuery.end ? statQuery.end.length === 10 : false);
  const totalRevenue = saleStatistics.data.reduce((sum, item) => sum + Number(item.revenue), 0);
  const totalOrders = saleStatistics.data.reduce((sum, item) => sum + Number(item.orders_count), 0);

  const formatVND = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const { topProducts, productsPayload, updateProductsPayload, refetchTopProducts, currentProductsPayload } = useStatitic();
  // console.log(currentProductsPayload, productsPayload);
  // console.log((JSON.stringify(currentProductsPayload) !== JSON.stringify(productsPayload)), (productsPayload.start ? productsPayload.start.length === 10 : true), (productsPayload.end ? productsPayload.end.length === 10 : true));
  const isUpdateAbleProducts = (JSON.stringify(currentProductsPayload) !== JSON.stringify(productsPayload)) && (productsPayload.start ? productsPayload.start.length === 10 : true) && (productsPayload.end ? productsPayload.end.length === 10 : true);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <Title>
          <p>Thống kê doanh thu</p>
          <VoidGeneralButton />
        </Title>
        {/* Bộ lọc*/}
        <StatiticsQueryFilter
          statQuery={statQuery}
          updateStatQuery={updateStatQuery}
          fetchSaleStatiticData={fetchSaleStatiticData}
          isUpdateAble={isUpdateAble} />
        {/* Tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Tổng doanh thu</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{formatVND(totalRevenue)}</p>
                {/* <p className="text-sm text-gray-500 mt-1">6 tháng gần nhất</p> */}
              </div>
              <div className="bg-orange-100 p-5 rounded-2xl">
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Số đơn hàng đã hoàn thành</p>
                <p className="fontA1 font-bold text-gray-900 mt-3">{(totalOrders > 9 ? "" : "0") + (totalOrders > 99 ? "" : "0") + totalOrders}</p>
                {/* <p className="text-sm text-gray-500 mt-1">Đơn hàng thành công</p> */}
              </div>
              <div className="bg-orange-100 p-5 rounded-2xl">
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="fontA1 font-bold text-gray-900 mb-6">Biểu đồ doanh thu</h2>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={saleStatistics.data}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
              <XAxis
                dataKey="period_start"
                tickFormatter={(d) => {
                  if (statQuery.unit === 'year') return `Năm ${new Date(d).getFullYear()}`;
                  if (statQuery.unit === 'month') return new Date(d).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
                  const startDate = dayjs(d);
                  const endDate = startDate.add(6, 'day');
                  return `${startDate.format('DD/MM')} - ${endDate.format('DD/MM/YYYY')}`;
                }}
                stroke="#6b7280"
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)} triệu`}
                stroke="#6b7280"
              />
              <Tooltip
                formatter={(value: any) => formatVND(Number(value))}
                // note
                labelFormatter={(label) => {
                  if (statQuery.unit === 'year') return `Năm ${new Date(label).getFullYear()}`;
                  if (statQuery.unit === 'week') {
                    const startDate = dayjs(label);
                    const endDate = startDate.add(6, 'day');
                    return `${startDate.format('YYYY/MM/DD')} - ${endDate.format('YYYY/MM/DD')}`;
                  }
                  return `${new Date(label).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`
                }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={5}
                dot={{ fill: '#f97316', r: 8 }}
                activeDot={{ r: 10 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 sản phẩm */}
        <TopProductsQueryFilter productsPayload={productsPayload} updateProductsPayload={updateProductsPayload} refetchTopProducts={refetchTopProducts} isUpdateAble={isUpdateAbleProducts} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="fontA1 font-bold text-gray-900 mb-6">Top 10 sản phẩm bán chạy nhất</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-700 font-semibold">
                  <th className="text-left py-4 w-12 h-12 flex justify-center">#</th>
                  <th className="text-left py-4">Tên sản phẩm</th>
                  <th className="text-right py-4">Doanh thu</th>
                  <th className="text-right py-4">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {topProducts && topProducts.data.map((p, idx) => (
                  <tr key={p.variant_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg
                        ${idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-orange-400' : idx === 2 ? 'bg-orange-300' : 'bg-gray-400'}
                      `}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="py-6 font-medium text-gray-900 max-w-md">{p.name_snapshot}</td>
                    <td className="py-6 text-right font-bold text-orange-600">{formatVND(Number(p.revenues))}</td>
                    <td className="py-6 text-right text-gray-700 font-medium">{Number(p.qty_sold).toLocaleString()}</td>
                  </tr>
                ))}
                {(!topProducts || topProducts.data.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">Không có dữ liệu sản phẩm trong khoảng thời gian này</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatiticsQueryFilter({
  statQuery,
  updateStatQuery,
  fetchSaleStatiticData,
  isUpdateAble = false
}: {
  statQuery: PayloadStatistics,
  updateStatQuery: (content: Partial<PayloadStatistics>) => void,
  fetchSaleStatiticData: () => Promise<void>;
  isUpdateAble: boolean;
}) {
  const formatInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input.length === 0) return '';
    if (!/^[\d/]*$/.test(input)) {
      return; // không cho nhập ký tự lạ
    }
    const numbers = input.replace(/\D/g, '');
    if (numbers.length > 8) return;
    const formatted = formatDDMMYYYY(numbers);
    return formatted;
  }
  const formatDDMMYYYY = (numbers: string) => {
    if (numbers.length === 0) return '';
    let day = '';
    let month = '';
    let year = '';
    if (numbers.length <= 2) {
      day = numbers;
    } else if (numbers.length <= 4) {
      day = numbers.slice(0, 2);
      month = numbers.slice(2);
    } else {
      day = numbers.slice(0, 2);
      month = numbers.slice(2, 4);
      year = numbers.slice(4, 8);
    }
    let formatted = (Number(day) > 31 ? '31' : day);
    if (month) formatted += '/' + (Number(month) > 12 ? '12' : month);
    if (year) formatted += '/' + year;
    return formatted;
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 grid grid-cols-[1fr_1fr_1fr_auto] gap-6">
      <ControllableInputSelect
        items={[
          { content: 'week', label: 'Xem theo tuần' },
          { content: 'month', label: 'Xem theo tháng' },
          { content: 'year', label: 'Xem theo năm' },
        ]}
        id='statitics unit'
        label='Đơn vị'
        currentValue={statQuery.unit}
        onClick={(content) => updateStatQuery({ unit: content as 'week' | 'month' | 'year' })}
      />
      <InputField
        id="stat-start"
        placeholder='01/01/2015'
        label="Từ ngày"
        type="text"
        value={statQuery.start || ''}
        onChange={(e) => {
          const formatted = formatInput(e);
          if (formatted !== undefined && formatted !== null) {
            updateStatQuery({ start: formatted });
          }
        }}
      />
      <InputField
        id="stat-end"
        placeholder='31/12/2030'
        label="Đến ngày"
        type="text"
        value={statQuery.end || ''}
        onChange={(e) => {
          const formatted = formatInput(e);
          if (formatted !== undefined && formatted !== null) {
            updateStatQuery({ end: formatted });
          }
        }}
      />
      <button
        type="button"
        onClick={() => { if (isUpdateAble) fetchSaleStatiticData(); }}
        className={`
          transition-all duration-200 ease-in-out
          p-2 py-3 rounded-md  text-white fontA3  col-span-3
          ${isUpdateAble ? 'cursor-pointer bg-orange-500 hover:bg-orange-600' : 'cursor-not-allowed opacity-50 bg-gray-500'}
            `}
      >
        Cập nhật bộ lọc
      </button>
    </div>
  )
}

function TopProductsQueryFilter({
  productsPayload,
  updateProductsPayload,
  refetchTopProducts,
  isUpdateAble = false
}: {
  productsPayload: PayloadTopProducts,
  updateProductsPayload: (content: Partial<PayloadTopProducts>) => void,
  refetchTopProducts: () => Promise<void>;
  isUpdateAble: boolean;
}) {
  const formatInput = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input.length === 0) return '';
    if (!/^[\d/]*$/.test(input)) {
      return; // không cho nhập ký tự lạ
    }
    const numbers = input.replace(/\D/g, '');
    if (numbers.length > 8) return;
    const formatted = formatDDMMYYYY(numbers);
    return formatted;
  }
  const formatDDMMYYYY = (numbers: string) => {
    if (numbers.length === 0) return '';
    let day = '';
    let month = '';
    let year = '';
    if (numbers.length <= 2) {
      day = numbers;
    } else if (numbers.length <= 4) {
      day = numbers.slice(0, 2);
      month = numbers.slice(2);
    } else {
      day = numbers.slice(0, 2);
      month = numbers.slice(2, 4);
      year = numbers.slice(4, 8);
    }
    let formatted = (Number(day) > 31 ? '31' : day);
    if (month) formatted += '/' + (Number(month) > 12 ? '12' : month);
    if (year) formatted += '/' + year;
    setQuickRange('');
    return formatted;
  }
  const [quickRange, setQuickRange] = useState<string>('7d');
  const quickSelectRanges = (choice: string) => {
    const today = dayjs();
    switch (choice) {
      case '1d':
        updateProductsPayload({
          start: today.format('YYYY/MM/DD'),
          end: today.format('YYYY/MM/DD'),
        });
        break;
      case '7d':
        updateProductsPayload({
          start: today.subtract(6, 'day').format('YYYY/MM/DD'),
          end: today.format('YYYY/MM/DD'),
        });
        break;
      case '30d':
        updateProductsPayload({
          start: today.subtract(29, 'day').format('YYYY/MM/DD'),
          end: today.format('YYYY/MM/DD'),
        });
        break;
      case '6m':
        updateProductsPayload({
          start: today.subtract(6, 'month').format('YYYY/MM/DD'),
          end: today.format('YYYY/MM/DD'),
        });
        break;
      case '1y':
        updateProductsPayload({
          start: today.subtract(1, 'year').format('YYYY/MM/DD'),
          end: today.format('YYYY/MM/DD'),
        });
        break;
      default:
        break;
    }
    setQuickRange(choice as string);
    // if (isUpdateAble) refetchTopProducts();
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 grid grid-cols-[1fr_1fr_1fr_auto] gap-6">
      <ControllableInputSelect
        items={[
          { content: '', label: 'Chọn nhanh' },
          { content: '1d', label: 'trong ngày' },
          { content: '7d', label: '7 ngày trước' },
          { content: '30d', label: '30 ngày trước' },
          { content: '6m', label: '6 tháng trước' },
          { content: '1y', label: '1 năm trước' },
        ]}
        id='statitics unit'
        label='Đơn vị'
        currentValue={quickRange}
        onClick={(content) => { quickSelectRanges(content as string); }}
      />
      <InputField
        id="prod-stat-start"
        placeholder='01/01/2015'
        label="Từ ngày"
        type="text"
        value={productsPayload.start || ''}
        onChange={(e) => {
          const formatted = formatInput(e);
          if (formatted !== undefined && formatted !== null) {
            updateProductsPayload({ start: formatted });
          }
        }}
      />
      <InputField
        id="prod-stat-end"
        placeholder='31/12/2030'
        label="Đến ngày"
        type="text"
        value={productsPayload.end || ''}
        onChange={(e) => {
          const formatted = formatInput(e);
          if (formatted !== undefined && formatted !== null) {
            updateProductsPayload({ end: formatted });
          }
        }}
      />
      <button
        type="button"
        onClick={() => { if (isUpdateAble) refetchTopProducts(); }}
        className={`
          transition-all duration-200 ease-in-out
          p-2 py-3 rounded-md  text-white fontA3  col-span-3
          ${isUpdateAble ? 'cursor-pointer bg-orange-500 hover:bg-orange-600' : 'cursor-not-allowed opacity-50 bg-gray-500'}
            `}
      >
        Cập nhật bộ lọc
      </button>
    </div>
  )
}