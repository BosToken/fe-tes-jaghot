"use client";

import { useEffect, useState } from "react";
import CardDaisy from "@/components/cards/card-daisy";
import TableDaisy from "@/components/tables/table-daisy";
import LayoutTailwind from "@/components/layouts/dashboards/layout-tailwind";
import { getResidents } from "@/api/resident/get";
import { createResident } from "@/api/resident/create";
import { updateResident } from "@/api/resident/update";
import { getResidentDetail } from "@/api/resident/show";
import { deleteResident } from "@/api/resident/delete";

type Resident = {
  id: number;
  id_card_number: string;
  name: string;
  id_card_photo: string | null;
  status: string;
  phone: string;
  is_married: boolean;
  houses: any | null;
};

export default function ResidentPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "storage";

  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    id_card_number: "",
    name: "",
    id_card_photo: null as File | null,
    status: "",
    phone: "",
    is_married: false,
  });

  const fetchResidents = async (page: number) => {
    try {
      setLoading(true);
      const res = await getResidents(page);
      const pagination = res.data.data;

      setResidents(pagination.data);
      setCurrentPage(pagination.current_page);
      setLastPage(pagination.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents(1);
  }, []);

  const handleCreate = () => {
    setForm({
      id_card_number: "",
      name: "",
      id_card_photo: null,
      status: "",
      phone: "",
      is_married: false,
    });
    setCreateOpen(true);
  };

  const handleStore = async () => {
    try {
      const formData = new FormData();

      formData.append("id_card_number", form.id_card_number);
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("status", form.status);
      formData.append("is_married", form.is_married ? "1" : "0");

      if (form.id_card_photo) {
        formData.append("id_card_photo", form.id_card_photo);
      }

      await createResident(formData as any);

      setCreateOpen(false);
      fetchResidents(currentPage);
    } catch (err: any) {
      console.log("CREATE ERROR:", err?.response?.data || err);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await getResidentDetail(id);
      const data = res.data.data;

      setEditId(id);
      setForm({
        id_card_number: data.id_card_number,
        name: data.name,
        id_card_photo: null,
        status: data.status,
        phone: data.phone,
        is_married: data.is_married,
      });

      setEditOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editId) return;

    try {
      const formData = new FormData();

      formData.append("id_card_number", form.id_card_number);
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("status", form.status);
      formData.append("is_married", form.is_married ? "1" : "0");

      if (form.id_card_photo) {
        formData.append("id_card_photo", form.id_card_photo);
      }

      await updateResident(editId, formData as any);

      setEditOpen(false);
      fetchResidents(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetail = async (id: number) => {
    const res = await getResidentDetail(id);
    setSelectedResident(res.data.data);
  };

  const handleDelete = async (id: number) => {
    await deleteResident(id);
    fetchResidents(currentPage);
  };

  const columns = [
    { header: "Nomor Kartu", accessor: "id_card_number" },
    { header: "Nama", accessor: "name" },
    { header: "Nomor Telepon", accessor: "phone" },
    {
      header: "Menikah",
      accessor: "is_married",
      render: (val: boolean) => (
        <span className={`badge ${val ? "badge-success" : "badge-error"}`}>
          {val ? "Sudah" : "Belum"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (status: string) => {
        const map: any = {
          permanent: "badge-success",
          contract: "badge-warning",
          inactive: "badge-error",
        };
        return <span className={`badge ${map[status]}`}>{status}</span>;
      },
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
    <LayoutTailwind title="Resident">
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
            // @ts-ignore
            <TableDaisy columns={columns} data={residents} />
          )}
        </div>

        <div className="flex justify-center mt-4 gap-2">
          <button
            className="btn btn-sm"
            disabled={currentPage === 1}
            onClick={() => fetchResidents(currentPage - 1)}
          >
            «
          </button>

          {[...Array(lastPage)].map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${
                currentPage === i + 1 ? "btn-primary" : ""
              }`}
              onClick={() => fetchResidents(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-sm"
            disabled={currentPage === lastPage}
            onClick={() => fetchResidents(currentPage + 1)}
          >
            »
          </button>
        </div>
      </CardDaisy>

      {createOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Tambah Penghuni</h3>

            <div className="space-y-3 mt-4">
              <input
                className="input w-full"
                placeholder="ID Card"
                type="number"
                onChange={(e) =>
                  setForm({ ...form, id_card_number: e.target.value })
                }
              />

              <input
                className="input w-full"
                placeholder="Nama"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="input w-full"
                placeholder="Phone"
                type="number"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <select
                className="select w-full"
                onChange={(e) =>
                  setForm({ ...form, is_married: e.target.value === "1" })
                }
              >
                <option value="0">Belum</option>
                <option value="1">Sudah</option>
              </select>

              <select
                className="select w-full"
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="">Pilih Status</option>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="inactive">Inactive</option>
              </select>

              <input
                type="file"
                className="file-input w-full"
                onChange={(e) =>
                  setForm({
                    ...form,
                    id_card_photo: e.target.files?.[0] || null,
                  })
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
        </dialog>
      )}

      {selectedResident && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Detail</h3>
            <p>Nama : {selectedResident.name}</p>
            <p>Nomor Kartu :{selectedResident.id_card_number}</p>
            <p>Status : {selectedResident.status.toUpperCase()}</p>
            <div className="text-center">
              {selectedResident.id_card_photo ? (
                <figure>
                  <img
                    src={`${BASE_URL}/${selectedResident.id_card_photo}`}
                    alt="Card ID"
                    className="mx-auto mt-8"
                  />
                </figure>
              ) : (
                "Tidak ada ID Card"
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedResident(null)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {editOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Penghuni</h3>

            <div className="space-y-3 mt-4">
              <input
                className="input w-full"
                value={form.id_card_number}
                type="number"
                onChange={(e) =>
                  setForm({ ...form, id_card_number: e.target.value })
                }
              />

              <input
                className="input w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="input w-full"
                value={form.phone}
                type="number"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <select
                className="select w-full"
                value={form.is_married ? "1" : "0"}
                onChange={(e) =>
                  setForm({ ...form, is_married: e.target.value === "1" })
                }
              >
                <option value="0">Belum</option>
                <option value="1">Sudah</option>
              </select>

              <select
                className="select w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="inactive">Inactive</option>
              </select>

              <input
                type="file"
                className="file-input w-full"
                onChange={(e) =>
                  setForm({
                    ...form,
                    id_card_photo: e.target.files?.[0] || null,
                  })
                }
              />

              <p className="text-xs text-gray-400">
                Kosongkan jika tidak ingin mengganti foto
              </p>
            </div>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleUpdate}>
                Update
              </button>
              <button className="btn" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </LayoutTailwind>
  );
}
