export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                {/* Simple icon with color accent */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <svg
                            className="w-7 h-7 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title with colored underline */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                    Small Shop Inventory
                </h1>
                <div className="w-16 h-0.5 bg-blue-500 mx-auto mb-5"></div>

                {/* Description */}
                <p className="text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Track stock, manage sales, and stay organized — all in one
                    simple place.
                </p>

                {/* Feature chips with colored hover */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                        📦 Stock
                    </span>
                    <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                        💰 Sales
                    </span>
                    <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                        📊 Reports
                    </span>
                    <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                        🔮 Forecast
                    </span>
                </div>

                {/* Buttons with color */}
                <div className="flex gap-3 justify-center">
                    {auth.user ? (
                        <a
                            href="/dashboard"
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                        >
                            Go to Dashboard
                        </a>
                    ) : (
                        <a
                            href="/login"
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                        >
                            Login to Dashboard
                        </a>
                    )}
                </div>

                {/* Simple footer */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        Simple inventory management for small businesses
                    </p>
                </div>
            </div>
        </div>
    );
}
