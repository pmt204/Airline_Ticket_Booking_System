const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

const createPaymentUrl = async (req, res) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;

    let tmnCode = process.env.VNP_TMNCODE;
    let secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;

    // Nhận dữ liệu từ Frontend truyền lên
    let orderId = req.body.bookingCode || moment(date).format('DDHHmmss'); 
    let amount = req.body.amount; 
    let bankCode = ''; 
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan ve may bay FlightAir - Ma don: ' + orderId;
    vnp_Params['vnp_OrderType'] = 'billpayment';
    vnp_Params['vnp_Amount'] = amount * 100; 
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp dữ liệu theo thứ tự a-z trước khi băm 
    vnp_Params = sortObject(vnp_Params);

    // Ký dữ liệu
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    // Trả link về cho Frontend để tự redirect
    res.status(200).json({ paymentUrl: vnpUrl });
  } catch (error) {
    console.error('Lỗi tạo link VNPay:', error);
    res.status(500).json({ message: 'Lỗi tạo giao dịch VNPay' });
  }
};

// Hàm phụ trợ sắp xếp Object của VNPay
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) { str.push(encodeURIComponent(key)); }
	}
	str.sort();
	for (key = 0; key < str.length; key++) {
		sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
	}
	return sorted;
}

module.exports = { createPaymentUrl };