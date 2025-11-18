// import React from 'react'

// export default function topDestination() {
//     return (
//         <div>Top Destination</div>
//     )
// }

"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Globe,
  MapPinned,
  X,
  Search,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminTopDestinationsPage() {
  const cities = [
    { id: "city_1", name: "Bali" },
    { id: "city_2", name: "Goa" },
    { id: "city_3", name: "Dubai" },
  ];

  const countries = [
    { id: "country_1", name: "Japan" },
    { id: "country_2", name: "Thailand" },
    { id: "country_3", name: "France" },
  ];

  const [type, setType] = useState<"city" | "country">("city");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [topDestinations, setTopDestinations] = useState<any[]>([]);

  const list = type === "city" ? cities : countries;
  const filteredList = list.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!selectedId || !imageFile) return;

    const item = list.find((x) => x.id === selectedId);

    setTopDestinations((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        ref_id: selectedId,
        name: item?.name,
        image_file: imageFile,
        preview: URL.createObjectURL(imageFile),
      },
    ]);

    setSelectedId("");
    setImageFile(null);
    setSearch("");
    setShowModal(false);
};

const onClose=()=>{
    setImageFile(null)
    setShowModal(false);
  }

  const handleRemove = (id: string) => {
    setTopDestinations((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Destinations</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Select cities or countries to feature on your homepage.
        </p>
      </div>

      {/* Button to open modal */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 shadow-sm text-sm"
      >
        <Plus size={18} />
        Add Destination
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 h-screen"
          onClick={() => setShowModal(false)} // CLOSE ON OUTSIDE
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 space-y-6
            w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // PREVENT CLOSE ON INSIDE
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Destination</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
            </div>

            {/* Type Switch */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">
                Destination Type
              </label>

              <div className="flex gap-4">
                <button
                  onClick={() => setType("city")}
                  className={`px-4 py-2 rounded-lg border ${
                    type === "city"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  City
                </button>

                <button
                  onClick={() => setType("country")}
                  className={`px-4 py-2 rounded-lg border ${
                    type === "country"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  Country
                </button>
              </div>
            </div>

            {/* Searchable Input */}
            <div className="space-y-2">
              <label className="block font-semibold text-gray-700">
                {type === "city" ? "Select City" : "Select Country"}
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  className="border rounded-lg w-full p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="max-h-36 overflow-auto border rounded-lg">
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`px-4 py-2 cursor-pointer text-sm ${
                      selectedId === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
                <label className="block font-semibold mb-2 text-gray-700">
                    Banner Image
                </label>

                <label className="w-full border border-dashed rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition relative">
                    
                    {!imageFile && (
                    <>
                        <ImageIcon size={30} />
                        <span className="mt-2 text-sm">Click to upload image</span>
                    </>
                    )}

                    {imageFile && (
                    <img
                        src={URL.createObjectURL(imageFile)}
                        alt="preview"
                        className="h-50 object-cover rounded-lg"
                    />
                    )}

                    <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                        setImageFile(e.target.files[0]);
                        }
                    }}
                    />
                </label>
            </div>

            {/* Add Button */}
            <div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus size={18} />
                Add Destination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Preview</h2>

        {topDestinations.length === 0 && (
          <p className="text-gray-500 text-sm">No destinations added yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {topDestinations.map((d) => (
            <div
              key={d.id}
              className="relative border rounded-xl shadow-sm overflow-hidden group"
            >
              <img
                src={d.preview}
                alt={d.name}
                className="h-40 w-full object-cover"
              />

              <div className="absolute bottom-3 left-3">
                <p className="text-white text-lg font-semibold drop-shadow-lg">
                  {d.name}
                </p>
              </div>

              <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-gray-700 border">
                {d.type === "city" ? (
                  <MapPinned size={13} />
                ) : (
                  <Globe size={13} />
                )}
                {d.type}
              </div>

              <button
                onClick={() => handleRemove(d.id)}
                className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-md opacity-90 hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
