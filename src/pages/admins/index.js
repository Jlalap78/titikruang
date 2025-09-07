import { useEffect, useState } from "react";

export default function AdminPage() {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admins");
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        const data = await res.json();
        setUserList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Daftar User</h1>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nama</th>
              <th>Provider</th>
              <th>Tanggal Daftar</th>
              <th>UID</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, i) => (
              <tr key={user.uid || i}>
                <td>{user.email || "-"}</td>
                <td>{user.name || "-"}</td>
                <td>
                  {Array.isArray(user.provider)
                    ? user.provider.join(", ")
                    : user.provider || "-"}
                </td>
                <td>
                  {user.created ? new Date(user.created).toLocaleString() : "-"}
                </td>
                <td>{user.uid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

