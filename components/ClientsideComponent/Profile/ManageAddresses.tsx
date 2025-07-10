"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks/hooks";
import { apiCore } from "@/api/ApiCore";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";
import { Address, AddressApiResponse } from "@/types/address";

// Reusable list of fields for form rendering
const ADDRESS_FIELDS: (keyof Address | "type")[] = [
  "fullName",
  "phone",
  "pincode",
  "state",
  "city",
  "addressLine",
  "landmark",
  "type",
];

export default function ManageAddresses() {
  const token = useAppSelector((state) => state.auth.token);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await apiCore(
        "/address",
        "GET",
        undefined,
        token || undefined
      );
      const data = res as AddressApiResponse;

      if (Array.isArray(data.address)) {
        setAddresses(data.address);
      } else {
        toast.error("Invalid address response");
      }
    } catch {
      toast.error("Failed to fetch addresses");
    }
  }, [token]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleEdit = (addr: Address) => {
    setEditId(addr.id ?? null);
    setFormData({ ...addr } as unknown as Record<string, string>);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      await apiCore(
        `/address/${editId}`,
        "PATCH",
        formData,
        token || undefined
      );
      toast.success("Address updated");
      setEditId(null);
      fetchAddresses();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiCore(`/address/${id}`, "DELETE", undefined, token || undefined);
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddAddress = async () => {
    try {
      await apiCore("/address", "POST", formData, token || undefined);
      toast.success("Address added");
      setFormData({});
      setShowAddForm(false);
      fetchAddresses();
    } catch {
      toast.error("Failed to add address");
    }
  };

  return (
    <div className="p-4 text-[#213E5A]">
      {" "}
      {/* Applied to the main container */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#213E5A]">Manage Addresses</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditId(null);
            setFormData({});
          }}
          className="flex items-center gap-1 text-white px-4 py-1 rounded cursor-pointer"
          style={{ backgroundColor: "#203b67" }} // Applied color
        >
          <Plus size={16} /> {showAddForm ? "Cancel" : "Add New Address"}
        </button>
      </div>
      {showAddForm && (
        <div className="border p-4 rounded shadow-sm mb-6 bg-white max-w-2xl">
          <h3 className="text-lg font-semibold mb-3 text-[#213E5A]">
            New Address
          </h3>
          {ADDRESS_FIELDS.map((field) => (
            <div key={field} className="mb-2">
              <label className="block text-sm capitalize mb-1 text-[#213E5A]">
                {field}
              </label>
              {field === "type" ? (
                <select
                  value={formData.type || "SHIPPING"}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="border w-full px-2 py-1 rounded text-[#213E5A]"
                >
                  <option value="SHIPPING">Shipping</option>
                  <option value="BILLING">Billing</option>
                  <option value="BOTH">Both</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={formData[field] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="border w-full px-2 py-1 rounded text-[#213E5A]"
                />
              )}
            </div>
          ))}
          <button
            onClick={handleAddAddress}
            className="mt-3 text-white px-4 py-1 rounded cursor-pointer"
            style={{ backgroundColor: "#203b67" }} // Applied color
          >
            Save Address
          </button>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="self-start">
            <div className="border p-4 rounded shadow-sm bg-white flex flex-col justify-between h-full relative">
              <span
                className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  addr.type === "SHIPPING"
                    ? "bg-blue-100 text-blue-700"
                    : addr.type === "BILLING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {addr.type}
              </span>

              {editId === addr.id ? (
                <>
                  <h3 className="text-lg font-semibold mb-3 text-[#213E5A]">
                    Edit Address
                  </h3>
                  {ADDRESS_FIELDS.filter((f) => f !== "type").map((field) => (
                    <div key={field} className="mb-2">
                      <label className="block text-sm capitalize mb-1 text-[#213E5A]">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={formData[field] || ""}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                        className="border w-full px-2 py-1 rounded text-[#213E5A]"
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleUpdate}
                      className="flex items-center gap-1 text-white px-3 py-1 rounded cursor-pointer"
                      style={{ backgroundColor: "#203b67" }} // Applied color
                    >
                      <Save size={16} /> Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="flex items-center gap-1 bg-gray-300 text-black px-3 py-1 rounded cursor-pointer" // Cancel button unchanged, added cursor
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-base font-medium text-[#213E5A]">
                      {addr.fullName}
                    </p>
                    <p className="text-sm text-[#213E5A]">{addr.phone}</p>
                    <p className="text-sm text-[#213E5A]">
                      {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                      {addr.pincode}
                    </p>
                    {addr.landmark && (
                      <p className="text-sm text-[#213E5A]">
                        Landmark: {addr.landmark}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="flex items-center gap-1 text-white px-3 py-1 rounded cursor-pointer"
                      style={{ backgroundColor: "#203b67" }} // Applied color
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id!)}
                      className="flex items-center gap-1 text-white px-3 py-1 rounded cursor-pointer"
                      style={{ backgroundColor: "#203b67" }} // Applied color
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
