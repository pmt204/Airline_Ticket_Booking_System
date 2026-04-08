import { useEffect, useMemo, useState } from 'react'
import axiosClient from './api/axiosClient'
import './App.css'

const tabs = ['Dashboard', 'Đơn hàng', 'Mã giảm giá', 'FAQ', 'Liên hệ', 'Live Chat', 'Người dùng', 'Hãng bay', 'Sân bay', 'Chuyến bay']

const money = (v) => new Intl.NumberFormat('vi-VN').format(Number(v || 0))
const date = (v) => (v ? new Date(v).toLocaleString('vi-VN') : '-')
const shortId = (id) => id?.slice(-6) || '-'

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [data, setData] = useState({
    users: [],
    airlines: [],
    airports: [],
    flights: [],
    bookings: [],
    vouchers: [],
    faqs: [],
    contacts: [],
    chats: [],
  })
  const [forms, setForms] = useState({
    user: { fullName: '', email: '', role: 'user' },
    airline: { name: '', code: '', logoUrl: '' },
    airport: { code: '', name: '', city: '', country: '' },
    flight: { flightNumber: '', airlineCode: 'VN', departureAirportCode: 'HAN', arrivalAirportCode: 'SGN', departureTime: '2026-06-01T08:00', arrivalTime: '2026-06-01T10:00', basePrice: 1000000, seatCapacity: 180, status: 'Scheduled' },
    booking: { bookingCode: '', userEmail: 'user@flight.com', flightNumber: 'VN-213', totalAmount: 1200000, paymentStatus: 'Pending', bookingStatus: 'Confirmed' },
    voucher: { code: '', discountType: 'Percentage', discountValue: 10, minPurchaseValue: 0, validFrom: '2026-01-01', validUntil: '2026-12-31', usageLimit: 100 },
    faq: { question: '', answer: '' },
    contact: { fullName: '', email: '', subject: '', message: '' },
    chat: { senderRole: 'admin', senderName: 'Admin', content: '' },
    voucherCheck: { code: '', amount: 0 },
  })
  const [voucherResult, setVoucherResult] = useState(null)

  const loadData = async () => {
    setLoading(true)
    const endpoints = {
      users: '/api/admin/users',
      airlines: '/api/admin/airlines',
      airports: '/api/admin/airports',
      flights: '/api/admin/flights',
      bookings: '/api/admin/bookings',
      vouchers: '/api/admin/vouchers',
      faqs: '/api/admin/faqs',
      contacts: '/api/admin/contacts',
      chats: '/api/admin/chats',
    }

    const entries = Object.entries(endpoints)
    const results = await Promise.allSettled(entries.map(([, url]) => axiosClient.get(url)))

    setData((prev) => {
      const next = { ...prev }
      results.forEach((result, idx) => {
        const key = entries[idx][0]
        if (result.status === 'fulfilled') next[key] = result.value.data || []
      })
      return next
    })

    const failed = results
      .map((r, i) => (r.status === 'rejected' ? entries[i][0] : null))
      .filter(Boolean)
    if (failed.length > 0) {
      setMessage(`Một số module chưa tải được: ${failed.join(', ')}`)
    }
    setLoading(false)
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => ({
    users: data.users.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    airlines: data.airlines.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    airports: data.airports.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    flights: data.flights.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    bookings: data.bookings.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    vouchers: data.vouchers.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    faqs: data.faqs.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    contacts: data.contacts.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
    chats: data.chats.filter((obj) => JSON.stringify(obj).toLowerCase().includes(search.toLowerCase())),
  }), [search, data])

  const monthlyRevenue = useMemo(() => {
    const map = new Map()
    data.bookings.filter((b) => b.paymentStatus === 'Paid').forEach((b) => {
      const key = new Date(b.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
      map.set(key, (map.get(key) || 0) + Number(b.totalAmount || 0))
    })
    return [...map.entries()].map(([month, revenue]) => ({ month, revenue }))
  }, [data.bookings])

  const doPost = async (url, payload, msg) => {
    try {
      await axiosClient.post(url, payload)
      setMessage(msg)
      await loadData()
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Thao tác thất bại.')
    }
  }
  const doPut = async (url, payload, msg) => {
    try {
      await axiosClient.put(url, payload)
      setMessage(msg)
      await loadData()
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Thao tác thất bại.')
    }
  }
  const doDelete = async (url, msg) => {
    try {
      await axiosClient.delete(url)
      setMessage(msg)
      await loadData()
    } catch {
      setMessage('Xóa thất bại.')
    }
  }

  const dashboard = (
    <div className="panel">
      <div className="stats">
        <article className="card"><p>Tổng doanh thu (Paid)</p><h3>{money(data.bookings.filter((b) => b.paymentStatus === 'Paid').reduce((s, b) => s + Number(b.totalAmount || 0), 0))}đ</h3></article>
        <article className="card"><p>Tổng vé bán ra</p><h3>{data.bookings.length}</h3></article>
        <article className="card"><p>Người dùng mới</p><h3>{data.users.length}</h3></article>
        <article className="card"><p>Yêu cầu liên hệ mới</p><h3>{data.contacts.filter((c) => c.status === 'New').length}</h3></article>
      </div>
      <h3>Biểu đồ doanh thu theo tháng</h3>
      <div className="chart">
        {monthlyRevenue.length === 0 && <p className="hint">Chưa có dữ liệu doanh thu.</p>}
        {monthlyRevenue.map((x) => (
          <div className="barItem" key={x.month}>
            <div className="bar" style={{ height: `${Math.max(10, (x.revenue / Math.max(...monthlyRevenue.map((m) => m.revenue), 1)) * 160)}px` }} />
            <span>{x.month}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const vouchersTab = (
    <div className="panel">
      <h2>Quản lý Mã giảm giá</h2>
      <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/vouchers', forms.voucher, 'Thêm mã giảm giá thành công.'); }}>
        <input placeholder="Mã giảm giá" value={forms.voucher.code} onChange={(e) => setForms((f) => ({ ...f, voucher: { ...f.voucher, code: e.target.value.toUpperCase() } }))} />
        <select value={forms.voucher.discountType} onChange={(e) => setForms((f) => ({ ...f, voucher: { ...f.voucher, discountType: e.target.value } }))}><option>Percentage</option><option>Fixed</option></select>
        <input type="number" placeholder="Giá trị giảm" value={forms.voucher.discountValue} onChange={(e) => setForms((f) => ({ ...f, voucher: { ...f.voucher, discountValue: Number(e.target.value) } }))} />
        <input type="number" placeholder="Đơn tối thiểu" value={forms.voucher.minPurchaseValue} onChange={(e) => setForms((f) => ({ ...f, voucher: { ...f.voucher, minPurchaseValue: Number(e.target.value) } }))} />
        <input type="date" value={forms.voucher.validFrom} onChange={(e) => setForms((f) => ({ ...f, voucher: { ...f.voucher, validFrom: e.target.value } }))} />
        <input type="date" value={forms.voucher.validUntil} onChange={(e) => setForms((f) => ({ ...f, voucher: { ...f.voucher, validUntil: e.target.value } }))} />
        <input type="number" placeholder="Giới hạn dùng" value={forms.voucher.usageLimit} onChange={(e) => setForms((f) => ({ ...f, voucher: { ...f.voucher, usageLimit: Number(e.target.value) } }))} />
        <button>Thêm mã</button>
      </form>

      <form className="formGrid" onSubmit={async (e) => {
        e.preventDefault()
        try {
          const res = await axiosClient.post('/api/admin/vouchers/validate', forms.voucherCheck)
          setVoucherResult(res.data)
        } catch (err) {
          setVoucherResult({ valid: false, message: err?.response?.data?.message || 'Mã không hợp lệ.' })
        }
      }}>
        <input placeholder="Kiểm tra mã" value={forms.voucherCheck.code} onChange={(e) => setForms((f) => ({ ...f, voucherCheck: { ...f.voucherCheck, code: e.target.value } }))} />
        <input type="number" placeholder="Giá trị đơn hàng" value={forms.voucherCheck.amount} onChange={(e) => setForms((f) => ({ ...f, voucherCheck: { ...f.voucherCheck, amount: Number(e.target.value) } }))} />
        <button>Kiểm tra mã</button>
      </form>
      {voucherResult && <p className="hint">{voucherResult.valid ? `Hợp lệ - giảm ${money(voucherResult.discount)}đ, còn ${money(voucherResult.finalAmount)}đ` : voucherResult.message}</p>}

      <table><thead><tr><th>ID</th><th>Mã</th><th>Giảm</th><th>Hiệu lực</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        {filtered.vouchers.map((v) => <tr key={v._id}><td>{shortId(v._id)}</td><td>{v.code}</td><td>{v.discountType === 'Percentage' ? `${v.discountValue}%` : `${money(v.discountValue)}đ`}</td><td>{date(v.validFrom)} - {date(v.validUntil)}</td><td>{v.isActive ? 'Đang bật' : 'Đang tắt'}</td><td className="actions"><button type="button" onClick={() => doPut(`/api/admin/vouchers/${v._id}`, { isActive: !v.isActive }, 'Đã cập nhật voucher.')}>Bật/Tắt</button><button type="button" className="danger" onClick={() => doDelete(`/api/admin/vouchers/${v._id}`, 'Đã xóa voucher.')}>Xóa</button></td></tr>)}
      </tbody></table>
    </div>
  )

  const ordersTab = (
    <div className="panel">
      <h2>Quản lý Đơn hàng</h2>
      <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/bookings', { ...forms.booking, passengers: [] }, 'Thêm đơn hàng thành công.'); }}>
        <input placeholder="Mã đơn (PNR-...)" value={forms.booking.bookingCode} onChange={(e) => setForms((f) => ({ ...f, booking: { ...f.booking, bookingCode: e.target.value } }))} />
        <input placeholder="Email user" value={forms.booking.userEmail} onChange={(e) => setForms((f) => ({ ...f, booking: { ...f.booking, userEmail: e.target.value } }))} />
        <input placeholder="Mã chuyến bay" value={forms.booking.flightNumber} onChange={(e) => setForms((f) => ({ ...f, booking: { ...f.booking, flightNumber: e.target.value } }))} />
        <input type="number" placeholder="Tổng tiền" value={forms.booking.totalAmount} onChange={(e) => setForms((f) => ({ ...f, booking: { ...f.booking, totalAmount: Number(e.target.value) } }))} />
        <button>Thêm đơn</button>
      </form>
      <table><thead><tr><th>ID</th><th>Mã</th><th>User</th><th>Vé</th><th>Thanh toán</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        {filtered.bookings.map((b) => <tr key={b._id}><td>{shortId(b._id)}</td><td>{b.bookingCode}</td><td>{b.user?.email}</td><td>{money(b.totalAmount)}đ</td><td>{b.paymentStatus}</td><td>{b.bookingStatus}</td><td className="actions"><button type="button" onClick={() => doPut(`/api/admin/bookings/${b._id}`, { paymentStatus: 'Paid' }, 'Đã cập nhật thanh toán.')}>Đã thanh toán</button><button type="button" onClick={() => doPut(`/api/admin/bookings/${b._id}`, { paymentStatus: 'Refunded', bookingStatus: 'Cancelled' }, 'Đã duyệt hoàn tiền.')}>Duyệt hoàn tiền</button><button type="button" className="danger" onClick={() => doDelete(`/api/admin/bookings/${b._id}`, 'Đã xóa đơn hàng.')}>Xóa</button></td></tr>)}
      </tbody></table>
    </div>
  )

  const faqTab = (
    <div className="panel">
      <h2>Quản lý Trung tâm trợ giúp (FAQ)</h2>
      <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/faqs', forms.faq, 'Thêm FAQ thành công.'); }}>
        <input placeholder="Câu hỏi" value={forms.faq.question} onChange={(e) => setForms((f) => ({ ...f, faq: { ...f.faq, question: e.target.value } }))} />
        <input placeholder="Câu trả lời" value={forms.faq.answer} onChange={(e) => setForms((f) => ({ ...f, faq: { ...f.faq, answer: e.target.value } }))} />
        <button>Thêm FAQ</button>
      </form>
      <table><thead><tr><th>ID</th><th>Câu hỏi</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        {filtered.faqs.map((x) => <tr key={x._id}><td>{shortId(x._id)}</td><td><b>{x.question}</b><br />{x.answer}</td><td>{x.isPublished ? 'Đang hiển thị' : 'Đã ẩn'}</td><td className="actions"><button type="button" onClick={() => doPut(`/api/admin/faqs/${x._id}`, { isPublished: !x.isPublished }, 'Đã cập nhật FAQ.')}>Ẩn/Hiện</button><button type="button" className="danger" onClick={() => doDelete(`/api/admin/faqs/${x._id}`, 'Đã xóa FAQ.')}>Xóa</button></td></tr>)}
      </tbody></table>
    </div>
  )

  const contactTab = (
    <div className="panel">
      <h2>Form Liên hệ & Phản hồi</h2>
      <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/contacts', forms.contact, 'Đã tạo phản hồi mới.'); }}>
        <input placeholder="Họ tên" value={forms.contact.fullName} onChange={(e) => setForms((f) => ({ ...f, contact: { ...f.contact, fullName: e.target.value } }))} />
        <input placeholder="Email" value={forms.contact.email} onChange={(e) => setForms((f) => ({ ...f, contact: { ...f.contact, email: e.target.value } }))} />
        <input placeholder="Tiêu đề" value={forms.contact.subject} onChange={(e) => setForms((f) => ({ ...f, contact: { ...f.contact, subject: e.target.value } }))} />
        <input placeholder="Nội dung" value={forms.contact.message} onChange={(e) => setForms((f) => ({ ...f, contact: { ...f.contact, message: e.target.value } }))} />
        <button>Tạo liên hệ</button>
      </form>
      <table><thead><tr><th>ID</th><th>Người gửi</th><th>Nội dung</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        {filtered.contacts.map((c) => <tr key={c._id}><td>{shortId(c._id)}</td><td>{c.fullName}<br />{c.email}</td><td><b>{c.subject}</b><br />{c.message}</td><td>{c.status}</td><td className="actions"><button type="button" onClick={() => doPut(`/api/admin/contacts/${c._id}`, { status: 'Resolved' }, 'Đã xử lý liên hệ.')}>Đánh dấu xong</button><button type="button" className="danger" onClick={() => doDelete(`/api/admin/contacts/${c._id}`, 'Đã xóa liên hệ.')}>Xóa</button></td></tr>)}
      </tbody></table>
    </div>
  )

  const chatTab = (
    <div className="panel">
      <h2>Hỗ trợ trực tuyến (Live Chat)</h2>
      <form className="formGrid" onSubmit={(e) => { e.preventDefault(); if (forms.chat.content) doPost('/api/admin/chats', forms.chat, 'Đã gửi tin nhắn.'); }}>
        <select value={forms.chat.senderRole} onChange={(e) => setForms((f) => ({ ...f, chat: { ...f.chat, senderRole: e.target.value } }))}><option value="admin">admin</option><option value="user">user</option></select>
        <input placeholder="Tên người gửi" value={forms.chat.senderName} onChange={(e) => setForms((f) => ({ ...f, chat: { ...f.chat, senderName: e.target.value } }))} />
        <input placeholder="Nội dung chat" value={forms.chat.content} onChange={(e) => setForms((f) => ({ ...f, chat: { ...f.chat, content: e.target.value } }))} />
        <button>Gửi</button>
      </form>
      <div className="chatBox">
        {filtered.chats.map((m) => <div className={`chatItem ${m.senderRole === 'admin' ? 'chatAdmin' : 'chatUser'}`} key={m._id}><b>{m.senderName}</b>: {m.content} <small>{date(m.createdAt)}</small></div>)}
      </div>
    </div>
  )

  const simpleCrudTab = (title, key, columns, addForm, rows) => <div className="panel"><h2>{title}</h2>{addForm}<table><thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{rows}</tbody></table></div>

  return (
    <main className="adminLayout">
      <aside className="sidebar">
        <h1>Quản trị hệ thống</h1>
        <p>Airline Ticket Booking</p>
        {tabs.map((tab) => <button className={tab === activeTab ? 'tab active' : 'tab'} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      </aside>
      <section className="content">
        <header className="topbar">
          <h2>{activeTab}</h2>
          <div className="topbarRight">{loading && <span>Đang đồng bộ...</span>}{message && <span>{message}</span>}</div>
          {activeTab !== 'Dashboard' && <input placeholder="Tìm nhanh..." value={search} onChange={(e) => setSearch(e.target.value)} />}
        </header>

        {activeTab === 'Dashboard' && dashboard}
        {activeTab === 'Đơn hàng' && ordersTab}
        {activeTab === 'Mã giảm giá' && vouchersTab}
        {activeTab === 'FAQ' && faqTab}
        {activeTab === 'Liên hệ' && contactTab}
        {activeTab === 'Live Chat' && chatTab}

        {activeTab === 'Người dùng' && simpleCrudTab(
          'Quản lý Người dùng',
          'users',
          ['ID', 'Họ tên', 'Email', 'Vai trò', 'Trạng thái', ''],
          <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/users', forms.user, 'Thêm người dùng thành công.'); }}>
            <input placeholder="Họ tên" value={forms.user.fullName} onChange={(e) => setForms((f) => ({ ...f, user: { ...f.user, fullName: e.target.value } }))} />
            <input placeholder="Email" value={forms.user.email} onChange={(e) => setForms((f) => ({ ...f, user: { ...f.user, email: e.target.value } }))} />
            <select value={forms.user.role} onChange={(e) => setForms((f) => ({ ...f, user: { ...f.user, role: e.target.value } }))}><option>user</option><option>admin</option></select>
            <button>Thêm</button>
          </form>,
          filtered.users.map((u) => <tr key={u._id}><td>{shortId(u._id)}</td><td>{u.fullName}</td><td>{u.email}</td><td>{u.role}</td><td>{u.isActive ? 'Đang hoạt động' : 'Đang khóa'}</td><td className="actions"><button type="button" onClick={() => doPut(`/api/admin/users/${u._id}`, { isActive: !u.isActive }, 'Đã cập nhật user.')}>Khóa/Mở</button><button type="button" className="danger" onClick={() => doDelete(`/api/admin/users/${u._id}`, 'Đã xóa user.')}>Xóa</button></td></tr>),
        )}

        {activeTab === 'Hãng bay' && simpleCrudTab(
          'Quản lý Hãng bay',
          'airlines',
          ['ID', 'Tên', 'Mã', 'Trạng thái', ''],
          <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/airlines', forms.airline, 'Thêm hãng bay thành công.'); }}>
            <input placeholder="Tên hãng" value={forms.airline.name} onChange={(e) => setForms((f) => ({ ...f, airline: { ...f.airline, name: e.target.value } }))} />
            <input placeholder="Mã" value={forms.airline.code} onChange={(e) => setForms((f) => ({ ...f, airline: { ...f.airline, code: e.target.value.toUpperCase() } }))} />
            <input placeholder="Logo URL" value={forms.airline.logoUrl} onChange={(e) => setForms((f) => ({ ...f, airline: { ...f.airline, logoUrl: e.target.value } }))} />
            <button>Thêm</button>
          </form>,
          filtered.airlines.map((a) => <tr key={a._id}><td>{shortId(a._id)}</td><td>{a.name}</td><td>{a.code}</td><td>{a.isActive ? 'Đang bật' : 'Đang tắt'}</td><td className="actions"><button type="button" onClick={() => doPut(`/api/admin/airlines/${a._id}`, { isActive: !a.isActive }, 'Đã cập nhật hãng bay.')}>Bật/Tắt</button><button type="button" className="danger" onClick={() => doDelete(`/api/admin/airlines/${a._id}`, 'Đã xóa hãng bay.')}>Xóa</button></td></tr>),
        )}

        {activeTab === 'Sân bay' && simpleCrudTab(
          'Quản lý Sân bay',
          'airports',
          ['ID', 'Mã', 'Tên', 'Thành phố', 'Quốc gia', ''],
          <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/airports', forms.airport, 'Thêm sân bay thành công.'); }}>
            <input placeholder="Mã sân bay" value={forms.airport.code} onChange={(e) => setForms((f) => ({ ...f, airport: { ...f.airport, code: e.target.value.toUpperCase() } }))} />
            <input placeholder="Tên sân bay" value={forms.airport.name} onChange={(e) => setForms((f) => ({ ...f, airport: { ...f.airport, name: e.target.value } }))} />
            <input placeholder="Thành phố" value={forms.airport.city} onChange={(e) => setForms((f) => ({ ...f, airport: { ...f.airport, city: e.target.value } }))} />
            <input placeholder="Quốc gia" value={forms.airport.country} onChange={(e) => setForms((f) => ({ ...f, airport: { ...f.airport, country: e.target.value } }))} />
            <button>Thêm</button>
          </form>,
          filtered.airports.map((a) => <tr key={a._id}><td>{shortId(a._id)}</td><td>{a.code}</td><td>{a.name}</td><td>{a.city}</td><td>{a.country}</td><td className="actions"><button type="button" className="danger" onClick={() => doDelete(`/api/admin/airports/${a._id}`, 'Đã xóa sân bay.')}>Xóa</button></td></tr>),
        )}

        {activeTab === 'Chuyến bay' && simpleCrudTab(
          'Quản lý Chuyến bay',
          'flights',
          ['ID', 'Số hiệu', 'Tuyến', 'Giá', 'Trạng thái', ''],
          <form className="formGrid" onSubmit={(e) => { e.preventDefault(); doPost('/api/admin/flights', forms.flight, 'Thêm chuyến bay thành công.'); }}>
            <input placeholder="Số hiệu" value={forms.flight.flightNumber} onChange={(e) => setForms((f) => ({ ...f, flight: { ...f.flight, flightNumber: e.target.value } }))} />
            <input placeholder="Mã hãng" value={forms.flight.airlineCode} onChange={(e) => setForms((f) => ({ ...f, flight: { ...f.flight, airlineCode: e.target.value.toUpperCase() } }))} />
            <input placeholder="Sân bay đi" value={forms.flight.departureAirportCode} onChange={(e) => setForms((f) => ({ ...f, flight: { ...f.flight, departureAirportCode: e.target.value.toUpperCase() } }))} />
            <input placeholder="Sân bay đến" value={forms.flight.arrivalAirportCode} onChange={(e) => setForms((f) => ({ ...f, flight: { ...f.flight, arrivalAirportCode: e.target.value.toUpperCase() } }))} />
            <input type="datetime-local" value={forms.flight.departureTime} onChange={(e) => setForms((f) => ({ ...f, flight: { ...f.flight, departureTime: e.target.value } }))} />
            <input type="datetime-local" value={forms.flight.arrivalTime} onChange={(e) => setForms((f) => ({ ...f, flight: { ...f.flight, arrivalTime: e.target.value } }))} />
            <input type="number" placeholder="Giá cơ bản" value={forms.flight.basePrice} onChange={(e) => setForms((f) => ({ ...f, flight: { ...f.flight, basePrice: Number(e.target.value) } }))} />
            <button>Thêm</button>
          </form>,
          filtered.flights.map((f) => <tr key={f._id}><td>{shortId(f._id)}</td><td>{f.flightNumber}</td><td>{f.departureAirport?.code} - {f.arrivalAirport?.code}</td><td>{money(f.basePrice)}đ</td><td>{f.status}</td><td className="actions"><button type="button" onClick={() => doPut(`/api/admin/flights/${f._id}`, { status: f.status === 'Scheduled' ? 'Delayed' : 'Scheduled' }, 'Đã cập nhật chuyến bay.')}>Đổi trạng thái</button><button type="button" className="danger" onClick={() => doDelete(`/api/admin/flights/${f._id}`, 'Đã xóa chuyến bay.')}>Xóa</button></td></tr>),
        )}
      </section>
    </main>
  )
}

export default App
