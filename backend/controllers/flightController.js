const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const Airline = require('../models/Airline');

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

const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find({})
      .populate('airline', 'name code')
      .populate('departureAirport', 'name code city')
      .populate('arrivalAirport', 'name code city')
      .sort({ createdAt: -1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách chuyến bay' });
  }
};

const createFlight = async (req, res) => {
  try {
    const flightData = { ...req.body, availableSeats: req.body.seatCapacity }; 
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

const searchFlights = async (req, res) => {
  try {
    const { dep, arr, date, minPrice, maxPrice, airline, sort } = req.query;
    let query = { status: 'Scheduled' }; 
    if (dep) query.departureAirport = dep;
    if (arr) query.arrivalAirport = arr;

    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(searchDate.getDate() + 1);
      query.departureTime = { $gte: searchDate, $lt: nextDate };
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    if (airline) query.airline = airline;

    let sortObj = { departureTime: 1 }; 
    if (sort === 'price_asc') sortObj = { basePrice: 1 };
    if (sort === 'price_desc') sortObj = { basePrice: -1 };
    if (sort === 'time_desc') sortObj = { departureTime: -1 };

    const flights = await Flight.find(query)
      .populate('airline', 'name code logoUrl')
      .populate('departureAirport', 'name code city')
      .populate('arrivalAirport', 'name code city')
      .sort(sortObj);

    res.json(flights);
  } catch (error) { res.status(500).json({ message: 'Lỗi tìm kiếm chuyến bay', error: error.message }); }
};

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


const getSeatMap = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id).select('seatCapacity bookedSeats');
    if (!flight) return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });

    res.json({
      seatCapacity: flight.seatCapacity,
      bookedSeats: flight.bookedSeats,
      availableSeats: flight.seatCapacity - flight.bookedSeats.length
    });
  } catch (error) { res.status(500).json({ message: 'Lỗi lấy sơ đồ ghế' }); }
};


const toggleAirlineStatus = async (req, res) => {
  try {
    const airline = await Airline.findById(req.params.id);
    if (!airline) return res.status(404).json({ message: 'Không tìm thấy hãng bay' });
    
    airline.isActive = !airline.isActive; 
    await airline.save();
    res.json({ message: `Đã ${airline.isActive ? 'mở khóa' : 'khóa'} hãng bay thành công!`, airline });
  } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật trạng thái hãng bay' }); }
};

const toggleAirportStatus = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) return res.status(404).json({ message: 'Không tìm thấy sân bay' });
    
    airport.isActive = !airport.isActive;
    await airport.save();
    res.json({ message: `Đã ${airport.isActive ? 'mở khóa' : 'khóa'} sân bay thành công!`, airport });
  } catch (error) { res.status(500).json({ message: 'Lỗi cập nhật trạng thái sân bay' }); }
};

const updateFlightPrice = async (req, res) => {
  try {
    const { basePrice, businessMultiplier, premiumMultiplier } = req.body;
    
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Không tìm thấy chuyến bay' });

    flight.basePrice = basePrice;
    flight.classMultipliers = {
      business: businessMultiplier,
      premium: premiumMultiplier,
      economy: 1.0
    };

    await flight.save();
    res.json({ message: 'Cập nhật giá và hạng vé thành công!', flight });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật giá vé.' });
  }
};

module.exports = {
  getAirports, 
  createAirport,
  getAirlines, 
  createAirline,
  getAllFlights, 
  createFlight, 
  deleteFlight, 
  updateFlightPricing,
  searchFlights, 
  getFlightById, 
  getSeatMap,
  toggleAirlineStatus,
  toggleAirportStatus,
  updateFlightPrice
};