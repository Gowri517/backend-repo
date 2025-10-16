let token = "";

const API = "http://localhost:3000";

// Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  const res = await fetch(`${API}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await res.json();
  alert(data.msg || data.error);
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login successful!");
    getProfile();
    fetchUsers();
  } else {
    alert(data.msg || data.error);
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("Logged out");
  document.getElementById("profile").innerHTML = "";
  document.getElementById("searchResults").innerHTML = "";
  document.querySelector("#usersTable tbody").innerHTML = "";
});

// Get Profile
async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  document.getElementById("profile").innerHTML = `<p>${data.name} (${data.role}) - ${data.email}</p>`;
}

// Search Users
document.getElementById("searchBtn").addEventListener("click", async () => {
  const name = document.getElementById("searchInput").value;
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first");

  const res = await fetch(`${API}/users/search?name=${name}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const users = await res.json();
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = users.length
    ? users.map(u => `<p>${u.name} - ${u.email} (${u.role})</p>`).join("")
    : "<p>No users found</p>";
});

// Fetch All Users for Dashboard
async function fetchUsers() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API}/users/search?name=`, { // empty name returns all users
    headers: { Authorization: `Bearer ${token}` }
  });
  const users = await res.json();
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";
  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input value="${u.name}" data-id="${u._id}" class="editName"></td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>
        <button class="updateBtn" data-id="${u._id}">Update</button>
        <button class="deleteBtn" data-id="${u._id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach Update Event
  document.querySelectorAll(".updateBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = document.querySelector(`.editName[data-id="${id}"]`).value;
      await fetch(`${API}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      alert("User updated");
      fetchUsers();
    });
  });

  // Attach Delete Event
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await fetch(`${API}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User deleted");
      fetchUsers();
    });
  });
}
