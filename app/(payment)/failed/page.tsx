import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailed() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md text-center">
        <XCircle className="mx-auto text-red-600 w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Something went wrong with your payment. Please try again.
        </p>
        <Link href="/">
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
