import { useCustomer } from "../../contexts/CustomerContext";

export default function NotFound() {
  const { customer } = useCustomer();

  // Determine redirect path
  const redirectPath = customer ? "/user/dashboard" : "/dashboard";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-50">
      <div className="relative w-full max-w-5xl h-[90vh] rounded-2xl overflow-hidden shadow-lg bg-white flex flex-col">

        {/* Image Section */}
        <div className="relative flex-1 w-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/notfound2.jpg')`,
            }}
          ></div>
        </div>

        {/* Bottom Text */}
        <div className="w-full text-center py-6 z-20 bg-white">
          <a
            href={redirectPath}
            className="text-blue-600 font-semibold text-lg hover:underline"
          >
            Go back to your home page
          </a>
        </div>

      </div>
    </div>
  );
}
