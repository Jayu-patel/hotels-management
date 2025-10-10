import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md text-center">
        <CheckCircle className="mx-auto text-green-600 w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your booking has been confirmed. Thank you for choosing us!
        </p>
        <Link href="/">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
