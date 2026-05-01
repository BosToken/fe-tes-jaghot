"use client";

import { useEffect, useMemo, useState } from "react";
import LayoutTailwind from "@/components/layouts/dashboards/layout-tailwind";
import CardDaisy from "@/components/cards/card-daisy";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

import { getPaids } from "@/api/report/getPaid";
import { getExpenses } from "@/api/report/getExpense";
import { getTotalMoney } from "@/api/report/getTotalMoney";
import { getBills } from "@/api/bill/get";

type Bill = {
  id: number;
  title: string;
};

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState({
    start_date: "",
    end_date: "",
    bill_id: 0,
  });

  const [paids, setPaids] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalMoney, setTotalMoney] = useState<any[]>([]);

  // ================= FETCH =================
  const fetchBills = async () => {
    const res = await getBills(1);
    setBills(res.data.data.data);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paidRes, expenseRes, totalRes] = await Promise.all([
        getPaids(filter.start_date, filter.end_date, filter.bill_id),
        getExpenses(filter.start_date, filter.end_date, filter.bill_id),
        getTotalMoney(filter.bill_id),
      ]);

      setPaids(paidRes.data.data || []);
      setExpenses(expenseRes.data.data || []);
      setTotalMoney(totalRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchData();
  }, []);

  // ================= GROUP =================
  const groupByMonth = (data: any[], key: string) => {
    const map: Record<string, number> = {};

    data.forEach((item) => {
      if (!item.created_at) return;

      const date = new Date(item.created_at);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      const value =
        key === "paid"
          ? Number(item.total_cost || 0)
          : Number(item.amount || 0);

      map[month] = (map[month] || 0) + value;
    });

    return Object.keys(map).map((month) => ({
      month,
      value: map[month],
    }));
  };

  const paidChart = useMemo(() => groupByMonth(paids, "paid"), [paids]);
  const expenseChart = useMemo(
    () => groupByMonth(expenses, "expense"),
    [expenses],
  );

  const totalChart = useMemo(() => {
    return totalMoney.map((t: any) => ({
      name: t.bill?.title || "Total",
      value: Number(t.amount || 0),
    }));
  }, [totalMoney]);

  return (
    <LayoutTailwind title="Dashboard Report">
      <div className="space-y-6">
        {/* FILTER */}
        <div className="py-2">
          <CardDaisy title="Filter">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* LEFT SIDE */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1 py-2">
                <div className="w-full sm:w-[180px]">
                  <label className="block text-xs font-medium text-base-content/70 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filter.start_date}
                    onChange={(e) =>
                      setFilter({ ...filter, start_date: e.target.value })
                    }
                  />
                </div>

                <div className="w-full sm:w-[180px]">
                  <label className="block text-xs font-medium text-base-content/70 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filter.end_date}
                    onChange={(e) =>
                      setFilter({ ...filter, end_date: e.target.value })
                    }
                  />
                </div>

                <div className="w-full sm:w-[220px]">
                  <label className="block text-xs font-medium text-base-content/70 mb-2">
                    Bill
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filter.bill_id}
                    onChange={(e) =>
                      setFilter({ ...filter, bill_id: Number(e.target.value) })
                    }
                  >
                    <option value={0}>All Bill</option>
                    {bills.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <button
                className={`btn btn-primary min-w-[120px] ${
                  loading ? "loading" : ""
                }`}
                onClick={fetchData}
              >
                Apply Filter
              </button>
            </div>
          </CardDaisy>
        </div>

        {/* CHART GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INCOME */}
          <div className="py-2">
            <CardDaisy title="Income (Paid)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paidChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardDaisy>
          </div>

          {/* EXPENSE */}
          <div className="py-2">
            <CardDaisy title="Expense">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardDaisy>
          </div>
        </div>

        {/* TOTAL */}
        <div className="py-2">
          <CardDaisy title="Total Money per Bill">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={totalChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardDaisy>
        </div>
      </div>
    </LayoutTailwind>
  );
}
