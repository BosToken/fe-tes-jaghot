"use client";

import { useEffect, useState } from "react";
import CardDaisy from "@/components/cards/card-daisy";
import TableDaisy from "@/components/tables/table-daisy";
import LayoutTailwind from "@/components/layouts/dashboards/layout-tailwind";
import { getResidents } from "@/api/resident/get";
import { getHouses } from "@/api/house/get";
import { getHouseDetail } from "@/api/house/show";
import { getHouseLogs } from "@/api/house/showLog";
import { getHouseBills } from "@/api/house/showBills";
import { deleteHouse } from "@/api/house/delete";
import { createHouse } from "@/api/house/create";
import { updateHouse } from "@/api/house/update";
import { updateResidentHouse } from "@/api/house/updateResident";
import { removeResidentHouse } from "@/api/house/removeResident";

type House = {
  id: number;
  number_house: string;
  address: string;
  resident_id: number;
  resident?: {
    name: string;
  };
};

export default function HousePage() {
  type HouseLog = {
    id: number;
    title: string;
    description: string;
    json_data: string;
    created_at: string;
  };

  const normalizeKey = (key: string) => {
    const map: Record<string, string> = {
      resident_id: "Resident",
      created_at: "Waktu",
      title: "Judul",
      status: "Status",
      payed_at: "Tanggal Bayar",
      period_start_at: "Periode Mulai",
      period_end_at: "Periode Selesai",
    };

    if (map[key]) return map[key];

    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatValue = (key: string, value: any) => {
    if (value === null) return "-";

    if (typeof value === "number" && key.includes("created_at")) {
      return new Date(value * 1000).toLocaleString();
    }

    if (typeof value === "string" && value.includes("T")) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }

    return String(value);
  };

  type HouseBill = {
    id: number;
    status: string;
    payed_at: string | null;
    period_start_at: string;
    period_end_at: string;
    total_cost: number;
    bill: any;
    resident: any;
    created_at: string;
  };

  const [bills, setBills] = useState<HouseBill[]>([]);
  const [billOpen, setBillOpen] = useState(false);
  const [loadingBill, setLoadingBill] = useState(false);
  const [logs, setLogs] = useState<HouseLog[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);
  const [manageHouseId, setManageHouseId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [residents, setResidents] = useState<any[]>([]);
  const [residentPage, setResidentPage] = useState(1);
  const [residentLastPage, setResidentLastPage] = useState(1);
  const [loadingResident, setLoadingResident] = useState(false);

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  const [editHouse, setEditHouse] = useState<House | null>(null);
  const [form, setForm] = useState({
    number_house: "",
    address: "",
  });

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "unpaid":
        return "badge-error";
      default:
        return "badge";
    }
  };

  const fetchHouses = async (page: number) => {
    try {
      setLoading(true);
      const res = await getHouses(page);

      const pagination = res.data.data;

      setHouses(pagination.data);
      setCurrentPage(pagination.current_page);
      setLastPage(pagination.last_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses(1);
  }, []);

  const fetchResidents = async (page: number) => {
    try {
      setLoadingResident(true);

      const res = await getResidents(page);
      const pagination = res.data.data;

      const filtered = pagination.data.filter(
        (r: any) => !r.houses || r.houses.length === 0,
      );

      setResidents(filtered);
      setResidentPage(pagination.current_page);
      setResidentLastPage(pagination.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResident(false);
    }
  };

  const handleAssignResident = async (residentId: number) => {
    if (!manageHouseId) return;

    try {
      await updateResidentHouse(manageHouseId, {
        resident_id: residentId,
      });

      setManageHouseId(null);
      fetchHouses(currentPage);
    } catch (err: any) {
      console.log("FULL ERROR:", err);
    }
  };

  const handleHouseLogs = async (houseId: number) => {
    try {
      setLoadingLog(true);

      const res = await getHouseLogs(houseId);

      setLogs(res.data.data);
      setLogOpen(true);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoadingLog(false);
    }
  };

  const handleHouseBills = async (houseId: number) => {
    try {
      setLoadingBill(true);

      const res = await getHouseBills(houseId);

      setBills(res.data.data);
      setBillOpen(true);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoadingBill(false);
    }
  };

  const handleRemoveResident = async (houseId: number) => {
    if (!houseId) return;

    try {
      await removeResidentHouse(houseId);
      setManageHouseId(null);
      fetchHouses(currentPage);
    } catch (err: any) {
      console.log("FULL ERROR:", err);
    }
  };

  const handleCreate = () => {
    setForm({
      number_house: "",
      address: "",
    });
    setCreateOpen(true);
  };

  const handleStore = async () => {
    try {
      await createHouse(form);

      setCreateOpen(false);
      fetchHouses(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetail = async (id: number) => {
    const res = await getHouseDetail(id);
    setSelectedHouse(res.data.data);
  };

  const handleEdit = async (id: number) => {
    const res = await getHouseDetail(id);
    const data = res.data.data;

    setEditHouse(data);
    setForm({
      number_house: data.number_house,
      address: data.address,
    });
  };

  const handleManageResident = async (houseId: number) => {
    setManageHouseId(houseId);
    fetchResidents(1);
  };

  const handleUpdate = async () => {
    if (!editHouse) return;

    try {
      await updateHouse(editHouse.id, form);

      setEditHouse(null);
      fetchHouses(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteHouse(id);
    fetchHouses(currentPage);
  };

  const columns = [
    { header: "Nomor Rumah", accessor: "number_house" },
    { header: "Alamat", accessor: "address" },
    {
      header: "Status",
      accessor: "resident_id",
      render: (resident_id: number) => (
        <span
          className={`badge ${resident_id ? "badge-success" : "badge-error"}`}
        >
          {resident_id ? "Ditempati" : "Kosong"}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: "id",
      render: (id: number) => (
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleDetail(id)}
          >
            Detail
          </button>
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleEdit(id)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-info"
            onClick={() => handleManageResident(id)}
          >
            Manage Resident
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={() => handleDelete(id)}
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <LayoutTailwind title="House">
      <CardDaisy title="">
        <CardDaisy title="">
          <div className="grid grid-cols-9 gap-2">
            <div>
              <button className="btn" onClick={handleCreate}>
                Tambah
              </button>
            </div>
          </div>
        </CardDaisy>

        <div className="mt-2">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <TableDaisy
                // @ts-ignore
                columns={columns}
                data={houses}
              />

              <div className="flex justify-center mt-4 gap-2">
                <button
                  className="btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => fetchHouses(currentPage - 1)}
                >
                  «
                </button>

                {[...Array(lastPage)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${
                      currentPage === i + 1 ? "btn-primary" : ""
                    }`}
                    onClick={() => fetchHouses(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="btn btn-sm"
                  disabled={currentPage === lastPage}
                  onClick={() => fetchHouses(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </>
          )}
        </div>
      </CardDaisy>

      {selectedHouse && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Detail</h3>
            <p>Nomor Rumah : {selectedHouse.number_house}</p>
            <p>
              Nama Resident :{" "}
              {selectedHouse.resident?.name || "Tidak ada resident"}
            </p>
            <p>
              Nomor Telpon :{" "}
              {
                // @ts-ignore
                selectedHouse.resident?.phone || "Tidak ada nomor telpon"
              }
            </p>

            <div className="modal-action">
              <button
                className="btn btn-info"
                onClick={() => handleHouseBills(selectedHouse.id)}
              >
                Tagihan
              </button>
              <button
                className="btn btn-warning"
                onClick={() => handleHouseLogs(selectedHouse.id)}
              >
                History
              </button>
              <button className="btn" onClick={() => setSelectedHouse(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {createOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Tambah Rumah</h3>

            <div className="py-4 space-y-3">
              <input
                type="text"
                placeholder="Nomor Rumah"
                className="input input-bordered w-full"
                value={form.number_house}
                onChange={(e) =>
                  setForm({ ...form, number_house: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Alamat"
                className="input input-bordered w-full"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleStore}>
                Save
              </button>
              <button className="btn" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
            </div>
          </div>

          <div
            className="modal-backdrop"
            onClick={() => setCreateOpen(false)}
          />
        </dialog>
      )}

      {editHouse && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Rumah</h3>

            <div className="py-4 space-y-3">
              <input
                type="text"
                placeholder="Nomor Rumah"
                className="input input-bordered w-full"
                value={form.number_house}
                onChange={(e) =>
                  setForm({ ...form, number_house: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Alamat"
                className="input input-bordered w-full"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleUpdate}>
                Save
              </button>
              <button className="btn" onClick={() => setEditHouse(null)}>
                Cancel
              </button>
            </div>
          </div>

          <div className="modal-backdrop" onClick={() => setEditHouse(null)} />
        </dialog>
      )}

      {manageHouseId && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <h3 className="font-bold text-lg">Pilih Resident</h3>

            {loadingResident ? (
              <p className="py-4">Loading...</p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Daftar Resident</h3>

                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleRemoveResident(manageHouseId)}
                  >
                    Remove Resident
                  </button>
                </div>

                <table className="table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Phone</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map((r: any) => (
                      <tr key={r.id}>
                        <td>{r.name}</td>
                        <td>{r.phone}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAssignResident(r.id)}
                          >
                            Pilih
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-center mt-4 gap-2">
                  <button
                    className="btn btn-sm"
                    disabled={residentPage === 1}
                    onClick={() => fetchResidents(residentPage - 1)}
                  >
                    «
                  </button>

                  {[...Array(residentLastPage)].map((_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${
                        residentPage === i + 1 ? "btn-primary" : ""
                      }`}
                      onClick={() => fetchResidents(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="btn btn-sm"
                    disabled={residentPage === residentLastPage}
                    onClick={() => fetchResidents(residentPage + 1)}
                  >
                    »
                  </button>
                </div>
              </>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setManageHouseId(null)}>
                Close
              </button>
            </div>
          </div>

          <div
            className="modal-backdrop"
            onClick={() => setManageHouseId(null)}
          />
        </dialog>
      )}

      {logOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <h3 className="font-bold text-lg mb-3">House Logs</h3>

            {loadingLog ? (
              <p>Loading...</p>
            ) : logs.length === 0 ? (
              <p>Tidak ada log</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {logs.map((log) => {
                  let jsonData: any = {};
                  try {
                    jsonData = JSON.parse(log.json_data);
                  } catch (e) {}

                  return (
                    <div
                      key={log.id}
                      className="card bg-base-100 shadow border"
                    >
                      <div className="card-body p-4">
                        <h4 className="font-semibold text-primary">
                          {log.title}
                        </h4>

                        {Object.keys(jsonData).length > 0 && (
                          <div className="mt-3 space-y-1">
                            {Object.entries(jsonData).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between text-sm border-b py-1"
                              >
                                <span className="font-medium text-gray-500">
                                  {normalizeKey(key)}
                                </span>
                                <span className="text-right">
                                  {formatValue(key, value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setLogOpen(false)}>
                Close
              </button>
            </div>
          </div>

          <div className="modal-backdrop" onClick={() => setLogOpen(false)} />
        </dialog>
      )}

      {billOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <h3 className="font-bold text-lg mb-3">House Bills</h3>

            {loadingBill ? (
              <p>Loading...</p>
            ) : bills.filter((b) => b.status === "pending").length === 0 ? (
              <p>Tidak ada tagihan pending</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {bills
                  .filter((bill) => bill.status === "pending")
                  .map((bill, index) => (
                    <div
                      key={bill.id}
                      className="card bg-base-100 shadow border"
                    >
                      <div className="card-body p-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">
                            Tagihan #{index + 1}
                          </h4>

                          <span
                            className={`badge ${getStatusBadge(bill.status)}`}
                          >
                            {bill.status}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Periode</span>
                            <span>
                              {formatDate(bill.period_start_at)} -{" "}
                              {formatDate(bill.period_end_at)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-500">Judul Tagihan</span>
                            <span className="font-semibold">
                              {bill.bill?.title}
                            </span>
                          </div>

                          
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ditagihkan Kepada</span>
                            <span className="font-semibold">
                              {bill.resident?.name}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-500">Total</span>
                            <span className="font-semibold">
                              {formatCurrency(bill.total_cost)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-500">Dibayar</span>
                            <span>
                              {bill.payed_at ? formatDate(bill.payed_at) : "-"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          Dibuat: {new Date(bill.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setBillOpen(false)}>
                Close
              </button>
            </div>
          </div>

          <div className="modal-backdrop" onClick={() => setBillOpen(false)} />
        </dialog>
      )}
    </LayoutTailwind>
  );
}
