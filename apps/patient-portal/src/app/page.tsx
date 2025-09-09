import Link from 'next/link'
import { 
  HeartIcon, 
  DevicePhoneMobileIcon, 
  CameraIcon, 
  MicrophoneIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header with Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="dropdown" size="md" />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-primary-100 rounded-full">
                <HeartIcon className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            
            {/* Multilingual Hero Text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl text-balance">
                <span className="block">Modern <span className="text-primary-600">Physiotherapy</span> EMR</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-gray-700">
                  Hệ thống <span className="text-secondary-600">Vật lý trị liệu</span> hiện đại
                </span>
              </h1>
              
              <div className="space-y-2">
                <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                  Mobile-first Electronic Medical Records designed specifically for physiotherapy practices. 
                  Capture notes, photos, and voice memos seamlessly on any device.
                </p>
                <p className="text-lg text-gray-500 max-w-3xl mx-auto text-balance">
                  Hệ thống hồ sơ y tế điện tử tối ưu cho thiết bị di động, được thiết kế riêng cho các phòng khám vật lý trị liệu. 
                  Ghi chú, chụp ảnh và ghi âm một cách liền mạch trên mọi thiết bị.
                </p>
              </div>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login" className="btn-primary text-lg px-8 py-4">
                <span className="block">Get Started</span>
                <span className="block text-sm opacity-90">Bắt đầu</span>
              </Link>
              <Link href="/demo" className="btn-outline text-lg px-8 py-4">
                <span className="block">View Demo</span>
                <span className="block text-sm opacity-90">Xem demo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl text-balance">
              <span className="block">Built for Mobile-First Physiotherapy</span>
              <span className="block text-2xl text-gray-600 mt-2">Được xây dựng cho Vật lý trị liệu trên di động</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 text-balance">
              Everything you need to provide excellent patient care, optimized for mobile devices
            </p>
            <p className="mt-2 text-lg text-gray-500 text-balance">
              Mọi thứ bạn cần để chăm sóc bệnh nhân xuất sắc, được tối ưu hóa cho thiết bị di động
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mobile Optimized */}
            <div className="card-mobile text-center group hover:shadow-float transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="block">Mobile-First Design</span>
                <span className="block text-lg text-gray-600">Thiết kế tối ưu di động</span>
              </h3>
              <p className="text-gray-600 mb-2">
                Optimized for smartphones and tablets. Take notes, capture data, and manage patients 
                on-the-go with touch-friendly interfaces.
              </p>
              <p className="text-sm text-gray-500">
                Tối ưu hóa cho điện thoại thông minh và máy tính bảng. Ghi chú, thu thập dữ liệu và quản lý bệnh nhân 
                di động với giao diện thân thiện với cảm ứng.
              </p>
            </div>

            {/* Camera Integration */}
            <div className="card-mobile text-center group hover:shadow-float transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary-100 rounded-xl group-hover:bg-secondary-200 transition-colors">
                  <CameraIcon className="h-8 w-8 text-secondary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="block">Camera Capture</span>
                <span className="block text-lg text-gray-600">Chụp ảnh</span>
              </h3>
              <p className="text-gray-600 mb-2">
                Instantly capture patient progress photos, posture assessments, and exercise 
                demonstrations directly from your device's camera.
              </p>
              <p className="text-sm text-gray-500">
                Chụp ngay lập tức ảnh tiến triển của bệnh nhân, đánh giá tư thế và minh họa bài tập 
                trực tiếp từ camera thiết bị của bạn.
              </p>
            </div>

            {/* Voice Recording */}
            <div className="card-mobile text-center group hover:shadow-float transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors">
                  <MicrophoneIcon className="h-8 w-8 text-accent-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="block">Voice Recording</span>
                <span className="block text-lg text-gray-600">Ghi âm</span>
              </h3>
              <p className="text-gray-600 mb-2">
                Record voice memos during treatment sessions. Perfect for quick notes while 
                your hands are busy with patient care.
              </p>
              <p className="text-sm text-gray-500">
                Ghi chú bằng giọng nói trong các buổi điều trị. Hoàn hảo cho việc ghi chú nhanh khi 
                tay bạn đang bận rộn với việc chăm sóc bệnh nhân.
              </p>
            </div>

            {/* Progress Tracking */}
            <div className="card-mobile text-center group hover:shadow-float transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                  <ChartBarIcon className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="block">Progress Tracking</span>
                <span className="block text-lg text-gray-600">Theo dõi tiến triển</span>
              </h3>
              <p className="text-gray-600 mb-2">
                Visual progress charts, ROM measurements, pain scales, and functional assessments 
                all in one place.
              </p>
              <p className="text-sm text-gray-500">
                Biểu đồ tiến triển trực quan, đo biên độ chuyển động, thang đánh giá đau và đánh giá chức năng 
                tất cả trong một nơi.
              </p>
            </div>

            {/* Appointment Management */}
            <div className="card-mobile text-center group hover:shadow-float transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary-100 rounded-xl group-hover:bg-secondary-200 transition-colors">
                  <CalendarIcon className="h-8 w-8 text-secondary-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="block">Smart Scheduling</span>
                <span className="block text-lg text-gray-600">Lập lịch thông minh</span>
              </h3>
              <p className="text-gray-600 mb-2">
                Intuitive appointment scheduling with mobile notifications, patient reminders, 
                and calendar synchronization.
              </p>
              <p className="text-sm text-gray-500">
                Lập lịch hẹn trực quan với thông báo di động, nhắc nhở bệnh nhân 
                và đồng bộ hóa lịch.
              </p>
            </div>

            {/* Documentation */}
            <div className="card-mobile text-center group hover:shadow-float transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-accent-100 rounded-xl group-hover:bg-accent-200 transition-colors">
                  <DocumentTextIcon className="h-8 w-8 text-accent-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <span className="block">SOAP Documentation</span>
                <span className="block text-lg text-gray-600">Tài liệu SOAP</span>
              </h3>
              <p className="text-gray-600 mb-2">
                Streamlined SOAP note templates designed for physiotherapy with quick input 
                methods and voice-to-text support.
              </p>
              <p className="text-sm text-gray-500">
                Mẫu ghi chú SOAP được sắp xếp hợp lý được thiết kế cho vật lý trị liệu với phương pháp nhập nhanh 
                và hỗ trợ chuyển giọng nói thành văn bản.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vietnamese Cultural Features Section */}
      <div className="py-16 bg-gradient-to-r from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span className="block">Vietnamese Healthcare Integration</span>
              <span className="block text-2xl text-gray-600">Tích hợp y tế Việt Nam</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-card">
              <div className="text-2xl mb-3">🇻🇳</div>
              <h3 className="font-semibold text-gray-900 mb-2">Vietnamese Language Support</h3>
              <p className="text-sm text-gray-600 mb-2">Full Vietnamese interface with medical terminology</p>
              <p className="text-sm text-gray-500">Giao diện tiếng Việt đầy đủ với thuật ngữ y khoa</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
              <div className="text-2xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">VND Currency & Pricing</h3>
              <p className="text-sm text-gray-600 mb-2">Vietnamese Dong currency formatting and local pricing</p>
              <p className="text-sm text-gray-500">Định dạng tiền tệ VND và giá cả địa phương</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
              <div className="text-2xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Vietnamese Date Format</h3>
              <p className="text-sm text-gray-600 mb-2">DD/MM/YYYY format and Vietnamese calendar</p>
              <p className="text-sm text-gray-500">Định dạng ngày DD/MM/YYYY và lịch Việt Nam</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Vietnamese Phone Numbers</h3>
              <p className="text-sm text-gray-600 mb-2">Local phone number formats and validation</p>
              <p className="text-sm text-gray-500">Định dạng và xác thực số điện thoại địa phương</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
              <div className="text-2xl mb-3">🏥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Vietnamese Healthcare System</h3>
              <p className="text-sm text-gray-600 mb-2">Integration with local insurance and regulations</p>
              <p className="text-sm text-gray-500">Tích hợp với bảo hiểm và quy định địa phương</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-card">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Vietnamese Name Format</h3>
              <p className="text-sm text-gray-600 mb-2">Proper Vietnamese name handling (Họ - Tên đệm - Tên)</p>
              <p className="text-sm text-gray-500">Xử lý tên tiếng Việt đúng cách (Họ - Tên đệm - Tên)</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            <span className="block">Ready to Modernize Your Practice?</span>
            <span className="block text-2xl opacity-90 mt-1">Sẵn sàng hiện đại hóa phòng khám của bạn?</span>
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join forward-thinking physiotherapy practices using mobile-first EMR technology.
          </p>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            Tham gia các phòng khám vật lý trị liệu tiến bộ sử dụng công nghệ EMR tối ưu di động.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4">
              <span className="block">Start Free Trial</span>
              <span className="block text-sm opacity-80">Bắt đầu dùng thử miễn phí</span>
            </Link>
            <Link href="/contact" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4">
              <span className="block">Contact Sales</span>
              <span className="block text-sm opacity-80">Liên hệ bán hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <HeartIcon className="h-6 w-6 mr-2" />
                Modern Physio EMR
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                Mobile-first EMR designed specifically for modern physiotherapy practices.
              </p>
              <p className="text-gray-400 text-xs">
                EMR tối ưu di động được thiết kế riêng cho các phòng khám vật lý trị liệu hiện đại.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                <span className="block">Product</span>
                <span className="block text-sm text-gray-400">Sản phẩm</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/features" className="hover:text-white">Features / Tính năng</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing / Giá cả</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link href="/mobile" className="hover:text-white">Mobile App / Ứng dụng di động</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                <span className="block">Company</span>
                <span className="block text-sm text-gray-400">Công ty</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/about" className="hover:text-white">About / Về chúng tôi</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact / Liên hệ</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers / Tuyển dụng</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                <span className="block">Support</span>
                <span className="block text-sm text-gray-400">Hỗ trợ</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/help" className="hover:text-white">Help Center / Trung tâm trợ giúp</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation / Tài liệu</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy / Quyền riêng tư</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms / Điều khoản</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Modern Physio EMR. All rights reserved. / Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}