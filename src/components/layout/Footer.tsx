import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">صيدلية الشفاء الحديثة</h3>
            <p className="text-gray-300 leading-relaxed">
              نحن صيدليتك الموثوقة في مصر. نوفر لك أجود أنواع الأدوية بأسعار منافسة مع خدمة توصيل سريعة وآمنة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/medicines" className="text-gray-300 hover:text-primary transition-colors">
                  الأدوية
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="https://wa.me/213558166889" className="text-gray-300 hover:text-primary transition-colors">
                  +213558166889
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:hajaraldhaheri2016@gmail.com" className="text-gray-300 hover:text-primary transition-colors">
                  hajaraldhaheri2016@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-300">مصر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} صيدلية الشفاء الحديثة. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
