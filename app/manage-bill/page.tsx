"use client";

import { useEffect, useState } from "react";
import LayoutTailwind from "@/components/layouts/dashboards/layout-tailwind";
import CardDaisy from "@/components/cards/card-daisy";
import TableDaisy from "@/components/tables/table-daisy";
import { getHouses } from "@/api/house/get";
import { getBills } from "@/api/bill/get";
import { getManageBills } from "@/api/manage-bill/get";
import { getManageBillDetail } from "@/api/manage-bill/show";
import { createManageBill } from "@/api/manage-bill/create";
import { updateManageBill } from "@/api/manage-bill/update";
import { chageStatusBill } from "@/api/manage-bill/changeStatus";
import { deleteManageBill } from "@/api/manage-bill/delete";

type ManageBill = {
  id: number;
  status: string;
  payed_at: string | null;
  period_start_at: string;
  period_end_at: string;
  total_cost: number;
  created_at: string;
  house: any;
  bill: any;
  resident: any;
};

export default function ManageBillPage() {
  const [data, setData] = useState<ManageBill[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);

  const [houses, setHouses] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    period_start_at: "",
    period_end_at: "",
    house_id: 0,
    resident_id: 0,
    bill_id: 0,
  });

  const fetchManageBills = async (page: number) => {
    try {
      setLoading(true);

      const res = await getManageBills(page);
      const pagination = res.data.data;

      setData(pagination.data);
      setCurrentPage(pagination.current_page);
      setLastPage(pagination.last_page);
    } catch (err) {
      console.error("ERROR FETCH:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreateData = async () => {
    try {
      const [houseRes, billRes] = await Promise.all([
        getHouses(1),
        getBills(1),
      ]);

      const rawHouses = houseRes.data.data.data;

      const onlyOccupied = rawHouses.filter((h: any) => h.resident_id);

      setHouses(onlyOccupied);
      setBills(billRes.data.data.data);
    } catch (err) {
      console.error("ERROR FETCH CREATE DATA:", err);
    }
  };

  useEffect(() => {
    fetchManageBills(1);
  }, []);

  const formatCurrency = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  const formatDate = (val: string | null) =>
    val ? new Date(val).toLocaleDateString("id-ID") : "-";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "failed":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const handleCreate = async () => {
    await fetchCreateData();

    setForm({
      period_start_at: "",
      period_end_at: "",
      house_id: 0,
      resident_id: 0,
      bill_id: 0,
    });

    setCreateOpen(true);
  };

  const formatDateOnly = (val: string) => val?.split("T")[0];

  const handleStore = async () => {
    try {
      await createManageBill({
        ...form,
        period_start_at: formatDateOnly(form.period_start_at),
        period_end_at: formatDateOnly(form.period_end_at),
      });

      setCreateOpen(false);
      fetchManageBills(currentPage);
    } catch (err) {
      console.error("ERROR CREATE:", err);
    }
  };

  const handleSelectHouse = (houseId: number) => {
    const selected = houses.find((h) => h.id === houseId);

    setForm({
      ...form,
      house_id: houseId,
      resident_id: selected?.resident_id || 0,
    });
  };

  const handleEdit = async (manageBillId: number) => {
    try {
      const res = await getManageBillDetail(manageBillId);
      const detail = res.data.data;

      await fetchCreateData();

      setForm({
        period_start_at: detail.period_start_at,
        period_end_at: detail.period_end_at,
        house_id: detail.house_id,
        resident_id: detail.resident_id,
        bill_id: detail.bill_id,
      });

      setEditId(manageBillId);
      setEditOpen(true);
    } catch (error) {
      console.error("ERROR FETCH EDIT:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editId) return;

      console.log("PAYLOAD:", form);
      await updateManageBill(editId, {
        ...form,
        period_start_at: form.period_start_at,
        period_end_at: form.period_end_at,
      });

      setEditOpen(false);
      setEditId(null);
      fetchManageBills(currentPage);
    } catch (err) {
      console.error("ERROR UPDATE:", err);
    }
  };

  const handleChangeStatus = async (id: number) => {
    try {
      await chageStatusBill(id, {
        status: "paid",
      });

      fetchManageBills(currentPage);
    } catch (err) {
      console.error("ERROR CHANGE STATUS:", err);
    }
  };

  const handleDelete = async (manageBillId: number) => {
    try {
      await deleteManageBill(manageBillId);
      fetchManageBills(currentPage);
    } catch (error) {
      console.error("ERROR DELETE:", error);
    }
  };

  const columns = [
    {
      header: "Judul Tagihan",
      accessor: "bill",
      render: (bill: any) => (
        <span className="font-semibold">{bill.title}</span>
      ),
    },
    {
      header: "Ditagihkan Kepada",
      accessor: "resident",
      render: (resident: any) => (
        <span className="font-semibold">{resident.name}</span>
      ),
    },
    {
      header: "Rumah Nomor",
      accessor: "house",
      render: (house: any) => (
        <span className="font-semibold">{house.number_house}</span>
      ),
    },
    {
      header: "Total",
      accessor: "total_cost",
      render: (val: number) => (
        <span className="font-semibold">{formatCurrency(val)}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (status: string) => (
        <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
      ),
    },
    {
      header: "Aksi",
      accessor: "id",
      render: (id: number, row: any) => (
        <div className="flex gap-2">
          {row.status !== "paid" && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleChangeStatus(id)}
            >
              Telah Dibayar
            </button>
          )}
          {row.status !== "paid" && (
            <>
              <button
                className="btn btn-sm btn-warning"
                onClick={() => handleEdit(id)}
              >
                Edit
              </button>

              <button
                className="btn btn-sm btn-error"
                onClick={() => handleDelete(id)}
              >
                Hapus
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <LayoutTailwind title="Manage Bill">
      <CardDaisy title="List Manage Bill">
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
              {/* @ts-ignore */}
              <TableDaisy columns={columns} data={data} />

              <div className="flex justify-center mt-4 gap-2">
                <button
                  className="btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => fetchManageBills(currentPage - 1)}
                >
                  «
                </button>

                {[...Array(lastPage)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${
                      currentPage === i + 1 ? "btn-primary" : ""
                    }`}
                    onClick={() => fetchManageBills(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="btn btn-sm"
                  disabled={currentPage === lastPage}
                  onClick={() => fetchManageBills(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </>
          )}
        </div>
      </CardDaisy>

      {createOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Tambah Tagihan</h3>

            <div className="space-y-3 mt-4">
              {/* HOUSE */}
              <select
                className="select w-full"
                value={form.house_id}
                onChange={(e) => handleSelectHouse(Number(e.target.value))}
              >
                <option value={0}>Pilih Rumah</option>

                {houses
                  .filter((h) => h.resident_id)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      Rumah #{h.number_house}
                    </option>
                  ))}
              </select>

              {/* BILL */}
              <select
                className="select w-full"
                value={form.bill_id}
                onChange={(e) =>
                  setForm({ ...form, bill_id: Number(e.target.value) })
                }
              >
                <option value={0}>Pilih Jenis Tagihan</option>
                {bills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} - Rp {b.cost.toLocaleString()}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="input input-bordered w-full"
                value={form.period_start_at}
                onChange={(e) =>
                  setForm({ ...form, period_start_at: e.target.value })
                }
              />

              <input
                type="date"
                className="input input-bordered w-full"
                value={form.period_end_at}
                onChange={(e) =>
                  setForm({ ...form, period_end_at: e.target.value })
                }
              />

              {form.resident_id !== 0 && (
                <div className="text-sm text-gray-500">
                  Resident ID: <b>{form.resident_id}</b>
                </div>
              )}
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

      {editOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Tagihan</h3>

            <div className="space-y-3 mt-4">
              <select
                className="select w-full"
                value={form.house_id}
                onChange={(e) => handleSelectHouse(Number(e.target.value))}
              >
                <option value={0}>Pilih Rumah</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    Rumah #{h.number_house} - {h.resident?.name || "Penghuni"}
                  </option>
                ))}
              </select>

              <select
                className="select w-full"
                value={form.bill_id}
                onChange={(e) =>
                  setForm({ ...form, bill_id: Number(e.target.value) })
                }
              >
                <option value={0}>Pilih Jenis Tagihan</option>
                {bills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} - Rp {b.cost.toLocaleString()}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="input input-bordered w-full"
                value={form.period_start_at}
                onChange={(e) =>
                  setForm({ ...form, period_start_at: e.target.value })
                }
              />

              <input
                type="date"
                className="input input-bordered w-full"
                value={form.period_end_at}
                onChange={(e) =>
                  setForm({ ...form, period_end_at: e.target.value })
                }
              />

              {form.resident_id !== 0 && (
                <div className="text-sm text-gray-500">
                  Resident ID: <b>{form.resident_id}</b>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn btn-warning" onClick={handleUpdate}>
                Update
              </button>
              <button className="btn" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
            </div>
          </div>

          <div className="modal-backdrop" onClick={() => setEditOpen(false)} />
        </dialog>
      )}
    </LayoutTailwind>
  );
}
