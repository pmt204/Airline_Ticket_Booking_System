import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; 

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const confirmPaymentWithBackend = async () => {
      const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
      const vnp_TxnRef = searchParams.get('vnp_TxnRef'); 

      if (vnp_ResponseCode === '00') {
        try {
          await axiosClient.post('/api/bookings/confirm', { bookingCode: vnp_TxnRef });
          setStatus('success');
        } catch (error) {
          console.error(error);
          setStatus('failed');
        }
      } else if (vnp_ResponseCode) {
        setStatus('failed');
      }
    };

    confirmPaymentWithBackend();
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl text-center">
        
        {/* GIAO DIỆN KHI THÀNH CÔNG */}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-3xl font-black text-green-600 mb-2">Thanh Toán Thành Công!</h2>
            <p className="text-gray-600 mb-6">Vé điện tử của bạn đã được gửi qua email. Vui lòng kiểm tra hộp thư đến (kể cả thư rác).</p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-8 text-left text-sm space-y-2">
              <p>
                <span className="text-gray-500">Mã giao dịch (VNPay):</span> 
                <span className="font-bold ml-2">{searchParams.get('vnp_TransactionNo')}</span>
              </p>
              <p>
                <span className="text-gray-500">Mã đơn hàng:</span> 
                <span className="font-bold ml-2">{searchParams.get('vnp_TxnRef')}</span>
              </p>
              <p>
                <span className="text-gray-500">Số tiền:</span> 
                <span className="font-bold text-red-600 ml-2">
                  {(Number(searchParams.get('vnp_Amount')) / 100).toLocaleString()} VND
                </span>
              </p>
            </div>
          </>
        )}

        {/* GIAO DIỆN KHI THẤT BẠI HOẶC HỦY */}
        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-3xl font-black text-red-600 mb-2">Thanh Toán Thất Bại</h2>
            <p className="text-gray-600 mb-6">Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán từ phía ngân hàng.</p>
          </>
        )}

        {/* NÚT ĐIỀU HƯỚNG CHUNG */}
        <Link 
          to="/" 
          className="inline-block w-full bg-gray-800 text-white font-bold px-8 py-4 rounded-xl hover:bg-black transition shadow-md"
        >
          Trở Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;