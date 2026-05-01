"use client";

import { useEffect, useState } from "react";
import CardDaisy from "@/components/cards/card-daisy";
import TableDaisy from "@/components/tables/table-daisy";
import LayoutTailwind from "@/components/layouts/dashboards/layout-tailwind";
import { getBills } from "@/api/bill/get";
import { getExpenses } from "@/api/expense/get";
import { createExpense } from "@/api/expense/create";
import { deleteExpense } from "@/api/expense/delete";

type Expense = {
  id: number;
  bill_id: number;
  amount: number;
  description: string;
  bill: any;
};

export default function ExpensePage() {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [bills, setBills] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);

  const [form, setForm] = useState({
    bill_id: 0,
    amount: 0,
    description: "",
  });

  // ================= FETCH =================
  const fetchExpenses = async (page: number) => {
    try {
      setLoading(true);
      const res = await getExpenses(page);
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

  const fetchBills = async () => {
    try {
      const res = await getBills(1);
      setBills(res.data.data.data);
    } catch (err) {
      console.error("ERROR FETCH BILL:", err);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
  }, []);

  // ================= ACTION =================
  const handleCreate = async () => {
    await fetchBills();

    setForm({
      bill_id: 0,
      amount: 0,
      description: "",
    });

    setCreateOpen(true);
  };

  const handleStore = async () => {
    try {
      await createExpense(form);

      setCreateOpen(false);
      fetchExpenses(currentPage);
    } catch (err) {
      console.error("ERROR CREATE:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense(id);
      fetchExpenses(currentPage);
    } catch (err) {
      console.error("ERROR DELETE:", err);
    }
  };

  // ================= HELPER =================
  const formatCurrency = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // ================= TABLE =================
  const columns = [
    {
      header: "Jenis Tagihan",
      accessor: "bill",
      render: (bill: any) => (
        <span className="font-semibold">{bill?.title}</span>
      ),
    },
    {
      header: "Jumlah",
      accessor: "amount",
      render: (val: number) => (
        <span className="font-semibold text-error">{formatCurrency(val)}</span>
      ),
    },
    {
      header: "Deskripsi",
      accessor: "description",
    },
    {
      header: "Aksi",
      accessor: "id",
      render: (id: number) => (
        <button
          className="btn btn-sm btn-error"
          onClick={() => handleDelete(id)}
        >
          Hapus
        </button>
      ),
    },
  ];

  return (
    <LayoutTailwind title="Expense">
      <CardDaisy title="List Pengeluaran">
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

              {/* PAGINATION */}
              <div className="flex justify-center mt-4 gap-2">
                <button
                  className="btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => fetchExpenses(currentPage - 1)}
                >
                  «
                </button>

                {[...Array(lastPage)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${
                      currentPage === i + 1 ? "btn-primary" : ""
                    }`}
                    onClick={() => fetchExpenses(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="btn btn-sm"
                  disabled={currentPage === lastPage}
                  onClick={() => fetchExpenses(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </>
          )}
        </div>
      </CardDaisy>

      {/* CREATE MODAL */}
      {createOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Tambah Pengeluaran</h3>

            <div className="space-y-3 mt-4">
              {/* BILL */}
              <select
                className="select w-full"
                value={form.bill_id}
                onChange={(e) =>
                  setForm({ ...form, bill_id: Number(e.target.value) })
                }
              >
                <option value={0}>Pilih Tagihan</option>
                {bills.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>

              {/* AMOUNT */}
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Jumlah"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />

              {/* DESCRIPTION */}
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Deskripsi"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
    </LayoutTailwind>
  );
}
