import useSWR from "swr";

type User = {
  id: string;
  email: string;
  about?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  birthDate?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DataPage() {
  const { data: users, error } = useSWR<User[]>("/api/users", fetcher);

  if (error) return <p>Failed to load users.</p>;
  if (!users) return <p>Loading…</p>;

  return (
    <table
      border={1}
      cellPadding={5}
      style={{ margin: "20px auto", borderCollapse: "collapse" }}
    >
      <thead>
        <tr>
          <th>Email</th>
          <th>About</th>
          <th>Address</th>
          <th>Birth Date</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.email}</td>
            <td>{u.about || "-"}</td>
            <td>
              {u.street
                ? `${u.street}, ${u.city}, ${u.state} ${u.zip}`
                : "-"}
            </td>
            <td>{u.birthDate ? u.birthDate.slice(0, 10) : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
