import React from 'react';

export default function DashboardIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main Dashboard Card */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="ClarifyOps" className="h-6 w-auto" />
              <span className="text-white font-semibold">Claims Dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white text-sm">Live</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-xs text-gray-600">Claims Processed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">98.2%</div>
              <div className="text-xs text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.3s</div>
              <div className="text-xs text-gray-600">Avg. Processing</div>
            </div>
          </div>
          
          {/* Recent Claims */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Recent Claims</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-semibold">CMS</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Claim #CMS-2024-001</div>
                    <div className="text-xs text-gray-500">$1,247.50 • 2 min ago</div>
                  </div>
                </div>
                <div className="text-green-600 text-sm font-semibold">✓ Validated</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xs font-semibold">UB</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Claim #UB-2024-002</div>
                    <div className="text-xs text-gray-500">$892.30 • 5 min ago</div>
                  </div>
                </div>
                <div className="text-yellow-600 text-sm font-semibold">⚠ Review</div>
              </div>
            </div>
          </div>
          
          {/* AI Status */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">AI Extraction Active</span>
            </div>
            <span className="text-xs text-gray-500">Processing 3 claims...</span>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center opacity-80">
        <span className="text-blue-600 text-xs font-bold">AI</span>
      </div>
      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center opacity-80">
        <span className="text-green-600 text-xs font-bold">✓</span>
      </div>
    </div>
  );
}
