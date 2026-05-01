"use client";

import { useEffect, useState } from "react";
import CardDaisy from "@/components/cards/card-daisy";
import TableDaisy from "@/components/tables/table-daisy";
import LayoutTailwind from "@/components/layouts/dashboards/layout-tailwind";
import { getBills } from "@/api/bill/get";
import { createBill } from "@/api/bill/create";
import { getBillDetail } from "@/api/bill/show";
import { updateBill } from "@/api/bill/update";
import { deleteBill } from "@/api/bill/delete";

type Bill = {
  id: number;
  title: string;
  cost: number;
  is_monthly: boolean;
};

export default function BillPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [form, setForm] = useState({
    title: "",
    cost: 0,
    is_monthly: false,
  });

  const [createOpen, setCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    cost: 0,
    is_monthly: false,
  });

  const fetchBills = async (page: number) => {
    try {
      setLoading(true);
      const res = await getBills(page);

      const pagination = res.data.data;

      setBills(pagination.data);
      setCurrentPage(pagination.current_page);
      setLastPage(pagination.last_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills(1);
  }, []);

  const handleEdit = async (id: number) => {
    try {
      const res = await getBillDetail(id);
      const data = res.data.data;

      setEditBill(data);
      setForm({
        title: data.title,
        cost: data.cost,
        is_monthly: data.is_monthly,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editBill) return;

    try {
      await updateBill(editBill.id, form);
      setEditBill(null);
      fetchBills(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    setCreateForm({
      title: "",
      cost: 0,
      is_monthly: false,
    });
    setCreateOpen(true);
  };

  const handleStore = async () => {
    try {
      await createBill(createForm);

      setCreateOpen(false);
      fetchBills(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteBill(id);
    fetchBills(currentPage);
  };

  const columns = [
    { header: "Nama Tagihan", accessor: "title" },
    {
      header: "Cost",
      accessor: "cost",
      render: (cost: number) => <span>Rp {cost.toLocaleString()}</span>,
    },
    {
      header: "Tipe",
      accessor: "is_monthly",
      render: (is_monthly: boolean) => (
        <span
          className={`badge ${is_monthly ? "badge-info" : "badge-warning"}`}
        >
          {is_monthly ? "Bulanan" : "Sekali"}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: "id",
      render: (id: number) => (
        <div className="flex gap-2">
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
        </div>
      ),
    },
  ];

  return (
    <LayoutTailwind title="Bill">
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
                data={bills}
              />

              <div className="flex justify-center mt-4 gap-2">
                <button
                  className="btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => fetchBills(currentPage - 1)}
                >
                  «
                </button>

                {[...Array(lastPage)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${
                      currentPage === i + 1 ? "btn-primary" : ""
                    }`}
                    onClick={() => fetchBills(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="btn btn-sm"
                  disabled={currentPage === lastPage}
                  onClick={() => fetchBills(currentPage + 1)}
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

            <div className="py-4 space-y-3">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Nama Tagihan"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
              />

              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Cost"
                value={createForm.cost}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    cost: Number(e.target.value),
                  })
                }
              />

              <select
                className="select select-bordered w-full"
                value={createForm.is_monthly ? "1" : "0"}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    is_monthly: e.target.value === "1",
                  })
                }
              >
                <option value="1">Bulanan</option>
                <option value="0">Sekali</option>
              </select>
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

      {editBill && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Tagihan</h3>

            <div className="py-4 space-y-3">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Nama Tagihan"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Cost"
                value={form.cost}
                onChange={(e) =>
                  setForm({ ...form, cost: Number(e.target.value) })
                }
              />

              <select
                className="select select-bordered w-full"
                value={form.is_monthly ? "1" : "0"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_monthly: e.target.value === "1",
                  })
                }
              >
                <option value="1">Bulanan</option>
                <option value="0">Sekali</option>
              </select>
            </div>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleUpdate}>
                Save
              </button>
              <button className="btn" onClick={() => setEditBill(null)}>
                Cancel
              </button>
            </div>
          </div>

          <div className="modal-backdrop" onClick={() => setEditBill(null)} />
        </dialog>
      )}
    </LayoutTailwind>
  );
}
