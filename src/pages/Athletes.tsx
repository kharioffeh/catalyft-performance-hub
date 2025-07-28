import React from 'react';
import { Users, Plus, Search, Filter } from 'lucide-react';

const Athletes = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-indigo-500" />
          <h1 className="text-3xl font-bold text-gray-100">Athletes</h1>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus size={20} />
          <span>Add Athlete</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search athletes..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 transition-colors">
          <Filter size={20} />
          <span>Filter</span>
        </button>
      </div>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder athlete cards */}
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div key={id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                A{id}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Athlete {id}</h3>
                <p className="text-gray-400">athlete{id}@example.com</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Training Plan</span>
                <span className="text-gray-200">Strength Program</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Active</span>
                <span className="text-gray-200">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Progress</span>
                <span className="text-green-400">On Track</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-3 rounded text-sm transition-colors">
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state (you can show this when there are no athletes) */}
      <div className="hidden text-center py-12">
        <Users className="mx-auto h-16 w-16 text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No athletes yet</h3>
        <p className="text-gray-500 mb-6">Start by adding your first athlete to begin tracking their progress.</p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors">
          Add Your First Athlete
        </button>
      </div>
    </div>
  );
};

export default Athletes;