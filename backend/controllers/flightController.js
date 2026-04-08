const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const Airline = require('../models/Airline');

// ==========================================
// CHỨC NĂNG 1: QUẢN LÝ SÂN BAY & HÃNG BAY (Admin + Public)
// ==========================================
const getAirports = async (req, res) => {
  try { res.json(await Airport.find({})); } 
  catch (error) { res.status(500).json({ message: 'Lỗi lấy sân bay' }); }
};

const createAirport = async (req, res) => {
  try { res.status(201).json(await Airport.create(req.body)); } 
  catch (error) { res.status(400).json({ message: 'Lỗi tạo sân bay', error: error.message }); }
};

const getAirlines = async (req, res) => {
  try { res.json(await Airline.find({})); } 
  catch (error) { res.status(500).json({ message: 'Lỗi lấy hãng bay' }); }
};

const createAirline = async (req, res) => {
  try { res.status(201).json(await Airline.create(req.body)); } 
  catch (error) { res.status(400).json({ message: 'Lỗi tạo hãng bay', error: error.message }); }
};

// ==========================================
// CHỨC NĂNG 2: QUẢN LÝ CHUYẾN BAY (Admin)
// ==========================================
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find({})
      .populate('airline', 'name code')
      .populate('departureAirport', 'name code city')
      .populate('arrivalAirport', 'name code city')
      .sort({ createdAt: -1 }); // Mới nhất xếp lên đầu
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách chuyến bay' });
  }
};

const createFlight = async (req, res) => {
  try {
    const flightData = { ...req.body, availableSeats: req.body.seatCapacity }; // Ghế trống = Tổng ghế
    const newFlight = await Flight.create(flightData);
    res.status(201).json(newFlight);
  } catch (error) { res.status(400).json({ message: 'Lỗi tạo chuyến bay' }); }
};

const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    res.json({ message: 'Đã xóa chuyến bay thành công' });
  } catch (error) { res.status(500).json({ message: 'Lỗi xóa chuyến bay' }); }
};

// ==========================================
// CHỨC NĂNG 3: CẤU HÌNH GIÁ VÀ CHỖ NGỒI (Admin)
// ==========================================
const updateFlightPricing = async (req, res) => {
  try {
    const { basePrice, status } = req.body;
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });

    flight.basePrice = basePrice || flight.basePrice;
    flight.status = status || flight.status;
    
    await flight.save();
    res.json({ message: 'Cập nhật giá và trạng thái thành công', flight });
  } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật giá' }); }
};

// ==========================================
// CHỨC NĂNG 4: TÌM KIẾM, LỌC & SẮP XẾP (Public)
// ==========================================
const searchFlights = async (req, res) => {
  try {
    const { dep, arr, date, minPrice, maxPrice, airline, sort } = req.query;
    let query = { status: 'Scheduled' }; // Chỉ tìm chuyến bay sắp cất cánh

    // Lọc theo Nơi đi, Nơi đến
    if (dep) query.departureAirport = dep;
    if (arr) query.arrivalAirport = arr;

    // Lọc theo Ngày bay (Tìm trong khoảng từ 0h00 đến 23h59 của ngày đó)
    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(searchDate.getDate() + 1);
      query.departureTime = { $gte: searchDate, $lt: nextDate };
    }

    // Lọc theo Khoảng giá
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    // Lọc theo Hãng bay
    if (airline) query.airline = airline;

    // Xử lý Sắp xếp (Sort)
    let sortObj = { departureTime: 1 }; // Mặc định sắp xếp giờ bay tăng dần
    if (sort === 'price_asc') sortObj = { basePrice: 1 };
    if (sort === 'price_desc') sortObj = { basePrice: -1 };
    if (sort === 'time_desc') sortObj = { departureTime: -1 };

    // Thực thi Query với MongoDB
    const flights = await Flight.find(query)
      .populate('airline', 'name code logoUrl')
      .populate('departureAirport', 'name code city')
      .populate('arrivalAirport', 'name code city')
      .sort(sortObj);

    res.json(flights);
  } catch (error) { res.status(500).json({ message: 'Lỗi tìm kiếm chuyến bay', error: error.message }); }
};

// ==========================================
// CHỨC NĂNG 5: XEM CHI TIẾT CHUYẾN BAY (Public)
// ==========================================
const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('airline')
      .populate('departureAirport')
      .populate('arrivalAirport');
    
    if (!flight) return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });
    res.json(flight);
  } catch (error) { res.status(500).json({ message: 'Lỗi lấy chi tiết chuyến bay' }); }
};

// ==========================================
// CHỨC NĂNG 6: DỮ LIỆU SƠ ĐỒ CHỖ NGỒI (Public)
// ==========================================
const getSeatMap = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id).select('seatCapacity bookedSeats');
    if (!flight) return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });

    // Trả về tổng số ghế và danh sách các mã ghế đã có người đặt (VD: ['1A', '2B'])
    res.json({
      seatCapacity: flight.seatCapacity,
      bookedSeats: flight.bookedSeats,
      availableSeats: flight.seatCapacity - flight.bookedSeats.length
    });
  } catch (error) { res.status(500).json({ message: 'Lỗi lấy sơ đồ ghế' }); }
};

module.exports = {
  getAirports, createAirport,
  getAirlines, createAirline,
  createFlight, deleteFlight, updateFlightPricing,
  searchFlights, getFlightById, getSeatMap
};